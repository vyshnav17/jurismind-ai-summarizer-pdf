import { useState, useCallback } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface DocumentInputProps {
  onFileSelect: (file: File) => void;
  onTextInput: (text: string) => void;
}

export const DocumentInput = ({ onFileSelect, onTextInput }: DocumentInputProps) => {
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [textContent, setTextContent] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (files && files[0]) {
        const file = files[0];
        const validTypes = [".pdf", ".docx", ".txt"];
        const isValid = validTypes.some((type) => file.name.toLowerCase().endsWith(type));

        if (isValid) {
          onFileSelect(file);
        } else {
          toast.error("Please upload a PDF, DOCX, or TXT file");
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  return (
    <Card className="p-6 shadow-elegant">
      <div className="flex gap-2 mb-6">
        <Button
          variant={inputMode === "file" ? "default" : "outline"}
          onClick={() => setInputMode("file")}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
        <Button
          variant={inputMode === "text" ? "default" : "outline"}
          onClick={() => setInputMode("text")}
          className="flex-1"
        >
          <FileText className="w-4 h-4 mr-2" />
          Paste Text
        </Button>
      </div>

      {inputMode === "file" ? (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive
              ? "border-accent bg-accent/5 shadow-accent-glow"
              : "border-border hover:border-accent/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInput}
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drag & drop your document here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF, DOCX, and TXT files
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea
            placeholder="Paste your legal document text here..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            className="min-h-[300px] resize-none"
          />
          <Button
            onClick={() => {
              if (textContent.trim()) {
                onTextInput(textContent);
              } else {
                toast.error("Please enter some text");
              }
            }}
            className="w-full"
          >
            Process Text
          </Button>
        </div>
      )}
    </Card>
  );
};
