import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Price Explorer", href: "/dashboard?s=explorer" },
    { label: "AI Forecast", href: "/dashboard?s=forecast" },
    { label: "Price Map", href: "/dashboard?s=map" },
  ],
  Tools: [
    { label: "Price Timeline", href: "/dashboard?s=timeline" },
  ],
  Data: [
    { label: "data.gov.my", href: "https://data.gov.my", external: true },
    { label: "KPDN PriceCatcher", href: "https://data.gov.my", external: true },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      {/* CTA band */}
      <div className="bg-primary py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-black text-white md:text-4xl">
            Ready to shop smarter?
          </h2>
          <p className="mt-3 text-lg text-white/70">
            Track prices, predict trends, and save money — all in one place.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/dashboard">
              <Button
                size="lg"
                className="h-13 rounded-xl bg-white px-8 text-[16px] font-black text-primary hover:bg-gray-100"
              >
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-black text-white">HR</span>
            </div>
            <span className="text-lg font-black tracking-tight text-gray-900">
              Harga<span className="text-primary">Rakyat</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
            Malaysia's first AI-powered grocery price intelligence platform.
            Powered by KPDN PriceCatcher data via data.gov.my.
          </p>

        </div>

        {/* Links */}
        {Object.entries(footerLinks).map(([heading, links]) => (
          <div key={heading}>
            <h4 className="text-sm font-black uppercase tracking-wider text-gray-900">
              {heading}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {links.map((l) => (
                <li key={l.label}>
                  {"external" in l && l.external ? (
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 transition-colors hover:text-primary"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      to={l.href}
                      className="text-sm text-gray-500 transition-colors hover:text-primary"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} HargaRakyat · Data from KPDN PriceCatcher via data.gov.my
          </p>
          <p className="text-xs text-gray-400">Built for PutraHack 2026</p>
        </div>
      </div>
    </footer>
  );
}
