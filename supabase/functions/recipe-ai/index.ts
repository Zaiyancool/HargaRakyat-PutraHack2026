import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, query, recipe, items, servings } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "search") {
      // Generate recipe suggestions based on query
      systemPrompt = `You are a Malaysian recipe expert. Generate 6 popular Malaysian recipes matching the user's query.
Return ONLY valid JSON array, no markdown. Each object must have:
- name: recipe name (in English)
- name_ms: recipe name in Bahasa Melayu
- description: 1-sentence description
- cuisine: "Malay" | "Chinese" | "Indian" | "Sabah/Sarawak" | "Fusion"
- difficulty: "Easy" | "Medium" | "Hard"
- time_minutes: cooking time in minutes
- servings: default servings (number)
- image_emoji: a single food emoji that represents the dish`;

      userPrompt = query
        ? `Find Malaysian recipes matching: "${query}"`
        : "Suggest 6 popular Malaysian recipes covering different cuisines";
    } else if (action === "details") {
      // Generate full recipe with ingredients mapped to PriceCatcher items
      const itemsList = (items || [])
        .map((i: { c: number; n: string; u: string }) => `Code ${i.c}: ${i.n} (${i.u})`)
        .join("\n");

      systemPrompt = `You are a Malaysian recipe expert. Generate a detailed recipe with ingredients mapped to the PriceCatcher database items below.

Available PriceCatcher items:
${itemsList.slice(0, 8000)}

Return ONLY valid JSON with this structure:
{
  "name": "Recipe Name",
  "name_ms": "Nama Resipi",
  "description": "Brief description",
  "servings": ${servings || 4},
  "time_minutes": 30,
  "difficulty": "Easy",
  "steps": ["Step 1...", "Step 2..."],
  "ingredients": [
    {
      "name": "Ingredient name",
      "quantity": "500g",
      "item_code": 1,
      "matched": true
    }
  ]
}

Rules:
- Map as many ingredients as possible to PriceCatcher item codes
- For items NOT in the database, set item_code to null and matched to false
- Use realistic quantities for ${servings || 4} servings
- Include all essential ingredients including spices and condiments`;

      userPrompt = `Generate a complete recipe for: ${recipe}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      console.error("Failed to parse AI JSON:", content);
      return new Response(JSON.stringify({ error: "Failed to parse recipe data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recipe-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
