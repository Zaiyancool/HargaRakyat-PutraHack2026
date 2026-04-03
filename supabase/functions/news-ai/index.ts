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

const MAX_HEADLINES = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

type RateLimitEntry = { count: number; resetAt: number };

const globalState = globalThis as unknown as {
  __hargarakyatNewsRateLimit?: Map<string, RateLimitEntry>;
};

const rateLimitStore = globalState.__hargarakyatNewsRateLimit ?? new Map<string, RateLimitEntry>();
globalState.__hargarakyatNewsRateLimit = rateLimitStore;

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

function safeText(value: unknown, maxLength = 250): string {
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

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
    const { headlines } = await req.json();

    if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
      return new Response(
        JSON.stringify({ error: "No headlines provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (headlines.length > MAX_HEADLINES) {
      return new Response(
        JSON.stringify({ error: `Too many headlines. Max ${MAX_HEADLINES}.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedHeadlines = headlines
      .slice(0, MAX_HEADLINES)
      .map((h: { headline?: unknown; impact?: unknown; category?: unknown; date?: unknown }) => ({
        headline: safeText(h.headline),
        impact: safeText(h.impact, 20),
        category: safeText(h.category, 60),
        date: safeText(h.date, 40),
      }))
      .filter((h) => h.headline.length > 0);

    if (sanitizedHeadlines.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid headlines provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headlineList = sanitizedHeadlines
      .map((h: { headline: string; impact: string; category: string; date: string }, i: number) =>
        `${i + 1}. [${h.impact?.toUpperCase() ?? "NEUTRAL"}] ${h.headline} (${h.category}, ${h.date})`
      )
      .join("\n");

    const systemPrompt = `You are a Malaysian food price market analyst for HargaRakyat, a consumer intelligence platform. Write a concise market intelligence brief (150-200 words) analyzing the latest news headlines about Malaysian food prices. Focus on:
- Key price trends (what's going up/down and why)
- Policy impacts (subsidies, price controls)
- Supply chain factors (weather, imports, currency)
- Actionable advice for Malaysian consumers

Write in a professional but accessible tone. Use RM (Ringgit Malaysia) for currency. Be specific about items and percentages when possible. Do NOT use markdown headers — write flowing paragraphs.`;

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
          {
            role: "user",
            content: `Here are the latest Malaysian food price news headlines:\n\n${headlineList}\n\nProvide a market intelligence brief based on these signals.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const brief = data.choices?.[0]?.message?.content ?? "Unable to generate summary.";

    return new Response(
      JSON.stringify({ brief, generated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("news-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
