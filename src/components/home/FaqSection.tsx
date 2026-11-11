"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles, MessageCircleQuestion } from "lucide-react";
import { Pill, BrutalistStar } from "@/components/BrutalistBadge";

const FAQ_ITEMS = [
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
    a: "Tidak. Draft CV Anda otomatis tersimpan di browser perangkat Anda, dan jika Anda masuk akun, seluruh draf juga tersinkronisasi ke cloud sehingga bisa dilanjutkan kapan saja dari perangkat lain.",
  },
  {
    q: "Apakah surat lamaran kerja (cover letter) bisa dibuat otomatis?",
    a: "Bisa. Di halaman Builder tersedia tombol Buat Cover Letter (AI) yang menyusun surat lamaran formal sesuai pengalaman CV, posisi sasaran, dan nama perusahaan tujuan. Hasilnya bisa diedit, disalin, atau diunduh sebagai file teks.",
  },
  {
    q: "Bolehkah memilih font Serif untuk CV ATS?",
    a: "Boleh. Builder menyediakan pilihan Sans (Helvetica) dan Serif (Times) yang keduanya merupakan font standar PDF dan aman dibaca mesin ATS. Hindari font dekoratif atau hasil desain grafis.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="border-b-4 border-black py-12 sm:py-16 px-3 sm:px-6 lg:px-8 bg-white">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Title, Intro & CTA */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          <div>
            <Pill variant="black" className="mb-2">
              TANYA JAWAB
            </Pill>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="font-mono text-sm sm:text-base text-zinc-700 mt-3 max-w-lg">
              Rangkuman jawaban singkat seputar format CV ATS, keamanan data, penyimpanan draf, dan fitur surat lamaran otomatis.
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FA] border-2 border-black shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5 text-[#1D4ED8]" />
              <span className="font-mono text-xs font-bold uppercase">
                Masih ada pertanyaan lain?
              </span>
            </div>
            <p className="font-mono text-xs text-zinc-700 leading-relaxed">
              Mulai langsung dengan memeriksa CV Anda atau susun CV baru yang sudah otomatis mengikuti standar ATS.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/analyzer"
                className="flex-1 min-w-[140px] text-center px-3 py-2 bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-mono font-bold text-[11px] uppercase border-2 border-black shadow-[2px_2px_0px_#000] transition-colors"
              >
                Cek Skor CV
              </Link>
              <Link
                href="/builder"
                className="flex-1 min-w-[140px] text-center px-3 py-2 bg-black hover:bg-[#1D4ED8] text-white font-mono font-bold text-[11px] uppercase border-2 border-black shadow-[2px_2px_0px_#000] transition-colors"
              >
                Buat CV Baru
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pt-2 opacity-60">
            <BrutalistStar className="w-5 h-5 text-[#1D4ED8]" />
            <span className="font-mono text-[10px] uppercase tracking-wide">
              Jawaban disusun sesuai praktik rekrutmen HRD
            </span>
          </div>
        </div>

        {/* Right Column: Accordion Dropdowns */}
        <div className="lg:col-span-7 space-y-3">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border-3 border-black transition-shadow ${
                  isOpen
                    ? "bg-blue-50/60 shadow-[5px_5px_0px_#000]"
                    : "bg-[#F8F9FA] shadow-[3px_3px_0px_#000]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer select-none"
                >
                  <span className="flex items-start gap-3">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border border-black shrink-0 mt-0.5 ${
                        isOpen ? "bg-[#1D4ED8] text-white" : "bg-white text-black"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans font-bold text-sm sm:text-base uppercase leading-snug text-black">
                      {faq.q}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#1D4ED8]" : "rotate-0 text-black/60"
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="pt-3 border-t border-black/15 pl-0 sm:pl-9">
                      <p className="font-mono text-xs sm:text-sm text-zinc-700 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-center gap-2 pt-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span className="font-mono text-[10px] text-zinc-600 uppercase">
              Tips: klik pertanyaan untuk membuka jawaban
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
