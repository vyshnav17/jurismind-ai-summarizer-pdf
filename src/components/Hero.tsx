import { Scale } from "lucide-react";
import { AnimatedStickers } from "./AnimatedStickers";

export const Hero = () => {
  return (
    <div className="relative bg-judiciary-hero text-primary-foreground py-20 px-6 mb-12 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 bottom-0 left-0 bg-court-overlay" />
        <img
          src="/justice-emblem.svg"
          alt="Justice emblem"
          className="absolute inset-0 m-auto w-[520px] h-[520px] opacity-20 select-none pointer-events-none"
        />
      </div>

      <AnimatedStickers />

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-accent/15 rounded-2xl backdrop-blur-sm ring-1 ring-accent/30">
            <Scale className="w-12 h-12 text-accent" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Juris Mind
        </h1>
        
        <p className="text-xl md:text-2xl mb-4 text-primary-foreground/90 font-light">
          AI-Powered Legal Document Summarizer
        </p>
        
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
          Transform complex legal documents into clear, concise summaries. 
          Built for lawyers, students, and citizens seeking clarity.
        </p>
      </div>
    </div>
  );
};
