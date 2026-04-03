import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://localhost:8080",
  "https://localhost:5173",
];

const baseCorsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
};

const MAX_CONTEXT_LENGTH = 4000;
const MAX_MESSAGE_LENGTH = 500;
const MAX_MESSAGES = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

type RateLimitEntry = { count: number; resetAt: number };

const globalState = globalThis as unknown as {
  __hargarakyatChatRateLimit?: Map<string, RateLimitEntry>;
};

const rateLimitStore = globalState.__hargarakyatChatRateLimit ?? new Map<string, RateLimitEntry>();
globalState.__hargarakyatChatRateLimit = rateLimitStore;

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const configuredOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = [...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins];
  const allowOrigin = !origin || allowedOrigins.includes(origin);

  return {
    ...baseCorsHeaders,
    "Access-Control-Allow-Origin": allowOrigin ? (origin || allowedOrigins[0] || DEFAULT_ALLOWED_ORIGINS[0]) : "null",
    allowOrigin,
  };
}

function safeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x1f\x7f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = req.headers.get("x-real-ip")?.trim();
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  return forwarded || realIp || cfIp || "unknown";
}

function checkRateLimit(clientId: string) {
  const now = Date.now();
  const current = rateLimitStore.get(clientId);

  if (!current || now >= current.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(clientId, { count: 1, resetAt });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt };
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  rateLimitStore.set(clientId, current);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - current.count, resetAt: current.resetAt };
}

serve(async (req) => {
  const cors = getCorsHeaders(req);
  const corsHeaders = {
    "Access-Control-Allow-Origin": cors["Access-Control-Allow-Origin"],
    "Access-Control-Allow-Headers": cors["Access-Control-Allow-Headers"],
    "Access-Control-Allow-Methods": cors["Access-Control-Allow-Methods"],
    Vary: cors.Vary,
  };

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!cors.allowOrigin) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const clientId = getClientId(req);
  const rateLimit = checkRateLimit(clientId);
  if (!rateLimit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    });
  }

  try {
    const { messages, context } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages must be a non-empty array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: `Too many messages. Max ${MAX_MESSAGES}.` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedMessages = messages.map((m: { role?: string; content?: unknown }) => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: safeText(m?.content, MAX_MESSAGE_LENGTH),
    }));

    if (normalizedMessages.some((m) => m.content.length === 0)) {
      return new Response(JSON.stringify({ error: "Each message must include non-empty content" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeContext = safeText(context, MAX_CONTEXT_LENGTH);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are HargaRakyat AI advisor — a Malaysian grocery price intelligence assistant.

You help users make smart purchasing decisions based on real government price data from KPDN PriceCatcher (data.gov.my).

Your capabilities:
- Advise when to buy items based on price trends
- Suggest cheaper alternatives
- Explain seasonal price patterns for Malaysian groceries
- Recommend buying strategies to save money
- Answer questions about food prices in Malaysia

${safeContext ? `Current data context:\n${safeContext}` : ""}

Guidelines:
- Be concise and actionable (2-3 sentences max per point)
- Use RM for prices
- Respond in the same language the user uses (English or Bahasa Melayu)
- When discussing trends, reference the 6-month historical data (Oct 2025 – Mar 2026)
- If you don't have specific data, say so honestly
- Format prices with font emphasis where helpful`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...normalizedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
