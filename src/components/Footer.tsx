export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 mt-12">
      <div className="container text-center text-sm text-muted-foreground space-y-2">
        <p>
          Data sourced from{" "}
          <a href="https://data.gov.my/data-catalogue/pricecatcher" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            data.gov.my PriceCatcher
          </a>
          {" "}under CC BY 4.0
        </p>
        <p className="text-xs">
          Ministry of Domestic Trade (KPDN) &amp; Department of Statistics Malaysia (DOSM)
        </p>
      </div>
    </footer>
  );
}
