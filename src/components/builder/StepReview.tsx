import React from "react";
import { ResumeData } from "@/types/resume";
import {
  Download,
  FileSearch,
  CheckCircle2,
} from "lucide-react";

interface StepReviewProps {
  data: ResumeData;
  updateData: (data: ResumeData) => void;
  onBack: () => void;
  onDownload: () => void;
  onBridgeToAnalyzer: () => void;
  onViewMobilePreview: () => void;
  isGeneratingPdf: boolean;
}

export function StepReview({
  data,
  updateData,
  onBack,
  onDownload,
  onBridgeToAnalyzer,
  onViewMobilePreview,
  isGeneratingPdf,
}: StepReviewProps) {
  return (
    <div className="space-y-4">
      <div className="pb-2 border-b-2 border-black">
        <h3 className="font-mono font-bold text-sm uppercase flex items-center justify-between">
          <span>6. Tinjau & Ekspor Dokumen CV</span>
          <span className="text-[10px] bg-green-300 text-black px-2 py-0.5 border border-black font-bold font-mono">
            SIAP UNDUH
          </span>
        </h3>
        <p className="text-xs text-zinc-600 mt-0.5 font-sans">
          Periksa kelengkapan isi CV Anda sebelum diunduh atau dikirim ke sistem lamaran kerja.
        </p>
      </div>

      {/* Language Options Toggle */}
      <div className="p-3 bg-zinc-50 border-2 border-black space-y-1.5">
        <span className="block text-xs font-mono font-bold uppercase">
          Bahasa Judul Dokumen CV:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => updateData({ ...data, language: "id" })}
            className={`flex-1 py-1.5 px-3 text-xs font-mono font-bold border-2 border-black uppercase transition-all cursor-pointer ${
              (data.language || "id") === "id"
                ? "bg-[#1D4ED8] text-white shadow-[2px_2px_0px_#000]"
                : "bg-white text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            🇮🇩 Bahasa Indonesia
          </button>
          <button
            type="button"
            onClick={() => updateData({ ...data, language: "en" })}
            className={`flex-1 py-1.5 px-3 text-xs font-mono font-bold border-2 border-black uppercase transition-all cursor-pointer ${
              data.language === "en"
                ? "bg-[#1D4ED8] text-white shadow-[2px_2px_0px_#000]"
                : "bg-white text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Document Completeness Checklist */}
      <div className="p-3 bg-white border-2 border-black space-y-2">
        <span className="block text-xs font-mono font-bold uppercase border-b border-black/20 pb-1">
          Cek Kelengkapan Standar ATS:
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-4 h-4 ${
                data.personal.fullName && data.personal.email
                  ? "text-green-600"
                  : "text-amber-500"
              }`}
            />
            <span>Kontak Lengkap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-4 h-4 ${
                data.summary ? "text-green-600" : "text-zinc-400"
              }`}
            />
            <span>Deskripsi Diri</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-4 h-4 ${
                data.experience.length > 0 ? "text-green-600" : "text-amber-500"
              }`}
            />
            <span>{data.experience.length} Pekerjaan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-4 h-4 ${
                data.education.length > 0 ? "text-green-600" : "text-amber-500"
              }`}
            />
            <span>{data.education.length} Pendidikan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-4 h-4 ${
                data.projects.length > 0 ? "text-green-600" : "text-zinc-400"
              }`}
            />
            <span>{data.projects.length} Organisasi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2
              className={`w-4 h-4 ${
                data.skills.technical || data.skills.tools
                  ? "text-green-600"
                  : "text-amber-500"
              }`}
            />
            <span>Keahlian & Tools</span>
          </div>
        </div>
      </div>

      {/* Primary Download & Test CTAs */}
      <div className="space-y-2 pt-2">
        <button
          type="button"
          disabled={isGeneratingPdf}
          onClick={onDownload}
          className="w-full py-3 bg-[#1D4ED8] text-white font-mono font-black text-sm border-2 border-black uppercase flex items-center justify-center gap-2 hover:bg-[#2563EB] transition-colors shadow-[4px_4px_0px_#000] cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>
            {isGeneratingPdf
              ? "MEMPROSES PDF..."
              : "UNDUH PDF VEKTOR (STANDAR ATS)"}
          </span>
        </button>

        <button
          type="button"
          onClick={onBridgeToAnalyzer}
          className="w-full py-2.5 bg-white text-black font-mono font-bold text-xs border-2 border-black uppercase flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors shadow-[3px_3px_0px_#000] cursor-pointer"
        >
          <FileSearch className="w-4 h-4" />
          <span>UJI KECOCOKAN DI ANALYZER KATA KUNCI</span>
        </button>

        {/* Mobile Only: Switch to Preview Tab */}
        <button
          type="button"
          onClick={onViewMobilePreview}
          className="lg:hidden w-full py-2 bg-zinc-100 text-black font-mono font-bold text-xs border border-black uppercase cursor-pointer"
        >
          LIHAT PRATINJAU DOKUMEN (A4)
        </button>
      </div>

      {/* Step Navigation Bottom */}
      <div className="pt-3 border-t-2 border-black flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border-2 border-black font-mono text-xs font-bold hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <span>KEMBALI EDIT</span>
        </button>
      </div>
    </div>
  );
}
