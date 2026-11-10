import Link from "next/link";
import { BrutalistStar, DoubleArrow } from "./BrutalistBadge";
import { SITE_CONFIG } from "@/config/site";

export function Header() {
  return (
    <header className="w-full bg-[#FFF000] border-b-3 border-black sticky top-0 z-50 no-print">
      {/* Top Banner Bar */}
      <div className="bg-black text-[#FFF000] px-4 py-1.5 text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-between border-b-2 border-black">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-[#FFF000] animate-pulse"></span>
          <span>{SITE_CONFIG.year} // SYSTEM PROTOCOL: ATS COMPLIANT 100%</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span>EDGE DEPLOY: CLOUDFLARE</span>
          <span>ZERO-TRACKER</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black text-[#FFF000] flex items-center justify-center font-black text-xl border-2 border-black shadow-[3px_3px_0px_#000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            [R]
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tighter uppercase text-black leading-none">
                Rosterbag
              </span>
              <BrutalistStar className="w-4 h-4 text-black" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-black/70">
              ATS CORE // SCANNER & BUILDER
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-sm font-bold">
          {SITE_CONFIG.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-black hover:bg-black hover:text-[#FFF000] border-2 border-transparent hover:border-black transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/builder"
            className="hidden sm:inline-flex items-center gap-2 bg-white text-black font-bold px-4 py-2 border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-black hover:text-[#FFF000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-xs font-mono uppercase"
          >
            <span>BUAT RESUME</span>
            <DoubleArrow className="w-5 h-3" />
          </Link>
          <Link
            href="/analyzer"
            className="inline-flex items-center gap-2 bg-black text-[#FFF000] font-black px-4 py-2 border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-white hover:text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-xs font-mono uppercase"
          >
            <span>SCAN CV (FREE)</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
