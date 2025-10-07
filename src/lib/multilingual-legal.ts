/**
 * Multilingual Legal Document Processing
 * Supports Indian regional languages and international legal systems
 */

export interface LegalLanguage {
  code: string;
  name: string;
  script: string;
  region: 'indian' | 'international';
  model: 'indic-trans2' | 'mbart' | 'gemini';
}

export const SUPPORTED_LEGAL_LANGUAGES: LegalLanguage[] = [
  // Indian Regional Languages
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
  
  // International Languages
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

export interface LegalDocumentMetadata {
  language: LegalLanguage;
  jurisdiction: string;
  documentType: 'court_order' | 'judgment' | 'petition' | 'affidavit' | 'contract' | 'statute' | 'other';
  confidence: number;
}

export interface MultilingualSummaryRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  summaryMode: 'short' | 'detailed' | 'plain';
  preserveLegalTerms: boolean;
  includeTranslation: boolean;
  jurisdiction?: string;
}

export interface MultilingualSummaryResponse {
  summary: string;
  originalLanguage: LegalLanguage;
  targetLanguage: LegalLanguage;
  translation?: string;
  legalTerms: string[];
  confidence: number;
  processingTime: number;
}

/**
 * Language Detection for Legal Documents
 */
export class LegalLanguageDetector {
  private static readonly LEGAL_KEYWORDS = {
    // Hindi legal terms
    hi: ['न्यायालय', 'निर्णय', 'याचिका', 'वाद', 'अधिकार', 'कानून', 'न्याय', 'साक्ष्य'],
    // Tamil legal terms
    ta: ['நீதிமன்றம்', 'தீர்ப்பு', 'மனு', 'வழக்கு', 'உரிமை', 'சட்டம்', 'நீதி', 'சாட்சி'],
    // Telugu legal terms
    te: ['న్యాయస్థానం', 'తీర్పు', 'అర్జీ', 'వ్యాజ్యం', 'హక్కు', 'చట్టం', 'న్యాయం', 'సాక్ష్యం'],
    // Bengali legal terms
    bn: ['আদালত', 'রায়', 'আবেদন', 'মামলা', 'অধিকার', 'আইন', 'ন্যায়', 'সাক্ষ্য'],
    // English legal terms
    en: ['court', 'judgment', 'petition', 'case', 'right', 'law', 'justice', 'evidence'],
  };

  static detectLanguage(text: string): LegalLanguage {
    const textLower = text.toLowerCase();
    let maxScore = 0;
    let detectedLanguage = SUPPORTED_LEGAL_LANGUAGES[0]; // Default to English

    for (const lang of SUPPORTED_LEGAL_LANGUAGES) {
      const keywords = this.LEGAL_KEYWORDS[lang.code as keyof typeof this.LEGAL_KEYWORDS] || [];
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

  static getConfidence(text: string, language: LegalLanguage): number {
    const keywords = this.LEGAL_KEYWORDS[language.code as keyof typeof this.LEGAL_KEYWORDS] || [];
    if (keywords.length === 0) return 0.5;

    const textLower = text.toLowerCase();
    const matches = keywords.filter(keyword => 
      textLower.includes(keyword.toLowerCase())
    ).length;

    return Math.min(matches / keywords.length, 1.0);
  }
}

/**
 * Legal Term Extraction and Preservation
 */
export class LegalTermExtractor {
  private static readonly LEGAL_TERMS = {
    // Indian legal terms
    indian: [
      'bail', 'warrant', 'subpoena', 'affidavit', 'injunction', 'contempt',
      'habeas corpus', 'mandamus', 'certiorari', 'prohibition', 'quo warranto',
      'locus standi', 'res judicata', 'stare decisis', 'obiter dicta',
      'ratio decidendi', 'amicus curiae', 'ex parte', 'in camera',
      'prima facie', 'bona fide', 'mala fide', 'ultra vires',
      'intra vires', 'de facto', 'de jure', 'ipso facto',
      'ab initio', 'ex post facto', 'ad hoc', 'pro tem',
      'sine qua non', 'ceteris paribus', 'mutatis mutandis',
      'inter alia', 'et al', 'viz', 'i.e.', 'e.g.', 'etc.',
      // Hindi terms
      'जमानत', 'वारंट', 'सबपोना', 'शपथपत्र', 'निषेधाज्ञा', 'अवमान',
      'बंदी प्रत्यक्षीकरण', 'परमादेश', 'प्रमाणपत्र', 'निषेध', 'क्वो वारंटो',
      'स्थानीय खड़े होने का अधिकार', 'निर्णीत विषय', 'पूर्व निर्णय का पालन',
      'गौण टिप्पणी', 'निर्णय का अनुपात', 'मित्र न्यायालय', 'एक पक्षीय',
      'न्यायालय के समक्ष', 'प्रथम दृष्टया', 'सद्भावना से', 'दुर्भावना से',
      // Tamil terms
      'ஜாமீன்', 'ஆணை', 'சபோனா', 'உறுதிமொழி', 'தடை உத்தரவு', 'நீதிமன்ற அவமதிப்பு',
      'கைதி மீட்பு', 'கட்டளை', 'சான்றிதழ்', 'தடை', 'அதிகார விசாரணை',
      'நிலைப்பாட்டு உரிமை', 'தீர்ப்பு வழக்கு', 'முந்தைய தீர்ப்பு பின்பற்றல்',
      'பக்கக் குறிப்பு', 'தீர்ப்பு விகிதம்', 'நட்பு நீதிமன்றம்', 'ஒரு பக்க',
      'நீதிமன்றத்தில்', 'முதல் பார்வையில்', 'நல்லெண்ணத்துடன்', 'தீயெண்ணத்துடன்',
    ],
    // International legal terms
    international: [
      'constitution', 'statute', 'regulation', 'ordinance', 'amendment',
      'clause', 'section', 'article', 'paragraph', 'subsection',
      'plaintiff', 'defendant', 'appellant', 'respondent', 'petitioner',
      'prosecutor', 'defense', 'counsel', 'attorney', 'barrister',
      'solicitor', 'advocate', 'judge', 'magistrate', 'justice',
      'jury', 'witness', 'expert witness', 'deposition', 'testimony',
      'hearsay', 'circumstantial evidence', 'direct evidence', 'burden of proof',
      'standard of proof', 'reasonable doubt', 'preponderance of evidence',
      'clear and convincing evidence', 'beyond reasonable doubt',
    ]
  };

  static extractLegalTerms(text: string, language: LegalLanguage): string[] {
    const allTerms = [
      ...this.LEGAL_TERMS.indian,
      ...this.LEGAL_TERMS.international
    ];

    const foundTerms: string[] = [];
    const textLower = text.toLowerCase();

    for (const term of allTerms) {
      if (textLower.includes(term.toLowerCase())) {
        foundTerms.push(term);
      }
    }

    return [...new Set(foundTerms)]; // Remove duplicates
  }

  static preserveLegalTerms(
    text: string, 
    legalTerms: string[], 
    targetLanguage: LegalLanguage
  ): string {
    let processedText = text;

    // For Indian languages, preserve English legal terms in parentheses
    if (targetLanguage.region === 'indian') {
      for (const term of legalTerms) {
        if (this.LEGAL_TERMS.international.includes(term)) {
          const regex = new RegExp(`\\b${term}\\b`, 'gi');
          processedText = processedText.replace(regex, `${term} (${term})`);
        }
      }
    }

    return processedText;
  }
}

/**
 * Multilingual Legal Document Processor
 */
export class MultilingualLegalProcessor {
  private static readonly INDIC_TRANS2_API = 'https://api.indic-trans2.ai/v1/translate';
  private static readonly MBART_API = 'https://api.mbart.ai/v1/translate';
  private static readonly GEMINI_API = 'https://ai.gateway.lovable.dev/v1/chat/completions';

  static async processDocument(request: MultilingualSummaryRequest): Promise<MultilingualSummaryResponse> {
    const startTime = Date.now();
    
    // Detect source language if not provided
    const sourceLanguage = request.sourceLanguage 
      ? SUPPORTED_LEGAL_LANGUAGES.find(l => l.code === request.sourceLanguage)!
      : LegalLanguageDetector.detectLanguage(request.text);

    const targetLanguage = SUPPORTED_LEGAL_LANGUAGES.find(l => l.code === request.targetLanguage)!;
    
    // Extract legal terms
    const legalTerms = LegalTermExtractor.extractLegalTerms(request.text, sourceLanguage);
    
    // Translate if needed
    let translatedText = request.text;
    if (sourceLanguage.code !== targetLanguage.code && request.includeTranslation) {
      translatedText = await this.translateText(
        request.text, 
        sourceLanguage, 
        targetLanguage, 
        legalTerms
      );
    }

    // Generate summary
    const summary = await this.generateSummary(
      translatedText,
      targetLanguage,
      request.summaryMode,
      request.preserveLegalTerms,
      legalTerms
    );

    const processingTime = Date.now() - startTime;

    return {
      summary,
      originalLanguage: sourceLanguage,
      targetLanguage,
      translation: request.includeTranslation ? translatedText : undefined,
      legalTerms,
      confidence: LegalLanguageDetector.getConfidence(request.text, sourceLanguage),
      processingTime
    };
  }

  private static async translateText(
    text: string,
    sourceLanguage: LegalLanguage,
    targetLanguage: LegalLanguage,
    legalTerms: string[]
  ): Promise<string> {
    // Choose translation model based on language pair
    if (sourceLanguage.region === 'indian' || targetLanguage.region === 'indian') {
      return this.translateWithIndicTrans2(text, sourceLanguage, targetLanguage);
    } else {
      return this.translateWithMBart(text, sourceLanguage, targetLanguage);
    }
  }

  private static async translateWithIndicTrans2(
    text: string,
    sourceLanguage: LegalLanguage,
    targetLanguage: LegalLanguage
  ): Promise<string> {
    // Implementation for IndicTrans2 API
    // This would integrate with the actual IndicTrans2 service
    const response = await fetch(this.INDIC_TRANS2_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INDIC_TRANS2_API_KEY}`
      },
      body: JSON.stringify({
        text,
        source_lang: sourceLanguage.code,
        target_lang: targetLanguage.code,
        domain: 'legal'
      })
    });

    if (!response.ok) {
      throw new Error(`IndicTrans2 translation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.translated_text;
  }

  private static async translateWithMBart(
    text: string,
    sourceLanguage: LegalLanguage,
    targetLanguage: LegalLanguage
  ): Promise<string> {
    // Implementation for mBART API
    const response = await fetch(this.MBART_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MBART_API_KEY}`
      },
      body: JSON.stringify({
        text,
        source_lang: sourceLanguage.code,
        target_lang: targetLanguage.code,
        domain: 'legal'
      })
    });

    if (!response.ok) {
      throw new Error(`mBART translation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.translated_text;
  }

  private static async generateSummary(
    text: string,
    targetLanguage: LegalLanguage,
    mode: 'short' | 'detailed' | 'plain',
    preserveLegalTerms: boolean,
    legalTerms: string[]
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(targetLanguage, mode, preserveLegalTerms);
    const userPrompt = this.buildUserPrompt(text, targetLanguage, mode, legalTerms);

    const response = await fetch(this.GEMINI_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Summary generation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private static buildSystemPrompt(
    targetLanguage: LegalLanguage,
    mode: string,
    preserveLegalTerms: boolean
  ): string {
    let prompt = `You are an expert legal document summarizer specializing in ${targetLanguage.name} legal documents. `;
    
    if (targetLanguage.region === 'indian') {
      prompt += `You have deep knowledge of Indian legal systems, including Supreme Court, High Court, and District Court procedures. `;
    }
    
    prompt += `Your task is to provide accurate, well-structured summaries that preserve legal accuracy while making content accessible.`;
    
    if (preserveLegalTerms) {
      prompt += ` Always preserve legal terminology and provide context when necessary.`;
    }
    
    if (targetLanguage.code !== 'en') {
      prompt += ` Respond ONLY in ${targetLanguage.name}. Do not include English text or transliterations.`;
    }
    
    return prompt;
  }

  private static buildUserPrompt(
    text: string,
    targetLanguage: LegalLanguage,
    mode: string,
    legalTerms: string[]
  ): string {
    let prompt = '';
    
    switch (mode) {
      case 'short':
        prompt = `Provide a SHORT, concise summary of this legal document. Focus on key decisions, essential facts, and critical legal points. (2-3 paragraphs maximum)`;
        break;
      case 'detailed':
        prompt = `Provide a DETAILED, comprehensive summary of this legal document. Include all important arguments, legal reasoning, decisions, and relevant context.`;
        break;
      case 'plain':
        prompt = `Provide a summary in PLAIN ${targetLanguage.name}. Simplify complex legal terminology for non-lawyers while preserving essential meaning and accuracy.`;
        break;
      default:
        prompt = `Summarize this legal document accurately and concisely.`;
    }
    
    if (legalTerms.length > 0) {
      prompt += `\n\nImportant legal terms to preserve: ${legalTerms.join(', ')}`;
    }
    
    prompt += `\n\nDocument:\n${text}`;
    
    return prompt;
  }
}

/**
 * Legal Domain Fine-tuning Utilities
 */
export class LegalFineTuning {
  static readonly INDIAN_LEGAL_DATASETS = [
    'supreme_court_judgments',
    'high_court_orders',
    'district_court_decisions',
    'legal_petitions',
    'affidavits',
    'contracts',
    'statutes',
    'regulations'
  ];

  static async prepareTrainingData(
    dataset: string,
    language: LegalLanguage,
    documentType: string
  ): Promise<any[]> {
    // This would integrate with actual legal datasets
    // For now, return mock structure
    return [
      {
        input: 'Sample legal document text...',
        output: 'Sample summary...',
        metadata: {
          language: language.code,
          documentType,
          jurisdiction: 'indian',
          dataset
        }
      }
    ];
  }

  static async fineTuneModel(
    modelName: string,
    trainingData: any[],
    hyperparameters: any
  ): Promise<string> {
    // Implementation for model fine-tuning
    // This would integrate with Hugging Face, OpenAI, or other fine-tuning services
    console.log(`Fine-tuning ${modelName} with ${trainingData.length} samples`);
    return 'fine-tuned-model-id';
  }
}
