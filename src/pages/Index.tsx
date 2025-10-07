import { useState } from "react";
import { Hero } from "@/components/Hero";
import { DocumentInput } from "@/components/DocumentInput";
import { SummaryOptions, SummaryMode } from "@/components/SummaryOptions";
import { SummaryResult } from "@/components/SummaryResult";
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
      }

      // Call the edge function to summarize
      const { data, error } = await supabase.functions.invoke("summarize-document", {
        body: {
          text: textToSummarize,
          mode: summaryMode,
        },
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      // For simplicity, we're only handling text files here
      // PDF and DOCX parsing would require additional libraries
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        reader.readAsText(file);
      } else {
        reject(new Error("Only TXT files are supported for now. PDF and DOCX support coming soon!"));
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
          
          <SummaryOptions mode={summaryMode} onModeChange={setSummaryMode} />
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

        {summary && <SummaryResult summary={summary} />}
      </div>
    </div>
  );
};

export default Index;
