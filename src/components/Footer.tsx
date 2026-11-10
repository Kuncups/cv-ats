import Link from "next/link";
import { BrutalistStar } from "./BrutalistBadge";
import { SITE_CONFIG } from "@/config/site";

export function Footer() {
  return (
    <footer className="w-full bg-black text-[#FFF000] border-t-4 border-black no-print">
      {/* Marquee Banner */}
      <div className="bg-[#FFF000] text-black py-2 overflow-hidden border-b-2 border-black font-mono font-black text-xs uppercase tracking-widest flex items-center whitespace-nowrap select-none">
        <div className="flex gap-8 animate-marquee">
          <span>DRAFT CV ATS SCANNER</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>ZERO-BLOAT PDF BUILDER</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>100% MACHINE-READABLE</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>CLOUDFLARE EDGE V8 RUNTIME</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>PASS RECRUITER SCREENING</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>NO MULTI-COLUMN CRASH</span>
          <BrutalistStar className="w-3 h-3 text-black" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-3xl tracking-tighter uppercase text-[#FFF000]">
              DRAFT CV
            </span>
            <BrutalistStar className="w-5 h-5 text-[#FFF000]" />
          </div>
          <p className="text-white/80 font-mono text-sm max-w-md leading-relaxed">
            Platform minimalis untuk verifikasi kompatibilitas ATS (Applicant Tracking System) dan pembuatan CV standar industri. Tanpa template warna-warni yang bikin mesin HRD error.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
            <span>PLATFORM: DARWIN</span>
            <span>•</span>
            <span>RUNTIME: EDGE WORKERS</span>
            <span>•</span>
            <span>VER: {SITE_CONFIG.version}</span>
          </div>
        </div>

        <div className="space-y-3 font-mono">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/20 pb-1">
            NAVIGASI CORE
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/analyzer" className="hover:text-white transition-colors">
                {"->"} ATS Analyzer
              </Link>
            </li>
            <li>
              <Link href="/builder" className="hover:text-white transition-colors">
                {"->"} Resume Builder
              </Link>
            </li>
            <li>
              <Link href="/#sample" className="hover:text-white transition-colors">
                {"->"} Contoh Loker & Standar
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white transition-colors">
                {"->"} Tanya Jawab (FAQ)
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3 font-mono">
          <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/20 pb-1">
            PRIVASI & KEAMANAN
          </h4>
          <p className="text-xs text-white/70 leading-relaxed">
            File PDF diproses in-memory saat scanning dan langsung di-drop. Tidak ada data CV yang dijual ke pihak ketiga.
          </p>
          <div className="pt-2">
            <span className="inline-block bg-[#FFF000] text-black font-bold text-[10px] px-2 py-0.5 border border-black uppercase">
              100% PRIVATE IN-MEMORY
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/60 gap-2">
        <div>© {SITE_CONFIG.year} DRAFT CV. ALL RIGHTS RESERVED.</div>
        <div className="flex items-center gap-4">
          <span>ZERO HARDCODED SECRETS</span>
          <span>•</span>
          <span>STRICT TYPE SAFE</span>
        </div>
      </div>
    </footer>
  );
}
