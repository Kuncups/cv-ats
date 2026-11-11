import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrutalistStar, Pill } from "@/components/BrutalistBadge";
import {
  FileSearch,
  PenTool,
  CheckCircle,
  XCircle,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-blueprint text-black flex flex-col font-sans selection:bg-[#1D4ED8] selection:text-white">
      <Header />

      <main className="flex-1 w-full">
        {/* HERO SECTION */}
        <section className="border-b-4 border-black py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-8 right-8 hidden lg:block opacity-10 pointer-events-none">
            <BrutalistStar className="w-48 h-48 text-[#1D4ED8]" />
          </div>

          <div className="w-full">
            {/* Pill Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Pill variant="black">100% GRATIS</Pill>
              <Pill variant="blue">RAPIKAN FORMAT CV</Pill>
              <Pill variant="white">TINGKATKAN PELUANG KERJA</Pill>
            </div>

            {/* Main Headline */}
            <div className="space-y-3 mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <span className="font-mono text-lg sm:text-2xl font-black bg-[#1D4ED8] text-white px-3 py-1 border-2 border-black shadow-[3px_3px_0px_#000]">
                  DRAFT CV
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-black/80">
                  MERAPIKAN CV // MEMPERBESAR PELUANG LOLOS KERJA
                </span>
              </div>

              <h1 className="text-3xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[1.05] sm:leading-[1.0] text-black break-words">
                Rapikan CV Anda. Tingkatkan Peluang Dapat Kerja.
              </h1>

              <p className="font-mono text-sm sm:text-lg text-black/85 max-w-3xl pt-2 leading-relaxed">
                Banyak kandidat hebat gagal dipanggil wawancara hanya karena susunan CV yang berantakan dan sulit dibaca sistem rekrutmen. Draft CV membantu Anda merapikan struktur resume ke standar 1-kolom ATS profesional dan memastikan isi pengalaman Anda menarik perhatian recruiter.
              </p>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
              <Link
                href="/analyzer"
                className="brutal-btn w-full sm:w-auto justify-center bg-[#1D4ED8] text-white hover:bg-[#2563EB] font-black px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-base font-mono uppercase inline-flex items-center transition-colors shadow-[4px_4px_0px_#000]"
              >
                <span>CEK SKOR CV SAYA (GRATIS)</span>
              </Link>
              <Link
                href="/builder"
                className="brutal-btn w-full sm:w-auto justify-center bg-white hover:bg-black hover:text-white text-black font-black px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-base font-mono uppercase inline-flex items-center transition-colors shadow-[4px_4px_0px_#000]"
              >
                <span>BUAT CV DENGAN BUILDER</span>
              </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t-3 border-black">
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_#000] brutal-card-hover group cursor-default">
                <span className="block font-mono text-[11px] font-bold text-black/60 uppercase group-hover:text-[#1D4ED8] transition-colors">
                  FORMAT RESMI
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono">1-KOLOM</span>
                <span className="block text-[11px] font-bold">Paling disukai HRD & mesin</span>
              </div>
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_#000] brutal-card-hover group cursor-default">
                <span className="block font-mono text-[11px] font-bold text-black/60 uppercase group-hover:text-[#1D4ED8] transition-colors">
                  WAKTU PROSES
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono">INSTAN</span>
                <span className="block text-[11px] font-bold">Analisis dalam hitungan detik</span>
              </div>
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_#000] brutal-card-hover group cursor-default">
                <span className="block font-mono text-[11px] font-bold text-black/60 uppercase group-hover:text-[#1D4ED8] transition-colors">
                  KEAMANAN DATA
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono">100% AMAN</span>
                <span className="block text-[11px] font-bold">Dokumen Anda tidak disimpan</span>
              </div>
              <div className="p-3 bg-white border-2 border-black shadow-[3px_3px_0px_#000] brutal-card-hover group cursor-default">
                <span className="block font-mono text-[11px] font-bold text-black/60 uppercase group-hover:text-[#1D4ED8] transition-colors">
                  BIAYA
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono">GRATIS</span>
                <span className="block text-[11px] font-bold">Tanpa watermark & biaya</span>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON: GRAPHIC TEMPLATE VS STANDARD ATS */}
        <section id="standard" className="border-b-4 border-black py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="w-full">
            <div className="mb-12">
              <Pill variant="blue" className="mb-2">
                PENTING UNTUK DIKETAHUI
              </Pill>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
                Kenapa Template Grafis Sering Gagal Lolos Screening?
              </h2>
              <p className="font-mono text-sm sm:text-base text-zinc-700 max-w-2xl mt-2">
                Sistem ATS (Applicant Tracking System) membaca CV sebagai teks polos berurutan dari kiri ke kanan. Desain grafis berkolom sering kali membuat tulisan Anda tercampur aduk.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* The Bad: Graphic Multi-column */}
              <div className="p-6 sm:p-8 bg-red-50 border-3 border-black shadow-[6px_6px_0px_#000] brutal-card-hover space-y-4">
                <div className="flex items-center justify-between pb-4 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <span className="font-mono font-bold text-sm uppercase text-red-900">
                      CV GRAFIS / MULTI-KOLOM
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-red-200 text-red-950 px-2 py-0.5 font-bold uppercase border border-red-400">
                    SERING BERMASALAH
                  </span>
                </div>

                <ul className="space-y-3 text-sm font-mono text-zinc-800">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">×</span>
                    <span>
                      <strong>Kolom Ganda:</strong> Kalimat di kolom kiri dan kanan sering terbaca bersambungan secara keliru oleh sistem, merusak arti kalimat pengalaman kerja Anda.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">×</span>
                    <span>
                      <strong>Grafik Skill Bar (⭐⭐⭐⭐):</strong> Mesin tidak bisa membaca gambar bintang atau bar persentase. Tuliskan nama keahlian langsung secara gamblang.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">×</span>
                    <span>
                      <strong>Foto & Ikon Hiasan:</strong> Membesarkan ukuran file tanpa memberikan poin nilai tambah pada penyaringan kualifikasi keahlian.
                    </span>
                  </li>
                </ul>
              </div>

              {/* The Good: Draft CV Standard */}
              <div className="p-6 sm:p-8 bg-blue-50/60 border-3 border-black shadow-[6px_6px_0px_#000] brutal-card-hover space-y-4">
                <div className="flex items-center justify-between pb-4 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-700" />
                    <span className="font-mono font-bold text-sm uppercase text-black">
                      STANDAR RESMI DRAFT CV
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#1D4ED8] text-white px-2 py-0.5 font-bold uppercase border border-black shadow-[1px_1px_0px_#000]">
                    TERBUKTI EFEKTIF
                  </span>
                </div>

                <ul className="space-y-3 text-sm font-mono text-zinc-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-700 font-bold">✓</span>
                    <span>
                      <strong>1-Kolom Rapi:</strong> Alur teks mengalir dari atas ke bawah. Riwayat kerja dan pendidikan dibaca secara runtut dan tepat.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-700 font-bold">✓</span>
                    <span>
                      <strong>Judul Bagian Baku:</strong> Memakai penamaan standar yang langsung dicari sistem recruiter (PENGALAMAN KERJA, PENDIDIKAN, KEAHLIAN).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-700 font-bold">✓</span>
                    <span>
                      <strong>Format PDF Bersih:</strong> File ringan, teks tajam, dan 100% bisa di-copy paste oleh recruiter saat wawancara.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* DUAL TOOLS SECTION */}
        <section className="border-b-4 border-black py-16 px-4 sm:px-6 lg:px-8 bg-blueprint">
          <div className="w-full space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Pill variant="black">FITUR UTAMA</Pill>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
                Dua Cara Cepat Merapikan CV & Memperbesar Peluang Kerja
              </h2>
              <p className="font-mono text-sm sm:text-base text-black/80">
                Pilih apakah Anda ingin mengevaluasi dan merapikan CV yang sudah ada, atau menyusun ulang CV baru yang rapi sesuai standar industri.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1: Analyzer */}
              <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] brutal-card-hover p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-[#1D4ED8] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
                    <FileSearch className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                    01. Cek Skor & Kata Kunci CV
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-zinc-700 leading-relaxed">
                    Unggah file PDF CV Anda dan masukkan teks lowongan yang ingin dilamar. Kami akan memindai kecocokan kata kunci, memeriksa kelengkapan kontak, dan memberi saran perbaikan konkret.
                  </p>

                  <div className="p-3 bg-blue-50/70 border border-black font-mono text-xs space-y-1">
                    <div className="font-bold uppercase">• Skor kecocokan kata kunci (0-100%)</div>
                    <div className="font-bold uppercase">• Daftar skill penting yang belum ada di CV</div>
                    <div className="font-bold uppercase">• Saran penyempurnaan kalimat pencapaian</div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t-2 border-black">
                  <Link
                    href="/analyzer"
                    className="brutal-btn w-full bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-black py-3 text-xs font-mono uppercase flex items-center justify-center transition-colors shadow-[3px_3px_0px_#000]"
                  >
                    <span>CEK SKOR CV SAYA SEKARANG</span>
                  </Link>
                </div>
              </div>

              {/* Feature 2: Builder */}
              <div className="bg-white border-3 border-black shadow-[8px_8px_0px_#000] brutal-card-hover p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-black text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                    02. Pembuat CV Standar ATS
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-zinc-700 leading-relaxed">
                    Isi formulir ringkas dengan panduan mudah, lihat pratinjau tampilan secara langsung, dan unduh hasil akhir sebagai PDF standar industri yang siap dikirim ke mana saja.
                  </p>

                  <div className="p-3 bg-zinc-100 border border-black font-mono text-xs space-y-1">
                    <div className="font-bold uppercase">• Tata letak 1-kolom yang rapi dan elegan</div>
                    <div className="font-bold uppercase">• Simpan draf otomatis di browser</div>
                    <div className="font-bold uppercase">• Unduh PDF resmi tanpa watermark</div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t-2 border-black">
                  <Link
                    href="/builder"
                    className="brutal-btn w-full bg-black hover:bg-[#1D4ED8] text-white font-black py-3 text-xs font-mono uppercase flex items-center justify-center transition-colors shadow-[3px_3px_0px_#000]"
                  >
                    <span>MULAI BUAT CV SEKARANG</span>
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
              <Pill variant="black">TANYA JAWAB</Pill>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "Mengapa CV standar ATS disarankan memakai format 1-kolom bersih?",
                  a: "Karena mesin pembaca CV (sistem ATS) mengubah dokumen menjadi teks mentah secara berurutan. Format 1-kolom menjamin tulisan dibaca runtut tanpa ada pengalaman kerja yang terpotong atau tercampur dengan kolom lain.",
                },
                {
                  q: "Apakah data dan dokumen CV saya aman?",
                  a: "Sangat aman. File CV Anda hanya dianalisis sementara di memori server dan langsung dihapus setelah hasil keluar. Kami tidak menyimpan atau menyebarkan dokumen Anda.",
                },
                {
                  q: "Apakah layanan ini berbayar atau ada batasan download?",
                  a: "Tidak, layanan ini 100% gratis. Anda bisa mengecek skor CV dan mengunduh hasil PDF tanpa batas dan tanpa watermark.",
                },
                {
                  q: "Apakah draft CV saya bisa hilang jika tab browser tertutup?",
                  a: "Tidak. Draft CV Anda otomatis tersimpan di browser perangkat Anda, sehingga Anda bisa melanjutkan pengisian kapan saja.",
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
        <section className="py-16 px-4 sm:px-6 bg-black text-white text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <BrutalistStar className="w-12 h-12 mx-auto text-[#1D4ED8]" />
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              Rapikan CV Anda Hari Ini, Raih Peluang Kerja Lebih Luas.
            </h2>
            <p className="font-mono text-sm sm:text-base text-white/80 max-w-xl mx-auto">
              Tingkatkan peluang dipanggil wawancara dengan susunan CV yang rapi, profesional, dan mudah dipahami oleh tim rekruter.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/analyzer"
                className="brutal-btn bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-black px-8 py-3.5 text-sm font-mono uppercase inline-flex items-center shadow-[4px_4px_0px_#fff]"
              >
                <span>RAPIKAN & CEK CV SAYA SEKARANG</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
