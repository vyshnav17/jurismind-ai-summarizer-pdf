import { Scale } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative bg-gradient-hero text-primary-foreground py-20 px-6 mb-12 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-64 h-64 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-accent/20 rounded-2xl backdrop-blur-sm">
            <Scale className="w-12 h-12 text-accent" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          Juris Mind
        </h1>
        
        <p className="text-xl md:text-2xl mb-4 text-primary-foreground/90 font-light">
          AI-Powered Legal Document Summarizer
        </p>
        
        <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
          Transform complex legal documents into clear, concise summaries. 
          Built for lawyers, students, and citizens seeking clarity.
        </p>
      </div>
    </div>
  );
};
