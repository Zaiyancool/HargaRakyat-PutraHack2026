import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { headlines } = await req.json();

    if (!headlines || !Array.isArray(headlines) || headlines.length === 0) {
      return new Response(
        JSON.stringify({ error: "No headlines provided" }),
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

    const headlineList = headlines
      .slice(0, 15)
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
