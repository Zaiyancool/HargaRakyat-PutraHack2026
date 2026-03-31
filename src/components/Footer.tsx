import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 mt-12">
      <div className="container text-center text-sm text-muted-foreground space-y-2">
        <p className="font-heading font-bold text-foreground text-lg">
          Harga<span className="text-primary">Rakyat</span>
        </p>
        <p className="flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-primary" />
          Data sourced from{" "}
          <a href="https://data.gov.my/data-catalogue/pricecatcher" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
            data.gov.my PriceCatcher
          </a>
          {" "}under CC BY 4.0
        </p>
        <p className="text-xs">
          Ministry of Domestic Trade (KPDN) &amp; Department of Statistics Malaysia (DOSM)
        </p>
        <p className="text-xs mt-2">
          Built for PutraHack 2026 — Food Security Track
        </p>
      </div>
    </footer>
  );
}
