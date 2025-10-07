import { Copy, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { useCallback } from "react";

interface SummaryResultProps {
  summary: string;
  language?: string;
}

export const SummaryResult = ({ summary, language }: SummaryResultProps) => {
  const [copied, setCopied] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);

  const handleInAppTranslate = useCallback(async () => {
    if (!language) {
      toast.error('Please select a target language first');
      return;
    }

    setTranslating(true);
    setTranslated(null);

    try {
      const res = await fetch('/supabase/functions/v1/translate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary, targetLanguage: language }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Translation failed');
      }

      setTranslated(data.translated);
      toast.success('Translated successfully');
    } catch (err: any) {
      console.error('Translate error:', err);
      toast.error(err.message || 'Translation failed');
    } finally {
      setTranslating(false);
    }
  }, [language, summary]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success("Summary copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `juris-mind-summary-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Summary downloaded successfully!");
  };

  const handleGoogleTranslate = () => {
    // Google Translate URL parameters
    // sl=auto (source language auto-detect), tl=<target language code>, text=<encoded summary>
  const tl = language || 'en';
    const encoded = encodeURIComponent(summary);
    const url = `https://translate.google.com/?sl=auto&tl=${tl}&text=${encoded}&op=translate`;
    window.open(url, '_blank');
  };

  return (
    <Card className="p-6 shadow-elegant">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Summary Result</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="transition-all"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handleGoogleTranslate}>
            Translate (Google)
          </Button>
          <Button variant="default" size="sm" onClick={handleInAppTranslate} disabled={translating}>
            {translating ? 'Translating...' : 'Translate In-App'}
          </Button>
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none bg-muted/30 rounded-lg p-6 border border-border">
        <p className="whitespace-pre-wrap text-foreground leading-relaxed">
          {translated ?? summary}
        </p>
        {translated && (
          <p className="text-xs text-muted-foreground mt-4">(Showing translated text — original available for copy/download)</p>
        )}
      </div>
    </Card>
  );
};
