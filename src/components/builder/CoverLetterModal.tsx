"use client";

import React, { useState } from "react";
import { ResumeData } from "@/types/resume";
import { Sparkles, Copy, Download, Check, X, RefreshCw } from "lucide-react";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
}

export function CoverLetterModal({ isOpen, onClose, data }: CoverLetterModalProps) {
  const [targetRole, setTargetRole] = useState(data.personal.jobTitle || "");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [language, setLanguage] = useState<"id" | "en">(data.language || "id");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultLetter, setResultLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: data,
          targetRole,
          companyName,
          jobDescription,
          language,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json.error || "Gagal membuat surat lamaran");

      if (json.data) {
        setResultLetter(json.data);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses surat lamaran.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!resultLetter) return;
    navigator.clipboard.writeText(resultLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!resultLetter) return;
    const blob = new Blob([resultLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const sanitizedRole = (targetRole || "posisi").toLowerCase().replace(/[^a-z0-9]/g, "-");
    a.download = `cover-letter-${sanitizedRole}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F8F9FA] border-3 sm:border-4 border-black shadow-[6px_6px_0px_#000] sm:shadow-[10px_10px_0px_#000] max-w-2xl w-full p-4 sm:p-6 relative max-h-[92vh] flex flex-col space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-black shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1D4ED8] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-mono font-black text-sm sm:text-base uppercase tracking-tight">
                GENERATOR SURAT LAMARAN (AI)
              </h2>
              <span className="text-[10px] font-mono text-black/60">
                Otomatis disesuaikan dengan isi CV & posisi sasaran
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-black hover:bg-black hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 font-mono text-xs">
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">
                Posisi / Jabatan Sasaran:
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Contoh: Digital Marketing Specialist"
                className="w-full p-2 border-2 border-black bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] text-xs font-sans"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase mb-1">
                Nama Perusahaan Tujuan:
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Contoh: PT Teknologi Bangsa / Startup XYZ"
                className="w-full p-2 border-2 border-black bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] text-xs font-sans"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase">Bahasa:</span>
              <div className="flex border border-black">
                <button
                  type="button"
                  onClick={() => setLanguage("id")}
                  className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
                    language === "id" ? "bg-[#1D4ED8] text-white" : "bg-white text-black hover:bg-zinc-100"
                  }`}
                >
                  🇮🇩 Indonesia
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2.5 py-1 text-[10px] font-bold cursor-pointer border-l border-black transition-colors ${
                    language === "en" ? "bg-[#1D4ED8] text-white" : "bg-white text-black hover:bg-zinc-100"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-bold text-xs border-2 border-black flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>MEMBUAT SURAT...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{resultLetter ? "GENERATE ULANG" : "GENERATE SURAT (AI)"}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-2.5 bg-red-100 border-2 border-red-600 text-red-900 text-xs">
              {error}
            </div>
          )}

          {/* Generated Result Preview */}
          {resultLetter && (
            <div className="space-y-2 pt-2 border-t-2 border-black">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-black/70">
                  HASIL SURAT LAMARAN (BISA DIEDIT LANGSUNG):
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1 bg-white hover:bg-zinc-100 border border-black text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_#000]"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "TERSALIN!" : "SALIN"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="px-2.5 py-1 bg-black text-white hover:bg-zinc-800 border border-black text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_#000]"
                  >
                    <Download className="w-3 h-3" />
                    <span>UNDUH (.TXT)</span>
                  </button>
                </div>
              </div>

              <textarea
                value={resultLetter}
                onChange={(e) => setResultLetter(e.target.value)}
                rows={11}
                className="w-full p-3 font-sans text-xs leading-relaxed border-2 border-black bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] resize-y"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
