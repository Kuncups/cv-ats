import Link from "next/link";
import { BrutalistStar } from "./BrutalistBadge";
import { SITE_CONFIG } from "@/config/site";

export function Footer() {
  return (
    <footer className="w-full bg-black text-[#FFF000] border-t-4 border-black no-print">
      {/* Marquee Banner */}
      <div className="bg-[#FFF000] text-black py-2 overflow-hidden border-b-2 border-black font-mono font-black text-xs uppercase tracking-wider flex items-center whitespace-nowrap select-none">
        <div className="flex gap-8 animate-marquee">
          <span>DRAFT CV — CEK SKOR ATS & BUAT RESUME</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>FORMAT 1-KOLOM STANDAR RECRUITER</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>MUDAH DIBACA SISTEM HRD</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>GRATIS SELAMANYA</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>PRIVASI TERJAGA 100%</span>
          <BrutalistStar className="w-3 h-3 text-black" />
          <span>SIAP MELAMAR KERJA</span>
          <BrutalistStar className="w-3 h-3 text-black" />
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-3xl tracking-tighter uppercase text-[#FFF000]">
              DRAFT CV
            </span>
            <BrutalistStar className="w-5 h-5 text-[#FFF000]" />
          </div>
          <p className="text-white/80 font-mono text-sm max-w-md leading-relaxed">
            Membantu pencari kerja dan profesional menyusun resume yang rapi, profesional, dan mudah dipindai oleh sistem ATS perusahaan besar.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-white/50">
            <span>DIBUAT DENGAN NEXT.JS</span>
            <span>•</span>
            <span>CLOUDFLARE EDGE</span>
            <span>•</span>
            <span>GRATIS & TERBUKA</span>
          </div>
        </div>

        <div className="space-y-3 font-mono">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/20 pb-1">
            MENU UTAMA
          </h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/analyzer" className="hover:text-white transition-colors">
                {"->"} Cek Skor & Kata Kunci CV
              </Link>
            </li>
            <li>
              <Link href="/builder" className="hover:text-white transition-colors">
                {"->"} Buat CV Standar ATS
              </Link>
            </li>
            <li>
              <Link href="/#standard" className="hover:text-white transition-colors">
                {"->"} Panduan Format Standar
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-white transition-colors">
                {"->"} Pertanyaan Umum (FAQ)
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3 font-mono">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/20 pb-1">
            KEAMANAN & PRIVASI
          </h4>
          <p className="text-xs text-white/70 leading-relaxed">
            Dokumen Anda hanya dianalisis saat scanning dan langsung dihapus dari memori. Data pribadi Anda tidak pernah dijual atau disebarkan.
          </p>
          <div className="pt-2">
            <span className="inline-block bg-[#FFF000] text-black font-bold text-[10px] px-2 py-0.5 border border-black uppercase">
              DATA ANDA 100% AMAN
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/60 gap-2">
        <div>© {SITE_CONFIG.year} DRAFT CV. HAK CIPTA DILINDUNGI.</div>
        <div className="flex items-center gap-4">
          <span>BEBAS IKLAN</span>
          <span>•</span>
          <span>RAMAH PEMULA</span>
        </div>
      </div>
    </footer>
  );
}
