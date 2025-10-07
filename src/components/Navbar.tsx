import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Scale } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-accent/15 ring-1 ring-accent/30 flex items-center justify-center">
            <Scale className="w-5 h-5 text-accent" />
          </div>
          <span className="font-serif text-lg font-semibold">Juris Mind</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="hover:text-accent transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-accent transition-colors">How it works</a>
          <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#try" className="hidden md:block">
            <Button size="sm" className="shadow-accent-glow">Try Now</Button>
          </a>
        </div>
      </div>
    </header>
  );
};


