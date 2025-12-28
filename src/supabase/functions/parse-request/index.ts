import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    const openai = new OpenAI({ apiKey });

    // 2. The "Intelligence" - System Prompt
    const systemPrompt = `
      You are a construction assistant. Extract material requests from the user's text.
      Return ONLY a valid JSON array of objects. 
      Fields: "material_name", "quantity" (number), "unit" (default 'pcs'), "priority" (low, medium, high, urgent).
      If the user implies urgency (e.g., 'ASAP', 'immediately'), set priority to 'urgent'.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" }, // Ensures valid JSON
    });

    console.log("OpenAI response:", response.choices);
    const content = response.choices[0].message.content;
    // OpenAI with json_object mode usually returns { "requests": [...] }
    const parsedData = JSON.parse(content || "{}");
    const result = parsedData.requests || parsedData;

    return new Response(JSON.stringify(Array.isArray(result) ? result : [result]), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});