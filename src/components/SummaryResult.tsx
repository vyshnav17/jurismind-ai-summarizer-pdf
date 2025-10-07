import { Copy, Download, CheckCircle, Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/components/TranslationOptions";

interface SummaryResultProps {
  summary: string;
  // optional language code (e.g., 'en', 'ml') to choose voice/language for TTS
  language?: Language;
}

export const SummaryResult = ({ summary, language = "en" }: SummaryResultProps) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

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

  const handleDownloadPdf = async () => {
    try {
      const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      let { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const fontSize = 12;
      const margin = 50;
      const maxWidth = width - margin * 2;

      const words = summary.split(/\s+/);
      let line = '';
      const lines: string[] = [];
      for (const word of words) {
        const testLine = line ? line + ' ' + word : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) lines.push(line);

      let y = height - margin;
      const lineHeight = fontSize * 1.3;
      page.drawText('JurisMind Summary', { x: margin, y: y - fontSize, size: 16, font, color: rgb(0,0,0) });
      y -= 30;

      for (const l of lines) {
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage();
          ({ width, height } = page.getSize());
          y = height - margin;
          page.drawText('JurisMind Summary (cont.)', { x: margin, y: y - fontSize, size: 14, font, color: rgb(0,0,0) });
          y -= 30;
          page.drawText(l, { x: margin, y, size: fontSize, font, color: rgb(0,0,0) });
        } else {
          page.drawText(l, { x: margin, y, size: fontSize, font, color: rgb(0,0,0) });
        }
        y -= lineHeight;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `juris-mind-summary-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch (e) {
      console.error('PDF generation error', e);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  // Text-to-Speech (Web Speech API)
  useEffect(() => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
      // Try to pick a voice matching the requested language if none selected
      if (available.length && !selectedVoice) {
        const match = available.find(v => v.lang.toLowerCase().startsWith(language));
        if (match) setSelectedVoice(match.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [language, selectedVoice]);

  const speak = () => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) {
      toast.error("Speech synthesis not supported in this browser");
      return;
    }

    const synth = window.speechSynthesis;

    // If paused, resume
    if (synth.paused && isPaused) {
      synth.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    // Cancel any existing utterance
    synth.cancel();
    const u = new SpeechSynthesisUtterance(summary);
    // Prefer the selected voice
    if (selectedVoice) {
      const v = voices.find(v => v.name === selectedVoice);
      if (v) u.voice = v;
    } else {
      // Set utterance language if possible
      try {
        u.lang = language;
      } catch (e) {
        // ignore
      }
    }

    u.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    u.onerror = (e) => {
      console.error('TTS error', e);
      toast.error('An error occurred during speech synthesis');
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    // More reliable event handling: update play/pause state when utterance changes
    u.onstart = () => {
      console.log('TTS started');
      setIsPlaying(true);
      setIsPaused(false);
    };

    u.onpause = () => {
      console.log('TTS paused');
      setIsPlaying(false);
      setIsPaused(true);
    };

    u.onresume = () => {
      console.log('TTS resumed');
      setIsPlaying(true);
      setIsPaused(false);
    };

    utteranceRef.current = u;
    synth.speak(u);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const pause = () => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) {
      toast.error("Speech synthesis not supported in this browser");
      return;
    }

    try {
      const synth = window.speechSynthesis;
      if (synth.speaking && !synth.paused) {
        synth.pause();
        setIsPlaying(false);
        setIsPaused(true);
        toast.success('Paused');
      } else if (synth.paused) {
        // If already paused, resume
        synth.resume();
        setIsPlaying(true);
        setIsPaused(false);
        toast.success('Resumed');
      }
    } catch (e) {
      console.error('Error pausing/resuming TTS', e);
      toast.error('Unable to pause/resume');
    }
  };

  const stop = () => {
    if (typeof window === "undefined" || !('speechSynthesis' in window)) {
      toast.error("Speech synthesis not supported in this browser");
      return;
    }

    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
      toast.success('Stopped');
    } catch (e) {
      console.error('Error stopping TTS', e);
      toast.error('Unable to stop speech');
    }
  };

  return (
    <Card className="p-6 shadow-elegant">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Summary Result</h3>
        <div className="flex flex-wrap gap-2 justify-end">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={speak}>
              <Play className="w-4 h-4 mr-2" /> Read
            </Button>
            <Button variant="outline" size="sm" onClick={pause} disabled={!isPlaying && !isPaused}>
              <Pause className="w-4 h-4 mr-2" /> Pause
            </Button>
            <Button variant="outline" size="sm" onClick={stop} disabled={!isPlaying && !isPaused}>
              <Square className="w-4 h-4 mr-2" /> Stop
            </Button>
          </div>
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div className="prose prose-sm max-w-none bg-muted/30 rounded-lg p-6 border border-border">
        <p className="whitespace-pre-wrap text-foreground leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Mobile-friendly action bar */}
      <div className="mt-4 flex justify-end md:hidden">
        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>
    </Card>
  );
};
