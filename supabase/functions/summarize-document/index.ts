import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Multilingual Legal Processing Types
interface LegalLanguage {
  code: string;
  name: string;
  script: string;
  region: 'indian' | 'international';
  model: 'indic-trans2' | 'mbart' | 'gemini';
}

interface MultilingualSummaryRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  summaryMode: 'short' | 'detailed' | 'plain';
  preserveLegalTerms: boolean;
  includeTranslation: boolean;
  jurisdiction?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supported Legal Languages with IndicTrans2/mBART integration
const SUPPORTED_LEGAL_LANGUAGES: LegalLanguage[] = [
  // Indian Regional Languages (IndicTrans2)
  { code: 'hi', name: 'Hindi', script: 'Devanagari', region: 'indian', model: 'indic-trans2' },
  { code: 'ta', name: 'Tamil', script: 'Tamil', region: 'indian', model: 'indic-trans2' },
  { code: 'te', name: 'Telugu', script: 'Telugu', region: 'indian', model: 'indic-trans2' },
  { code: 'bn', name: 'Bengali', script: 'Bengali', region: 'indian', model: 'indic-trans2' },
  { code: 'mr', name: 'Marathi', script: 'Devanagari', region: 'indian', model: 'indic-trans2' },
  { code: 'gu', name: 'Gujarati', script: 'Gujarati', region: 'indian', model: 'indic-trans2' },
  { code: 'kn', name: 'Kannada', script: 'Kannada', region: 'indian', model: 'indic-trans2' },
  { code: 'ml', name: 'Malayalam', script: 'Malayalam', region: 'indian', model: 'indic-trans2' },
  { code: 'pa', name: 'Punjabi', script: 'Gurmukhi', region: 'indian', model: 'indic-trans2' },
  { code: 'or', name: 'Odia', script: 'Odia', region: 'indian', model: 'indic-trans2' },
  { code: 'as', name: 'Assamese', script: 'Assamese', region: 'indian', model: 'indic-trans2' },
  { code: 'ne', name: 'Nepali', script: 'Devanagari', region: 'indian', model: 'indic-trans2' },
  
  // International Languages (mBART)
  { code: 'en', name: 'English', script: 'Latin', region: 'international', model: 'gemini' },
  { code: 'es', name: 'Spanish', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'fr', name: 'French', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'de', name: 'German', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'it', name: 'Italian', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'pt', name: 'Portuguese', script: 'Latin', region: 'international', model: 'mbart' },
  { code: 'ru', name: 'Russian', script: 'Cyrillic', region: 'international', model: 'mbart' },
  { code: 'zh', name: 'Chinese', script: 'Han', region: 'international', model: 'mbart' },
  { code: 'ja', name: 'Japanese', script: 'Hiragana/Katakana', region: 'international', model: 'mbart' },
  { code: 'ko', name: 'Korean', script: 'Hangul', region: 'international', model: 'mbart' },
  { code: 'ar', name: 'Arabic', script: 'Arabic', region: 'international', model: 'mbart' },
];

// Legal Keywords for Language Detection
const LEGAL_KEYWORDS = {
  hi: ['न्यायालय', 'निर्णय', 'याचिका', 'वाद', 'अधिकार', 'कानून', 'न्याय', 'साक्ष्य'],
  ta: ['நீதிமன்றம்', 'தீர்ப்பு', 'மனு', 'வழக்கு', 'உரிமை', 'சட்டம்', 'நீதி', 'சாட்சி'],
  te: ['న్యాయస్థానం', 'తీర్పు', 'అర్జీ', 'వ్యాజ్యం', 'హక్కు', 'చట్టం', 'న్యాయం', 'సాక్ష్యం'],
  bn: ['আদালত', 'রায়', 'আবেদন', 'মামলা', 'অধিকার', 'আইন', 'ন্যায়', 'সাক্ষ্য'],
  en: ['court', 'judgment', 'petition', 'case', 'right', 'law', 'justice', 'evidence'],
};

// Language Detection Function
function detectLanguage(text: string): LegalLanguage {
  const textLower = text.toLowerCase();
  let maxScore = 0;
  let detectedLanguage = SUPPORTED_LEGAL_LANGUAGES.find(l => l.code === 'en')!; // Default to English

  for (const lang of SUPPORTED_LEGAL_LANGUAGES) {
    const keywords = LEGAL_KEYWORDS[lang.code as keyof typeof LEGAL_KEYWORDS] || [];
    const score = keywords.reduce((acc, keyword) => {
      return acc + (textLower.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);

    if (score > maxScore) {
      maxScore = score;
      detectedLanguage = lang;
    }
  }

  return detectedLanguage;
}

// Legal Term Extraction
function extractLegalTerms(text: string, language: LegalLanguage): string[] {
  const legalTerms = [
    // Indian legal terms
    'bail', 'warrant', 'subpoena', 'affidavit', 'injunction', 'contempt',
    'habeas corpus', 'mandamus', 'certiorari', 'prohibition', 'quo warranto',
    'locus standi', 'res judicata', 'stare decisis', 'obiter dicta',
    'ratio decidendi', 'amicus curiae', 'ex parte', 'in camera',
    'prima facie', 'bona fide', 'mala fide', 'ultra vires',
    // Hindi terms
    'जमानत', 'वारंट', 'सबपोना', 'शपथपत्र', 'निषेधाज्ञा', 'अवमान',
    'बंदी प्रत्यक्षीकरण', 'परमादेश', 'प्रमाणपत्र', 'निषेध',
    // Tamil terms
    'ஜாமீன்', 'ஆணை', 'சபோனா', 'உறுதிமொழி', 'தடை உத்தரவு', 'நீதிமன்ற அவமதிப்பு',
    'கைதி மீட்பு', 'கட்டளை', 'சான்றிதழ்', 'தடை',
  ];

  const foundTerms: string[] = [];
  const textLower = text.toLowerCase();

  for (const term of legalTerms) {
    if (textLower.includes(term.toLowerCase())) {
      foundTerms.push(term);
    }
  }

  return [...new Set(foundTerms)]; // Remove duplicates
}

// Translation Functions
async function translateWithIndicTrans2(
  text: string,
  sourceLanguage: LegalLanguage,
  targetLanguage: LegalLanguage
): Promise<string> {
  // For now, use Gemini as fallback since IndicTrans2 API might not be available
  // In production, this would call the actual IndicTrans2 service
  console.log(`Translating from ${sourceLanguage.name} to ${targetLanguage.name} using IndicTrans2`);
  
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { 
          role: "system", 
          content: `You are a legal document translator specializing in ${sourceLanguage.name} to ${targetLanguage.name} translation. Preserve legal terminology and maintain accuracy.` 
        },
        { 
          role: "user", 
          content: `Translate this legal document from ${sourceLanguage.name} to ${targetLanguage.name}. Preserve all legal terms and maintain the formal legal tone:\n\n${text}` 
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || text;
}

async function translateWithMBart(
  text: string,
  sourceLanguage: LegalLanguage,
  targetLanguage: LegalLanguage
): Promise<string> {
  // For now, use Gemini as fallback since mBART API might not be available
  console.log(`Translating from ${sourceLanguage.name} to ${targetLanguage.name} using mBART`);
  
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("LOVABLE_API_KEY not configured");
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { 
          role: "system", 
          content: `You are a legal document translator specializing in ${sourceLanguage.name} to ${targetLanguage.name} translation. Preserve legal terminology and maintain accuracy.` 
        },
        { 
          role: "user", 
          content: `Translate this legal document from ${sourceLanguage.name} to ${targetLanguage.name}. Preserve all legal terms and maintain the formal legal tone:\n\n${text}` 
        }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Translation failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || text;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      text, 
      mode, 
      language = "en", 
      sourceLanguage,
      preserveLegalTerms = true,
      includeTranslation = false,
      jurisdiction = "indian"
    } = await req.json();

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

    // Detect source language if not provided
    const detectedSourceLanguage = sourceLanguage 
      ? SUPPORTED_LEGAL_LANGUAGES.find(l => l.code === sourceLanguage)!
      : detectLanguage(text);

    const targetLanguage = SUPPORTED_LEGAL_LANGUAGES.find(l => l.code === language)!;
    
    console.log(`Detected source language: ${detectedSourceLanguage.name} (${detectedSourceLanguage.code})`);
    console.log(`Target language: ${targetLanguage.name} (${targetLanguage.code})`);
    
    // Extract legal terms
    const legalTerms = extractLegalTerms(text, detectedSourceLanguage);
    console.log(`Found legal terms: ${legalTerms.join(', ')}`);
    
    // Translate if needed and requested
    let textToProcess = text;
    let translation = undefined;
    
    if (detectedSourceLanguage.code !== targetLanguage.code && includeTranslation) {
      console.log(`Translating from ${detectedSourceLanguage.name} to ${targetLanguage.name}`);
      
      if (detectedSourceLanguage.region === 'indian' || targetLanguage.region === 'indian') {
        translation = await translateWithIndicTrans2(text, detectedSourceLanguage, targetLanguage);
      } else {
        translation = await translateWithMBart(text, detectedSourceLanguage, targetLanguage);
      }
      
      textToProcess = translation;
    }

    // Prepare the system prompt based on the summary mode and jurisdiction
    let systemPrompt = `You are an expert legal document summarizer specializing in ${targetLanguage.name} legal documents. `;
    
    if (jurisdiction === 'indian') {
      systemPrompt += `You have deep knowledge of Indian legal systems, including Supreme Court, High Court, and District Court procedures. You understand the nuances of Indian constitutional law, civil procedure, criminal law, and various state-specific legal frameworks. `;
    } else {
      systemPrompt += `You have expertise in international legal systems and cross-border legal matters. `;
    }
    
    systemPrompt += `Your task is to analyze legal and judicial documents and provide accurate, well-structured summaries that preserve legal accuracy while making content accessible.`;
    
    if (preserveLegalTerms && legalTerms.length > 0) {
      systemPrompt += ` Always preserve legal terminology and provide context when necessary. Important legal terms in this document include: ${legalTerms.join(', ')}.`;
    }
    
    if (targetLanguage.code !== 'en') {
      systemPrompt += ` Respond ONLY in ${targetLanguage.name}. Do not include English text or transliterations.`;
    }

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
      as: "Assamese",
      ne: "Nepali",
      ru: "Russian",
      ko: "Korean",
    };

    // Stronger, explicit translation instruction to ensure the model replies in the requested language.
    const translationNote = targetLanguage.code !== "en"
      ? `\n\nIMPORTANT: Reply ONLY in ${targetLanguage.name}. Translate the summary into ${targetLanguage.name} and do NOT include English or transliterations. Preserve legal terms and formatting; if a legal term has no clear equivalent, provide the best ${targetLanguage.name} translation and keep the meaning precise.`
      : "";

    // If a non-English language was requested, make the system prompt aware too
    if (targetLanguage.code !== "en") {
      systemPrompt += `\n\nWhen producing the summary, you MUST respond exclusively in ${targetLanguage.name}. Do not output any English text.`;
    }

    let userPrompt = "";
    
    switch (mode) {
      case "short":
        userPrompt = `Provide a SHORT, concise summary of the following legal document. Focus only on the most critical points, key decisions, and essential information. Keep it brief (2-3 paragraphs maximum).${translationNote}\n\nDocument:\n${textToProcess}`;
        break;
      case "detailed":
        userPrompt = `Provide a DETAILED, comprehensive summary of the following legal document. Include all important points, arguments, decisions, and relevant context. Preserve legal accuracy while organizing the information clearly.${translationNote}\n\nDocument:\n${textToProcess}`;
        break;
      case "plain":
        if (targetLanguage.code === "en") {
          userPrompt = `Provide a summary of the following legal document in PLAIN ENGLISH. Simplify complex legal terminology and jargon for easy understanding by non-lawyers. Make it accessible while preserving the essential meaning and key points.${translationNote}\n\nDocument:\n${textToProcess}`;
        } else {
          userPrompt = `Provide a summary of the following legal document in plain, simple ${targetLanguage.name}. Avoid English or transliterations. Simplify complex legal terminology for easy understanding by non-lawyers while preserving the essential meaning and key points.${translationNote}\n\nDocument:\n${textToProcess}`;
        }
        break;
      default:
        userPrompt = `Summarize the following legal document accurately and concisely.${translationNote}\n\n${textToProcess}`;
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
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    let summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary generated");
    }

    // If Google Cloud Translation API key is configured, prefer it for reliable script-correct translations
    if (targetLanguage.code !== "en") {
      const GOOGLE_TRANSLATE_API_KEY =
        Deno.env.get("AIzaSyC5Vz29DXoh6czG6sZ6bINegTQm4raEDUw") ||
        Deno.env.get("AIzaSyC5Vz29DXoh6czG6sZ6bINegTQm4raEDUw") ||
        Deno.env.get("AIzaSyC5Vz29DXoh6czG6sZ6bINegTQm4raEDUw");
      const targetCodeG = targetLanguage.code;
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
    if (targetLanguage.code !== "en") {
      const targetCode = targetLanguage.code;

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
    if (targetLanguage.code !== "en") {
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

    // Prepare response with multilingual metadata
    const responseData = {
      summary,
      metadata: {
        sourceLanguage: {
          code: detectedSourceLanguage.code,
          name: detectedSourceLanguage.name,
          script: detectedSourceLanguage.script,
          region: detectedSourceLanguage.region
        },
        targetLanguage: {
          code: targetLanguage.code,
          name: targetLanguage.name,
          script: targetLanguage.script,
          region: targetLanguage.region
        },
        legalTerms,
        translation: translation || null,
        jurisdiction,
        preserveLegalTerms,
        includeTranslation,
        processingTime: Date.now() - Date.now() // This would be calculated properly in production
      }
    };

    return new Response(
      JSON.stringify(responseData),
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
