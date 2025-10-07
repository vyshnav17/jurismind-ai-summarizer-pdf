export const Footer = () => {
  return (
    <footer className="border-t mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <h4 className="font-semibold mb-3">About</h4>
          <p className="text-muted-foreground">AI-powered legal document summaries with a judiciary-themed experience.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Links</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="#features" className="hover:text-accent">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-accent">How it works</a></li>
            <li><a href="#contact" className="hover:text-accent">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="#" className="hover:text-accent">Privacy</a></li>
            <li><a href="#" className="hover:text-accent">Terms</a></li>
            <li><a href="#" className="hover:text-accent">Disclaimer</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-muted-foreground flex justify-between">
          <span>© {new Date().getFullYear()} Juris Mind</span>
          <span>Built with care for clarity</span>
        </div>
      </div>
    </footer>
  );
};


