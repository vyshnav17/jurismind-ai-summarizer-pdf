import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, mode, language = "en" } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "No text provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the system prompt based on the summary mode
    let systemPrompt = `You are an expert legal document summarizer. Your task is to analyze legal and judicial documents and provide accurate, well-structured summaries.`;

    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      zh: "Chinese",
      ja: "Japanese",
      ar: "Arabic",
      hi: "Hindi",
      // Indian languages
      bn: "Bengali",
      ta: "Tamil",
      te: "Telugu",
      mr: "Marathi",
      gu: "Gujarati",
      kn: "Kannada",
      ml: "Malayalam",
      pa: "Punjabi",
      or: "Odia",
    };

    // Normalize language input: accept either a code (e.g., 'ta') or a full language name (e.g., 'Tamil')
    let targetLanguage = "English";
    console.log(`summarize-document: received language param -> ${JSON.stringify(language)}`);
    if (language && typeof language === 'string') {
      if (languageNames[language]) {
        targetLanguage = languageNames[language];
      } else {
        // If a full language name was sent (case-insensitive), try to match it
        const lc = language.toLowerCase();
        const matched = Object.values(languageNames).find((n) => n.toLowerCase() === lc);
        if (matched) targetLanguage = matched;
      }
    }

    console.log(`summarize-document: normalized targetLanguage -> ${targetLanguage}`);

    // Stronger, explicit translation instruction to ensure the model replies in the requested language.
    const translationNote = targetLanguage !== "English"
      ? `\n\nIMPORTANT: Reply ONLY in ${targetLanguage}. Translate the summary into ${targetLanguage} and do NOT include English or transliterations. Preserve legal terms and formatting; if a legal term has no clear equivalent, provide the best ${targetLanguage} translation and keep the meaning precise.`
      : "";

    // If a non-English language was requested, make the system prompt aware too
    if (targetLanguage !== "English") {
      systemPrompt += `\n\nWhen producing the summary, you MUST respond exclusively in ${targetLanguage}. Do not output any English text.`;
    }

    let userPrompt = "";
    
    switch (mode) {
      case "short":
        userPrompt = `Provide a SHORT, concise summary of the following legal document. Focus only on the most critical points, key decisions, and essential information. Keep it brief (2-3 paragraphs maximum).${translationNote}\n\nDocument:\n${text}`;
        break;
      case "detailed":
        userPrompt = `Provide a DETAILED, comprehensive summary of the following legal document. Include all important points, arguments, decisions, and relevant context. Preserve legal accuracy while organizing the information clearly.${translationNote}\n\nDocument:\n${text}`;
        break;
      case "plain":
        if (targetLanguage === "English") {
          userPrompt = `Provide a summary of the following legal document in PLAIN ENGLISH. Simplify complex legal terminology and jargon for easy understanding by non-lawyers. Make it accessible while preserving the essential meaning and key points.${translationNote}\n\nDocument:\n${text}`;
        } else {
          userPrompt = `Provide a summary of the following legal document in plain, simple ${targetLanguage}. Avoid English or transliterations. Simplify complex legal terminology for easy understanding by non-lawyers while preserving the essential meaning and key points.${translationNote}\n\nDocument:\n${text}`;
        }
        break;
      default:
        userPrompt = `Summarize the following legal document accurately and concisely.${translationNote}\n\n${text}`;
    }

    console.log(`Summarizing document with mode: ${mode}`);

    // Handle long texts by chunking if needed (basic chunking for now)
    const maxChunkSize = 4000;
    let textToSummarize = text;
    
    if (text.length > maxChunkSize) {
      // For very long documents, take the first and last portions
      const firstPart = text.substring(0, maxChunkSize / 2);
      const lastPart = text.substring(text.length - maxChunkSize / 2);
      textToSummarize = firstPart + "\n\n[...document continues...]\n\n" + lastPart;
      userPrompt = userPrompt.replace(text, textToSummarize);
    }

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary generated");
    }

    // If Google Cloud Translation API key is configured, prefer it for reliable script-correct translations
    if (targetLanguage !== "English") {
      const GOOGLE_TRANSLATE_API_KEY =
        Deno.env.get("AIzaSyC5Vz29DXoh6czG6sZ6bINegTQm4raEDUw") ||
        Deno.env.get("AIzaSyC5Vz29DXoh6czG6sZ6bINegTQm4raEDUw") ||
        Deno.env.get("AIzaSyC5Vz29DXoh6czG6sZ6bINegTQm4raEDUw");
      const targetCodeG = Object.entries(languageNames).find(([k, v]) => v === targetLanguage)?.[0] || "hi";
      if (GOOGLE_TRANSLATE_API_KEY) {
        try {
          const chunkForG = (input: string, maxLen = 3500) => {
            const parts: string[] = [];
            let start = 0;
            while (start < input.length) {
              let end = Math.min(start + maxLen, input.length);
              const slice = input.slice(start, end);
              const lastBreak = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "), slice.lastIndexOf("\n"));
              if (end < input.length && lastBreak > 200) end = start + lastBreak + 1;
              parts.push(input.slice(start, end));
              start = end;
            }
            return parts;
          };

          const chunks = chunkForG(summary);
          const htmlDecode = (s: string) => s
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"');
          const translatedChunks: string[] = [];
          for (const chunk of chunks) {
            const resp = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ q: chunk, target: targetCodeG, format: "text", model: "nmt" }),
            });
            if (!resp.ok) throw new Error(`Google Translate HTTP ${resp.status}`);
            const j = await resp.json();
            const t = j?.data?.translations?.[0]?.translatedText;
            translatedChunks.push(typeof t === 'string' && t.length ? htmlDecode(t) : chunk);
          }
          summary = translatedChunks.join("\n\n");
          console.log(`Google Translate applied for ${targetCodeG}`);
        } catch (e) {
          console.warn("Google Translate failed, falling back to AI/public pipeline", e);
        }
      }
    }

    // Robust final translation enforcement for non-English: chunked AI translation, then optional public fallback
    if (targetLanguage !== "English") {
      const targetCode = Object.entries(languageNames).find(([k, v]) => v === targetLanguage)?.[0] || "hi";

      const chunkText = (input: string, maxLen = 1500) => {
        const parts: string[] = [];
        let start = 0;
        while (start < input.length) {
          let end = Math.min(start + maxLen, input.length);
          // try to cut on sentence boundary
          const slice = input.slice(start, end);
          const lastBreak = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "), slice.lastIndexOf("\n"));
          if (end < input.length && lastBreak > 200) {
            end = start + lastBreak + 1;
          }
          parts.push(input.slice(start, end));
          start = end;
        }
        return parts;
      };

      const chunks = chunkText(summary);
      const translatedChunks: string[] = [];
      for (const chunk of chunks) {
        let chunkTranslated = "";
        try {
          const enforceResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: `You are a precise legal translator. Output ONLY in ${targetLanguage}. Never include English words or transliterations. Preserve legal nuance.` },
                { role: "user", content: `Translate into ${targetLanguage}. Output only the translated text.\n\n${chunk}` },
              ],
            }),
          });
          if (enforceResponse.ok) {
            const enforceData = await enforceResponse.json();
            const enforced = enforceData.choices?.[0]?.message?.content;
            if (enforced) chunkTranslated = enforced;
          }
        } catch {}

        // If AI translator failed or returned empty, try public fallback for this chunk
        if (!chunkTranslated || !chunkTranslated.trim()) {
          try {
            const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${encodeURIComponent("auto|" + targetCode)}`;
            const mmResp = await fetch(myMemoryUrl);
            if (mmResp.ok) {
              const mmJson = await mmResp.json();
              const mmText = mmJson?.responseData?.translatedText;
              if (typeof mmText === 'string' && mmText.trim().length > 0) {
                chunkTranslated = mmText;
              }
            }
          } catch {}
        }

        translatedChunks.push(chunkTranslated || chunk);
      }

      summary = translatedChunks.join("\n\n");
    }

    // Final enforcement: always translate to targetLanguage when not English
    if (targetLanguage !== "English") {
      try {
        const enforceResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: `You are a precise translator. Output ONLY in ${targetLanguage}. Never include English words or transliterations. Keep legal meaning exact.` },
              { role: "user", content: `Translate into ${targetLanguage}. Output only the translated text.\n\n${summary}` },
            ],
          }),
        });
        if (enforceResponse.ok) {
          const enforceData = await enforceResponse.json();
          const enforced = enforceData.choices?.[0]?.message?.content;
          if (enforced) summary = enforced;
        } else {
          console.warn("Final enforce translation failed", enforceResponse.status);
        }
      } catch (e) {
        console.warn("Final enforce translation error", e);
      }
    }

    console.log("Summary generated successfully");

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in summarize-document function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
