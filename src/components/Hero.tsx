import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="relative overflow-hidden py-20 px-6 mb-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-600 via-violet-600 to-pink-600 opacity-10 animate-blob"></div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/5 shadow-md transform hover:scale-105 transition">
            <Scale className="w-12 h-12 text-white/90" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-white drop-shadow-md">
          Juris Mind
        </h1>

        <p className="text-xl md:text-2xl mb-6 text-white/90 font-medium">
          AI-Powered Legal Document Summarizer
        </p>

        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
          Turn long legal rulings and contracts into clear, actionable summaries and ask follow-up questions — all in seconds.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button className="shadow-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:scale-105 transition-transform">
            Upload Document
          </Button>
          <Button variant="outline">Try Demo</Button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="text-xs text-white/70">Accuracy (avg.)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">1m</div>
            <div className="text-xs text-white/70">Avg. processing time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">Legal</div>
            <div className="text-xs text-white/70">Domain-ready</div>
          </div>
        </div>
      </div>
    </div>
  );
};
