import { useState } from "react";
import { Hero } from "@/components/Hero";
import { DocumentInput } from "@/components/DocumentInput";
import { SummaryOptions, SummaryMode } from "@/components/SummaryOptions";
import { SummaryResult } from "@/components/SummaryResult";
import { TranslationOptions, Language } from "@/components/TranslationOptions";
import { DocumentChat } from "@/components/DocumentChat";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [summaryMode, setSummaryMode] = useState<SummaryMode>("short");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>("en");

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
        language: language,
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
    <div className="min-h-screen bg-gradient-subtle">
      <Hero />
      
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <DocumentInput
            onFileSelect={handleFileSelect}
            onTextInput={handleTextInput}
          />
          
          <div className="space-y-6">
            <SummaryOptions mode={summaryMode} onModeChange={setSummaryMode} />
            <TranslationOptions language={language} onLanguageChange={setLanguage} />
          </div>
        </div>

        <div className="flex justify-center mb-8">
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

        {/* Layout: show summary and chat side-by-side on larger screens, stacked on small screens */}
        { (summary || documentText) && (
          <div className="mt-8">
            {summary && documentText ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <SummaryResult summary={summary} language={language} />
                </div>
                <div>
                  <DocumentChat documentText={documentText} />
                </div>
              </div>
            ) : summary ? (
              <SummaryResult summary={summary} />
            ) : (
              <DocumentChat documentText={documentText} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
