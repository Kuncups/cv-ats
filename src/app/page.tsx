import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrutalistStar, DoubleArrow, Pill } from "@/components/BrutalistBadge";
import { SITE_CONFIG } from "@/config/site";
import {
  FileSearch,
  PenTool,
  CheckCircle,
  XCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Cpu,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FFF000] text-black flex flex-col font-sans selection:bg-black selection:text-[#FFF000]">
      <Header />

      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="border-b-4 border-black py-12 sm:py-20 px-4 sm:px-6 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-8 right-8 hidden lg:block opacity-20 pointer-events-none">
            <BrutalistStar className="w-48 h-48 text-black" />
          </div>

          <div className="max-w-7xl mx-auto">
            {/* Pill Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Pill variant="black">NEW STYLE</Pill>
              <Pill variant="white">TRENDS 2026</Pill>
              <Pill variant="yellow">UNIVERSAL CONCEPT</Pill>
              <Pill variant="white">GENERATION ATS</Pill>
            </div>

            {/* Main Headline */}
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xl sm:text-3xl font-black bg-black text-[#FFF000] px-3 py-1 border-2 border-black">
                  20 ⇒ 26
                </span>
                <DoubleArrow className="w-12 h-6 text-black hidden sm:block" />
                <span className="font-mono text-sm sm:text-base font-bold uppercase tracking-widest text-black/80">
                  STANDARD SCREENING PROTOCOL
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-black">
                Lolos Screening HRD Tanpa Slop.
              </h1>

              <p className="font-mono text-base sm:text-xl text-black/85 max-w-3xl pt-4 leading-relaxed">
                75% CV ditolak sebelum dibaca manusia karena template multi-kolom yang membingungkan parser ATS. Audit skor kecocokan kata kunci dan bangun resume 1-kolom baku dalam hitungan menit.
              </p>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/analyzer"
                className="brutal-btn bg-black text-[#FFF000] font-black px-8 py-4 text-sm sm:text-base font-mono uppercase inline-flex items-center gap-3"
              >
                <span>SCAN MATCH SCORE CV (GRATIS)</span>
                <DoubleArrow className="w-6 h-3 text-[#FFF000]" />
              </Link>
              <Link
                href="/builder"
                className="brutal-btn bg-white text-black font-black px-8 py-4 text-sm sm:text-base font-mono uppercase inline-flex items-center gap-2"
              >
                <span>BUAT RESUME STANDAR ATS</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t-3 border-black">
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="block font-mono text-[11px] font-bold text-black/60 uppercase">
                  COMPLIANCE
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono">100%</span>
                <span className="block text-[11px] font-bold">Standard Single Column</span>
              </div>
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="block font-mono text-[11px] font-bold text-black/60 uppercase">
                  LATENCY RUNTIME
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono">&lt; 80ms</span>
                <span className="block text-[11px] font-bold">Cloudflare Edge V8</span>
              </div>
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="block font-mono text-[11px] font-bold text-black/60 uppercase">
                  PRIVACY PROTOCOL
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono">ZERO</span>
                <span className="block text-[11px] font-bold">In-Memory PDF Drop</span>
              </div>
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_#000]">
                <span className="block font-mono text-[11px] font-bold text-black/60 uppercase">
                  SERVER OVERHEAD
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono">$0.00</span>
                <span className="block text-[11px] font-bold">Native Vector Print</span>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON: CANVA SLOP VS DRAFT CV ATS */}
        <section id="standard" className="border-b-4 border-black py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <Pill variant="yellow" className="mb-2">
                CRITICAL WARNING
              </Pill>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
                Kenapa Template Grafis Menghancurkan Karir Anda?
              </h2>
              <p className="font-mono text-sm sm:text-base text-zinc-700 max-w-2xl mt-2">
                Applicant Tracking System (Workday, Taleo, Greenhouse, Lever) adalah bot parser teks, bukan desainer grafis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* The Bad: Multi Column Graphic CV */}
              <div className="p-6 sm:p-8 bg-red-50 border-3 border-black shadow-[6px_6px_0px_#000] space-y-4">
                <div className="flex items-center justify-between pb-4 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <span className="font-mono font-bold text-sm uppercase text-red-900">
                      CV KREATIF / MULTI-KOLOM
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-red-200 text-red-950 px-2 py-0.5 font-bold uppercase border border-red-400">
                    RISIKO GUGUR 85%
                  </span>
                </div>

                <ul className="space-y-3 text-sm font-mono text-zinc-800">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">×</span>
                    <span>
                      <strong>Kolom Ganda:</strong> Parser ATS membaca horizontal dari kiri ke kanan. Teks kolom kiri dan kanan tercampur aduk jadi kalimat rusak.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">×</span>
                    <span>
                      <strong>Grafik Skill Bar (⭐⭐⭐⭐):</strong> Mesin tidak bisa membaca rating visual 4/5 bintang. Angka skill Anda diabaikan total.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">×</span>
                    <span>
                      <strong>Ikon & Foto:</strong> Menambah ukuran file dan berisiko bias screening tanpa menambah skor relevansi kualifikasi.
                    </span>
                  </li>
                </ul>
              </div>

              {/* The Good: Draft CV ATS Standard */}
              <div className="p-6 sm:p-8 bg-[#FFF000]/15 border-3 border-black shadow-[6px_6px_0px_#000] space-y-4">
                <div className="flex items-center justify-between pb-4 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                    <span className="font-mono font-bold text-sm uppercase text-black">
                      DRAFT CV ATS STANDARD
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#FFF000] text-black px-2 py-0.5 font-bold uppercase border border-black">
                    100% TERBACA MESIN
                  </span>
                </div>

                <ul className="space-y-3 text-sm font-mono text-zinc-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-700 font-bold">✓</span>
                    <span>
                      <strong>1-Kolom Linear:</strong> Urutan teks mengalir terstruktur. Riwayat kerja dibaca runtut dari posisi terkini.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-700 font-bold">✓</span>
                    <span>
                      <strong>Heading Baku:</strong> Menggunakan label universal yang dicari sistem (EXPERIENCE, EDUCATION, SKILLS).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-700 font-bold">✓</span>
                    <span>
                      <strong>High Vector Selectable:</strong> Ekspor langsung melalui browser render engine. Teks tajam, ukuran file ringan (&lt; 60KB).
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* DUAL CORE FEATURES */}
        <section className="border-b-4 border-black py-16 px-4 sm:px-6 bg-[#FFF000]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Pill variant="black">DUAL PROTOCOL</Pill>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
                Dua Alat yang Anda Butuhkan
              </h2>
              <p className="font-mono text-sm sm:text-base text-black/80">
                Verifikasi resume yang sudah Anda punya, atau bangun resume baru dari awal tanpa kompromi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1: Analyzer */}
              <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-black text-[#FFF000] flex items-center justify-center border-2 border-black">
                    <FileSearch className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                    01. ATS Match Analyzer
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-zinc-700 leading-relaxed">
                    Unggah PDF CV dan tempel deskripsi lowongan target. Algoritma kami mengekstrak teks via <code className="bg-zinc-200 px-1 font-bold">unpdf</code>, menghitung density kata kunci, mengecek data kontak, dan memberikan daftar keyword yang hilang.
                  </p>

                  <div className="p-3 bg-[#FFF000]/20 border border-black font-mono text-xs space-y-1">
                    <div className="font-bold uppercase">• Deteksi Dokumen Scan vs Teks Asli</div>
                    <div className="font-bold uppercase">• Perhitungan Skor Match 0-100%</div>
                    <div className="font-bold uppercase">• Rekomendasi Action Verbs & Angka</div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t-2 border-black">
                  <Link
                    href="/analyzer"
                    className="brutal-btn w-full bg-black text-[#FFF000] font-black py-3 text-xs font-mono uppercase flex items-center justify-center gap-2"
                  >
                    <span>COBA ATS ANALYZER</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Feature 2: Builder */}
              <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#FFF000] text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                    02. Standard Resume Builder
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-zinc-700 leading-relaxed">
                    Form input terarah dengan live preview instan. Ekspor langsung ke format PDF standar ATS menggunakan CSS Print browser murni. Nol server render, nol margin error, dan data tetap tersimpan aman di perangkat Anda.
                  </p>

                  <div className="p-3 bg-[#FFF000]/20 border border-black font-mono text-xs space-y-1">
                    <div className="font-bold uppercase">• Layout 1-Kolom Industri Standar</div>
                    <div className="font-bold uppercase">• Simpan & Muat via JSON Lokal</div>
                    <div className="font-bold uppercase">• Cetak Native Vector 100% Readable</div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t-2 border-black">
                  <Link
                    href="/builder"
                    className="brutal-btn w-full bg-[#FFF000] text-black font-black py-3 text-xs font-mono uppercase flex items-center justify-center gap-2"
                  >
                    <span>BUKA RESUME BUILDER</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="border-b-4 border-black py-16 px-4 sm:px-6 bg-white">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <Pill variant="black">FAQ</Pill>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Mengapa template resume yang dihasilkan hanya hitam-putih 1-kolom?",
                  a: "Karena parser ATS mengonversi dokumen menjadi teks mentah (plain text) tanpa peduli estetika warna. Layout 1-kolom hitam-putih menjamin teks dibaca secara sekuensial tanpa risiko kolom terpotong atau tercampur.",
                },
                {
                  q: "Apakah data CV yang saya unggah disimpan di database?",
                  a: "Tidak. Dokumen PDF Anda diproses secara in-memory di Edge isolate saat scanning berlangsung dan langsung dibuang setelah analisis selesai. Kami tidak mengarsipkan file CV Anda.",
                },
                {
                  q: "Berapa biaya penggunaan platform ini?",
                  a: "100% gratis untuk pemindaian dan pembuatan resume standar. Tidak ada biaya tersembunyi atau watermark pada file PDF yang di-export.",
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 border-2 border-black bg-zinc-50 shadow-[4px_4px_0px_#000] space-y-2"
                >
                  <h4 className="font-bold text-base uppercase font-sans text-black">
                    {faq.q}
                  </h4>
                  <p className="font-mono text-xs sm:text-sm text-zinc-700 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-16 px-4 sm:px-6 bg-black text-[#FFF000] text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <BrutalistStar className="w-12 h-12 mx-auto text-[#FFF000]" />
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
              Siapkan CV Terbaik Anda Sekarang.
            </h2>
            <p className="font-mono text-sm sm:text-base text-white/80 max-w-xl mx-auto">
              Jangan biarkan kualifikasi Anda gugur hanya gara-gara tata letak file yang tidak kompatibel dengan mesin recruiter.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/analyzer"
                className="brutal-btn bg-[#FFF000] text-black font-black px-8 py-3.5 text-sm font-mono uppercase inline-flex items-center gap-2"
              >
                <span>SCAN CV SEKARANG</span>
                <DoubleArrow className="w-5 h-3 text-black" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
