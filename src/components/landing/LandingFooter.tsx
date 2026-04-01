import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-4 md:px-6">
        {/* Brand */}
        <div className="md:col-span-1">
          <span className="text-lg font-black text-foreground">
            Harga<span className="text-primary">Rakyat</span>
          </span>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Malaysia's first AI-powered grocery price intelligence platform.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-sm font-bold text-foreground">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li><Link to="/dashboard?s=explorer" className="hover:text-foreground">Price Explorer</Link></li>
            <li><Link to="/dashboard?s=forecast" className="hover:text-foreground">AI Forecast</Link></li>
            <li><Link to="/dashboard?s=map" className="hover:text-foreground">Price Map</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">Tools</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/dashboard?s=stores" className="hover:text-foreground">Store Finder</Link></li>
            <li><Link to="/dashboard?s=optimizer" className="hover:text-foreground">Basket Optimizer</Link></li>
            <li><Link to="/dashboard?s=timeline" className="hover:text-foreground">Price Timeline</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground">About</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="https://data.gov.my" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                data.gov.my
              </a>
            </li>
            <li className="text-xs text-muted-foreground/70">PutraHack 2026 — Food Security Track</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-border px-4 pt-6 md:px-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} HargaRakyat. Data sourced from KPDN
          PriceCatcher via data.gov.my.
        </p>
      </div>
    </footer>
  );
}
