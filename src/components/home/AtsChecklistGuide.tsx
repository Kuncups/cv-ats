"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { Pill } from "@/components/BrutalistBadge";

interface ChecklistItem {
  id: string;
  title: string;
  importance: "WAJIB" | "PENTING" | "REKOMENDASI";
  description: string;
  tip: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "layout",
    title: "Format 1-Kolom Tanpa Tabel Rumit",
    importance: "WAJIB",
    description:
      "Sistem ATS mengekstrak teks baris per baris dari kiri ke kanan. Desain 2 kolom sering menyebabkan pengalaman kerja dan tanggal bercampur secara keliru.",
    tip: "Gunakan hierarki judul vertikal yang bersih tanpa text-box atau tabel bersarang.",
  },
  {
    id: "metrics",
    title: "Pencapaian Terukur (Metode STAR & Angka)",
    importance: "PENTING",
    description:
      "Rekruter dan algoritma menyukai poin pencapaian nyata, bukan sekadar daftar tugas harian pasif.",
    tip: "Awali dengan kata kerja aktif + konteks + angka terukur (misal: 'Meningkatkan konversi penjualan 28% dalam 3 bulan').",
  },
  {
    id: "keywords",
    title: "Kesesuaian Kata Kunci & Hard Skill",
    importance: "WAJIB",
    description:
      "ATS menyaring kandidat berdasarkan kecocokan istilah keahlian teknis antara CV dengan deskripsi lowongan pekerjaan.",
    tip: "Tuliskan istilah baku secara eksplisit (contoh: 'PostgreSQL', 'Digital Marketing', 'Financial Modeling') tanpa disingkat aneh.",
  },
  {
    id: "dates",
    title: "Format Tanggal Konsisten (Bulan & Tahun)",
    importance: "WAJIB",
    description:
      "ATS mengurai tanggal untuk mengkalkulasi total tahun pengalaman kerja dan durasi tiap posisi kerja.",
    tip: "Gunakan format seragam seperti 'Jan 2022 - Mar 2024' atau '01/2022 - Sekarang' pada seluruh riwayat karier.",
  },
  {
    id: "contact",
    title: "Kontak Lengkap Tanpa Data Privasi Berlebih",
    importance: "PENTING",
    description:
      "Kontak esensial harus mudah diakses rekruter, tanpa membebani CV dengan data sensitif yang tidak relevan.",
    tip: "Cantumkan nama lengkap, email profesional, nomor telepon/WhatsApp, domisili kota, dan tautan LinkedIn/portofolio.",
  },
  {
    id: "pdf",
    title: "File PDF Teks Vektor (Bisa Dicopy-Paste)",
    importance: "WAJIB",
    description:
      "Banyak pelamar gagal karena mengunggah PDF hasil scan foto atau gambar Canva yang tidak memuat teks riil di dalamnya.",
    tip: "Uji dengan memblok teks di PDF. Jika teks bisa disorot dan disalin, ATS dapat membaca dokumen Anda dengan sempurna.",
  },
];

export function AtsChecklistGuide() {
  const [checkedIds, setCheckedIds] = useState<string[]>([
    "layout",
    "pdf",
  ]);
  const [expandedId, setExpandedId] = useState<string | null>("layout");

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const scorePercentage = Math.round((checkedIds.length / CHECKLIST_ITEMS.length) * 100);

  return (
    <section id="guide" className="border-b-4 border-black py-12 sm:py-16 px-3 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 border-black">
          <div>
            <Pill variant="blue" className="mb-2">
              PANDUAN INTERAKTIF HRD
            </Pill>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              Checklist Kesiapan Lolos Screening ATS
            </h2>
            <p className="font-mono text-sm sm:text-base text-zinc-700 mt-2 max-w-3xl">
              Centang poin-poin berikut untuk menguji apakah format CV Anda saat ini sudah memenuhi standar penyaringan rekrutmen modern.
            </p>
          </div>

          {/* Live Readiness Counter */}
          <div className="bg-white border-2 border-black p-3.5 shadow-[4px_4px_0px_#000] min-w-[240px]">
            <div className="flex items-center justify-between font-mono text-xs font-bold uppercase mb-1">
              <span>KESIAPAN CV:</span>
              <span className="text-[#1D4ED8]">{scorePercentage}%</span>
            </div>
            <div className="w-full h-3 bg-zinc-200 border border-black overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  scorePercentage >= 80
                    ? "bg-green-500"
                    : scorePercentage >= 50
                    ? "bg-amber-400"
                    : "bg-[#1D4ED8]"
                }`}
                style={{ width: `${scorePercentage}%` }}
              />
            </div>
            <span className="block font-mono text-[10px] text-zinc-600 mt-1.5">
              {checkedIds.length} dari {CHECKLIST_ITEMS.length} kriteria terpenuhi
            </span>
          </div>
        </div>

        {/* Interactive Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`border-3 border-black p-4 sm:p-5 transition-all shadow-[4px_4px_0px_#000] ${
                  isChecked ? "bg-blue-50/60" : "bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleCheck(item.id)}
                    className={`w-6 h-6 shrink-0 border-2 border-black flex items-center justify-center cursor-pointer transition-colors ${
                      isChecked ? "bg-[#1D4ED8] text-white" : "bg-white hover:bg-zinc-100"
                    }`}
                    aria-label={`Tandai ${item.title}`}
                  >
                    {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <h3
                        onClick={() => toggleCheck(item.id)}
                        className={`font-mono text-xs sm:text-sm font-bold uppercase cursor-pointer select-none ${
                          isChecked ? "text-black line-through opacity-80" : "text-black"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 border border-black uppercase ${
                          item.importance === "WAJIB"
                            ? "bg-red-200 text-red-950"
                            : item.importance === "PENTING"
                            ? "bg-amber-200 text-amber-950"
                            : "bg-zinc-200 text-zinc-900"
                        }`}
                      >
                        {item.importance}
                      </span>
                    </div>

                    <p className="font-sans text-xs text-zinc-700 leading-relaxed">
                      {item.description}
                    </p>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="font-mono text-[11px] text-[#1D4ED8] hover:underline font-bold flex items-center gap-1 cursor-pointer pt-1"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>{isExpanded ? "Sembunyikan Tips HRD" : "Lihat Tips Penerapan"}</span>
                    </button>

                    {isExpanded && (
                      <div className="p-2.5 bg-yellow-50 border border-black/40 font-mono text-[11px] text-zinc-800 leading-normal animate-in fade-in duration-150">
                        <strong>💡 Tips Penerapan:</strong> {item.tip}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary & Action Banner */}
        <div className="p-6 bg-black text-white border-3 border-black shadow-[6px_6px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1D4ED8] text-white flex items-center justify-center border-2 border-white shadow-[2px_2px_0px_#fff] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase text-zinc-300">
                STATUS KESIAPAN: {scorePercentage >= 80 ? "SANGAT BAIK" : "PERLU DIRAPIKAN"}
              </div>
              <div className="font-mono text-sm font-bold uppercase">
                {scorePercentage === 100
                  ? "Semua kriteria lolos! CV Anda siap dikirim ke portal lowongan."
                  : "Buat CV baru yang otomatis memenuhi seluruh standar di atas."}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/builder"
              className="w-full sm:w-auto brutal-btn bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-mono font-bold text-xs uppercase px-5 py-2.5 flex items-center justify-center gap-2 border-2 border-white shadow-[3px_3px_0px_#fff]"
            >
              <span>BUAT CV OTOMATIS ATS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
