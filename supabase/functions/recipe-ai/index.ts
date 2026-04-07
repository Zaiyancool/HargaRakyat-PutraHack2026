import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, items } = await req.json();

    if (!query || typeof query !== "string" || query.length < 2 || query.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a compact item list for the AI to reference
    const itemList = (items || [])
      .slice(0, 200)
      .map((i: { c: number; n: string; u: string }) => `${i.c}|${i.n}|${i.u}`)
      .join("\n");

    const systemPrompt = `You are a Malaysian recipe expert. Given a dish name or food query, generate a recipe with ingredients.

IMPORTANT: Map each ingredient to the closest matching item from the PriceCatcher database below. Use the item code (c) for matching.

Available items (format: code|name|unit):
${itemList}

Rules:
- Generate authentic Malaysian recipes when possible
- Include preparation steps
- For each ingredient, try to find the best matching PriceCatcher item code
- If no exact match exists, set item_code to null
- Quantities should be practical for 4 servings
- Respond in the same language as the query (English or Bahasa Melayu)`;

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
          { role: "user", content: query },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_recipe",
              description: "Generate a complete recipe with ingredients mapped to PriceCatcher items",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Recipe name" },
                  description: { type: "string", description: "Short description of the dish" },
                  servings: { type: "number", description: "Number of servings" },
                  prep_time: { type: "string", description: "Preparation time e.g. 30 mins" },
                  cook_time: { type: "string", description: "Cooking time e.g. 45 mins" },
                  ingredients: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Ingredient name" },
                        quantity: { type: "string", description: "Amount needed e.g. 500g, 2 pieces" },
                        item_code: {
                          type: "number",
                          description: "PriceCatcher item code if matched, or null",
                        },
                      },
                      required: ["name", "quantity"],
                    },
                  },
                  steps: {
                    type: "array",
                    items: { type: "string" },
                    description: "Step-by-step cooking instructions",
                  },
                  tips: { type: "string", description: "Optional cooking tips" },
                },
                required: ["name", "description", "servings", "prep_time", "cook_time", "ingredients", "steps"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_recipe" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No recipe generated");
    }

    const recipe = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recipe-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
