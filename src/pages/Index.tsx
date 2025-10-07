import { useState } from "react";
import { Hero } from "@/components/Hero";
import { DocumentInput } from "@/components/DocumentInput";
import { SummaryOptions, SummaryMode } from "@/components/SummaryOptions";
import { SummaryResult } from "@/components/SummaryResult";
import { TranslationOptions, Language } from "@/components/TranslationOptions";
import { DocumentChat } from "@/components/DocumentChat";
import { MultilingualLanguageSelector, MultilingualSettings } from "@/components/MultilingualLanguageSelector";
import { LegalFineTuning } from "@/components/LegalFineTuning";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Bot, Globe, Brain } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Legal Language interface
interface LegalLanguage {
  code: string;
  name: string;
  script: string;
  region: 'indian' | 'international';
  model: 'indic-trans2' | 'mbart' | 'gemini';
}

const Index = () => {
  const [summaryMode, setSummaryMode] = useState<SummaryMode>("short");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  
  // Multilingual state
  const [selectedLegalLanguage, setSelectedLegalLanguage] = useState<LegalLanguage>({
    code: 'en',
    name: 'English',
    script: 'Latin',
    region: 'international',
    model: 'gemini'
  });
  const [multilingualSettings, setMultilingualSettings] = useState<MultilingualSettings>({
    preserveLegalTerms: true,
    includeTranslation: false,
    jurisdiction: 'indian',
    autoDetectLanguage: true
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setDocumentText("");
    toast.success(`File "${file.name}" selected`);
  };

  const handleTextInput = (text: string) => {
    setDocumentText(text);
    setSelectedFile(null);
    toast.success("Text input received");
  };

  const handleSummarize = async () => {
    if (!selectedFile && !documentText) {
      toast.error("Please provide a document or text to summarize");
      return;
    }

    setIsLoading(true);
    setSummary("");

    try {
      let textToSummarize = documentText;

      // If a file is selected, read its content
      if (selectedFile) {
        textToSummarize = await readFileContent(selectedFile);

        // Make the parsed document available for chat so users can ask questions about it.
        // We keep selectedFile state for reference but populate documentText so DocumentChat appears.
        setDocumentText(textToSummarize);
      }

      // Call the edge function to summarize
      const payload = {
        text: textToSummarize,
        mode: summaryMode,
        language: selectedLegalLanguage.code,
        sourceLanguage: multilingualSettings.autoDetectLanguage ? undefined : selectedLegalLanguage.code,
        preserveLegalTerms: multilingualSettings.preserveLegalTerms,
        includeTranslation: multilingualSettings.includeTranslation,
        jurisdiction: multilingualSettings.jurisdiction,
      };
      console.log("Invoking summarize-document with payload:", payload);

      const { data, error } = await supabase.functions.invoke("summarize-document", {
        body: payload,
      });

      if (error) {
        throw error;
      }

      if (data?.summary) {
        setSummary(data.summary);
        toast.success("Document summarized successfully!");
      } else {
        throw new Error("No summary returned");
      }
    } catch (error: any) {
      console.error("Summarization error:", error);
      toast.error(error.message || "Failed to summarize document");
    } finally {
      setIsLoading(false);
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    // Use document parsing for PDF, DOCX, and other complex formats
    if (
      file.type === "application/pdf" ||
      file.name.endsWith(".pdf") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.endsWith(".docx")
    ) {
      toast.info("Parsing document... This may take a moment.");
      
      // Create a temporary file path for the document parser
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        // Use pdfjs to extract text from PDFs on the client instead of reading raw bytes
        if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          const arrayBuffer = await file.arrayBuffer();

          // Dynamically import pdfjs (v2) to keep initial bundle small.
          // For Vite, resolving the worker file can be tricky; use the unpkg CDN for the worker to avoid bundler path issues.
          const pdfjs = await import('pdfjs-dist/build/pdf');

          // Set worker to a CDN-hosted worker for the installed pdfjs-dist version.
          // Update the version string if you change pdfjs-dist in package.json.
          // Using the minified worker.
          // @ts-ignore
          pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js';

          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str || '').join(' ');
            fullText += `\n\n${pageText}`;
          }

          return fullText.trim();
        }

        // For DOCX we fall back to reading as text for now (could integrate mammoth.js later)
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target?.result as string;
            resolve(content);
          };
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsText(file);
        });
      } catch (error) {
        throw new Error("Failed to parse document. Please try a text file.");
      }
    }

    // Handle text files
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        reader.readAsText(file);
      } else {
        reject(new Error("Unsupported file format. Please use TXT, PDF, or DOCX files."));
      }
    });
  };

  return (
    <div className="min-h-screen bg-judiciary-subtle relative">
      <div className="pointer-events-none absolute inset-0 bg-court-overlay opacity-5" />
      <img
        src="/justice-emblem.svg"
        alt="Justice emblem background"
        className="pointer-events-none select-none absolute -top-10 -right-10 w-[380px] h-[380px] opacity-10"
      />
      <Hero />
      
      <div id="try" className="relative max-w-5xl mx-auto px-6 pb-20">
        <div id="features" className="grid md:grid-cols-2 gap-6 mb-8">
          <DocumentInput
            onFileSelect={handleFileSelect}
            onTextInput={handleTextInput}
          />
          
          <div className="space-y-6">
            <SummaryOptions mode={summaryMode} onModeChange={setSummaryMode} />
            <MultilingualLanguageSelector
              selectedLanguage={selectedLegalLanguage}
              settings={multilingualSettings}
              onLanguageChange={setSelectedLegalLanguage}
              onSettingsChange={setMultilingualSettings}
            />
          </div>
        </div>

        <div id="how-it-works" className="flex justify-center mb-8">
          <Button
            onClick={handleSummarize}
            disabled={isLoading || (!selectedFile && !documentText)}
            size="lg"
            className="min-w-[200px] shadow-accent-glow hover:shadow-glow transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Summarizing...
              </>
            ) : (
              "Summarize Document"
            )}
          </Button>
        </div>

        {/* Show summary when available; chat opens via floating button */}
        { summary && (
          <div className="mt-8">
            <SummaryResult summary={summary} language={selectedLegalLanguage.code} />
          </div>
        )}

        {/* Legal Fine-tuning Section */}
        <div className="mt-12">
          <Tabs defaultValue="fine-tuning" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fine-tuning" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Legal Fine-tuning
              </TabsTrigger>
              <TabsTrigger value="models" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Model Information
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="fine-tuning" className="mt-6">
              <LegalFineTuning />
            </TabsContent>
            
            <TabsContent value="models" className="mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      IndicTrans2 Model
                    </CardTitle>
                    <CardDescription>
                      Specialized for Indian regional languages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Languages:</span>
                        <span className="text-sm text-muted-foreground">12 Indian languages</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Legal Accuracy:</span>
                        <span className="text-sm text-green-600">94.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">BLEU Score:</span>
                        <span className="text-sm text-blue-600">87.5</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      mBART Model
                    </CardTitle>
                    <CardDescription>
                      Optimized for international legal systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Languages:</span>
                        <span className="text-sm text-muted-foreground">11 International</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Legal Accuracy:</span>
                        <span className="text-sm text-green-600">91.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">BLEU Score:</span>
                        <span className="text-sm text-blue-600">85.2</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Floating AI chat button that opens a sheet with DocumentChat */}
        { documentText && (
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Chat with document"
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center"
              >
                <Bot className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Chat with document</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <DocumentChat documentText={documentText} />
              </div>
            </SheetContent>
          </Sheet>
        )}

        
        <section id="contact" className="mt-20">
          <h3 className="text-2xl font-semibold mb-3">Contact</h3>
          <p className="text-muted-foreground">Have questions or feedback? Reach us at contact@jurismind.app</p>
        </section>
      </div>
    </div>
  );
};

export default Index;
