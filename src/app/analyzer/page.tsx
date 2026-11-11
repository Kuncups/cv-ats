"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrutalistStar, Pill } from "@/components/BrutalistBadge";
import { SITE_CONFIG } from "@/config/site";
import { AtsAnalysisResult } from "@/lib/ats-scanner";
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Info,
  Check,
  RotateCcw,
  Copy,
} from "lucide-react";

function ScoreTicker({ target }: { target: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frameId: number;
    const start = performance.now();
    const duration = 650;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return <>{current}</>;
}

export default function AnalyzerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [bridgedText, setBridgedText] = useState<string | null>(null);
  const [bridgedTitle, setBridgedTitle] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);

  const handleCopyReport = async () => {
    if (!result) return;
    const text = `HASIL EVALUASI CV - DRAFT CV
Skor Kecocokan: ${result.overallScore}% (${result.summary})
- Kecocokan Kata Kunci: ${result.matchScore}%
- Format & Tata Letak: ${result.formattingScore}%
- Konten & Pencapaian: ${result.contentScore}%
- Kelengkapan Kontak: ${result.contactScore}%

Keahlian Cocok: ${result.matchedKeywords.join(", ") || "-"}
Keahlian Disarankan: ${result.missingKeywords.join(", ") || "-"}

Saran Perbaikan:
${result.recommendations.map((r, i) => `${i + 1}. [${r.title}] ${r.advice}`).join("\n")}
`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleApplyKeywordsToBuilder = () => {
    if (!result?.missingKeywords || result.missingKeywords.length === 0) return;
    try {
      const saved = localStorage.getItem("roster_resume_draft");
      const draft = saved ? JSON.parse(saved) : null;
      if (draft && draft.skills) {
        const existingTech = draft.skills.technical
          ? draft.skills.technical.split(",").map((s: string) => s.trim().toLowerCase())
          : [];
        const toAdd = result.missingKeywords.filter(
          (kw) => !existingTech.includes(kw.toLowerCase())
        );
        if (toAdd.length > 0) {
          draft.skills.technical = draft.skills.technical
            ? `${draft.skills.technical}, ${toAdd.join(", ")}`
            : toAdd.join(", ");
          localStorage.setItem("roster_resume_draft", JSON.stringify(draft));
        }
      }
      sessionStorage.setItem("draftcv_keywords_applied", JSON.stringify(result.missingKeywords));
      router.push("/builder");
    } catch {
      router.push("/builder");
    }
  };

  // Check if user came from Builder with preloaded resume text
  useEffect(() => {
    const bridge = sessionStorage.getItem("draftcv_bridge_text");
    const title = sessionStorage.getItem("draftcv_bridge_title");
    if (bridge) {
      setBridgedText(bridge);
      setBridgedTitle(title || "Resume dari Builder");
    }
  }, []);

  const handleClearBridge = () => {
    sessionStorage.removeItem("draftcv_bridge_text");
    sessionStorage.removeItem("draftcv_bridge_title");
    setBridgedText(null);
    setBridgedTitle(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Hanya format PDF (.pdf) yang diperbolehkan.");
      return;
    }

    if (selected.size > SITE_CONFIG.security.maxFileSizeBytes) {
      setError("Ukuran file melebihi batas maksimum 2MB.");
      return;
    }

    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;

    if (dropped.type !== "application/pdf") {
      setError("Hanya format PDF (.pdf) yang diperbolehkan.");
      return;
    }

    if (dropped.size > SITE_CONFIG.security.maxFileSizeBytes) {
      setError("Ukuran file melebihi batas maksimum 2MB.");
      return;
    }

    setFile(dropped);
  };

  const handleSelectSampleJob = (index: number) => {
    const sample = SITE_CONFIG.sampleJobs[index];
    if (sample) {
      setJobDescription(sample.text);
    }
  };

  const handleAnalyze = async () => {
    if (!file && !bridgedText) {
      setError("Pilih file PDF resume atau gunakan draft dari Builder terlebih dahulu.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else if (bridgedText) {
        formData.append("directText", bridgedText);
      }
      formData.append("jobDescription", jobDescription);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const json = (await res.json()) as {
        error?: string;
        data?: AtsAnalysisResult;
      };

      if (!res.ok) {
        throw new Error(json.error || "Gagal menganalisis dokumen.");
      }

      if (json.data) {
        setResult(json.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan koneksi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-blueprint text-black flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
            <Pill variant="black">CEK SKOR CV</Pill>
            <Pill variant="white">ANALISIS KATA KUNCI</Pill>
            <Pill variant="blue">STANDAR ATS RESMI</Pill>
          </div>
          <h1 className="text-2xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-2 break-words">
            Cek Skor & Kesesuaian Kata Kunci CV Anda
          </h1>
          <p className="font-mono text-xs sm:text-base text-black/80 max-w-2xl leading-relaxed">
            Ketahui seberapa cocok CV Anda dengan lowongan yang dituju, temukan keahlian penting yang belum Anda cantumkan, dan rapikan isi CV agar peluang dipanggil wawancara kerja meningkat pesat.
          </p>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* File Upload Dropzone or Bridged Text (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] p-4 sm:p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <span className="font-mono font-bold text-xs uppercase tracking-wider">
                  [ LANGKAH 1: DOKUMEN RESUME ]
                </span>
                <span className="text-[10px] font-mono bg-[#1D4ED8] text-white px-2 py-0.5 border border-black font-bold shadow-[1px_1px_0px_#000]">
                  {bridgedText ? "DARI BUILDER" : "MAKS. 2MB"}
                </span>
              </div>

              {bridgedText ? (
                <div className="relative overflow-hidden border-3 border-black bg-blue-50/70 p-6 flex-1 flex flex-col items-center justify-center text-center space-y-3">
                  {isAnalyzing && <div className="animate-laser" />}
                  <div className="w-12 h-12 bg-[#1D4ED8] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block font-bold text-sm uppercase">
                      {bridgedTitle || "Resume Terhubung"}
                    </span>
                    <span className="block text-xs font-mono text-black/70 mt-1">
                      Data resume langsung terhubung dari Resume Builder
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearBridge}
                    className="text-xs font-mono underline hover:text-red-700 pt-2 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ganti dengan Unggah PDF Lain</span>
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`relative overflow-hidden border-3 border-dashed border-black p-8 text-center flex-1 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    file ? "bg-blue-50/80" : "bg-zinc-50 hover:bg-blue-50/40"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  {isAnalyzing && <div className="animate-laser" />}
                  <input
                    id="file-input"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-[#1D4ED8] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <span className="font-mono font-bold text-sm text-black break-all max-w-[240px]">
                        {file.name}
                      </span>
                      <span className="text-xs font-mono text-black/60">
                        {(file.size / 1024).toFixed(1)} KB • Klik untuk mengganti file
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-white text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-sm uppercase">
                        Tarik & Lepas File PDF CV ke Sini
                      </span>
                      <span className="text-xs font-mono text-black/60">
                        atau klik untuk memilih file dari komputer / HP Anda
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center gap-2 text-xs font-mono text-black/60">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  {bridgedText
                    ? "Teks CV Anda siap langsung dicocokkan dengan loker sasaran."
                    : "Format harus PDF asli (bukan hasil foto kamera atau scan gambar)."}
                </span>
              </div>
            </div>
          </div>

          {/* Job Description Input (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                <span className="font-mono font-bold text-xs uppercase tracking-wider">
                  [ LANGKAH 2: LOWONGAN KERJA SASARAN ]
                </span>
                <span className="text-[10px] font-mono text-black/60">
                  {jobDescription.length} karakter
                </span>
              </div>

              {/* Sample Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="text-[11px] font-mono font-bold text-black/70 mr-1">
                  PILIH CONTOH LOKER:
                </span>
                  {SITE_CONFIG.sampleJobs.map((sample: any, idx: number) => (
                    <button
                      key={sample.title}
                      type="button"
                      onClick={() => handleSelectSampleJob(idx)}
                      className="text-[11px] font-mono font-bold px-2 py-1 bg-zinc-100 border border-black hover:bg-[#1D4ED8] hover:text-white transition-colors cursor-pointer"
                    >
                      {sample.shortTitle || sample.title}
                    </button>
                  ))}
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Salin dan tempel deskripsi kualifikasi pekerjaan (Job Description / Requirements) yang ingin Anda lamar di sini..."
                rows={7}
                className="w-full flex-1 p-3 font-mono text-xs sm:text-sm border-2 border-black bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] resize-y"
              />

              {error && (
                <div className="mt-3 p-3 bg-red-100 border-2 border-red-600 text-red-900 font-mono text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Trigger Button */}
              <div className="mt-4 pt-3 border-t-2 border-black flex justify-end">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (!file && !bridgedText)}
                  className={`w-full sm:w-auto brutal-btn font-black px-8 py-3 text-sm font-mono uppercase flex items-center justify-center gap-2 transition-colors ${
                    isAnalyzing || (!file && !bridgedText)
                      ? "bg-black/20 text-black/50 cursor-not-allowed border-black/30 shadow-none"
                      : "bg-[#1D4ED8] text-white hover:bg-[#2563EB] shadow-[3px_3px_0px_#000]"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SEDANG MEMINDAI DOKUMEN...</span>
                    </>
                  ) : (
                    <span>ANALISIS KECOCOKAN CV SEKARANG</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Results Section */}
        {result && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Main Score Hero Card */}
            <div className="bg-black text-white border-3 sm:border-4 border-black shadow-[4px_4px_0px_#000] sm:shadow-[8px_8px_0px_#000] p-4 sm:p-8">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 pb-6 border-b-2 border-white/20">
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs uppercase tracking-wider text-white/60">
                        HASIL PEMINDAIAN
                      </span>
                      <BrutalistStar className="w-4 h-4 text-[#1D4ED8]" />
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyReport}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-black font-mono font-bold text-[11px] border border-black hover:bg-blue-100 transition-colors cursor-pointer select-none"
                      title="Salin hasil evaluasi lengkap ke clipboard"
                    >
                      {copiedReport ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-700" />
                          <span>TERSALIN!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>SALIN RINGKASAN</span>
                        </>
                      )}
                    </button>
                  </div>
                  <h2 className="text-xl sm:text-4xl font-black uppercase tracking-tight text-white mt-1 break-words">
                    {result.summary}
                  </h2>
                </div>

                {/* Score Number Display */}
                <div className="bg-[#1D4ED8] text-white border-2 sm:border-3 border-black shadow-[3px_3px_0px_#fff] sm:shadow-[4px_4px_0px_#fff] p-3 sm:p-4 text-center shrink-0 w-full md:w-auto md:min-w-[160px]">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-blue-100">
                    SKOR KECOCOKAN
                  </span>
                  <span className="text-4xl sm:text-6xl font-black font-mono tracking-tighter">
                    <ScoreTicker target={result.overallScore} />%
                  </span>
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase mt-1">
                    {result.overallScore >= 80
                      ? "SANGAT SIAP SCREENING"
                      : result.overallScore >= 60
                      ? "CUKUP BAIK (BISA DIOPTIMALKAN)"
                      : "PERLU DISESUAIKAN"}
                  </span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">KATA KUNCI LOKER</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    <ScoreTicker target={result.matchScore} />%
                  </span>
                </div>
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">STRUKTUR & TATA LETAK</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    <ScoreTicker target={result.formattingScore} />%
                  </span>
                </div>
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">TINDAKAN & PENCAPAIAN</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    <ScoreTicker target={result.contentScore} />%
                  </span>
                </div>
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">KELENGKAPAN KONTAK</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    <ScoreTicker target={result.contactScore} />%
                  </span>
                </div>
              </div>
            </div>

            {/* Keywords Match Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Matched Keywords */}
              <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6">
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h3 className="font-mono font-bold text-sm uppercase">
                      Keahlian yang Sudah Cocok ({result.matchedKeywords.length})
                    </h3>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.length > 0 ? (
                    result.matchedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-950 border border-black text-xs font-mono font-bold"
                      >
                        <span>✓</span>
                        <span>{kw}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs font-mono text-black/60 italic">
                      Belum ada kata kunci utama dari lowongan yang terdeteksi di CV Anda.
                    </p>
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-mono font-bold text-sm uppercase">
                      Saran Kata Kunci Ditambahkan ({result.missingKeywords.length})
                    </h3>
                  </div>
                  {result.missingKeywords.length > 0 && (
                    <button
                      type="button"
                      onClick={handleApplyKeywordsToBuilder}
                      className="px-3 py-1.5 bg-[#1D4ED8] text-white hover:bg-[#2563EB] font-mono font-bold text-xs border-2 border-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                      title="Salin kata kunci langsung ke draf CV Anda"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Terapkan di CV Builder</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.length > 0 ? (
                    result.missingKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-950 border border-black text-xs font-mono font-bold"
                      >
                        <span>+</span>
                        <span>{kw}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-xs font-mono text-black/60 italic">
                      Hebat! Semua keahlian utama lowongan sudah tercakup di CV Anda.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist Audit Section */}
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6">
              <div className="pb-3 mb-4 border-b-2 border-black flex items-center justify-between">
                <h3 className="font-mono font-bold text-sm uppercase">
                  Daftar Periksa Kelayakan Format CV
                </h3>
                <span className="text-xs font-mono text-black/60">
                  {result.checks.filter((c) => c.status === "pass").length} dari {result.checks.length} Kriteria Terpenuhi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="p-3 border-2 border-black bg-blue-50/50 flex items-start gap-3"
                  >
                    {chk.status === "pass" && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    )}
                    {chk.status === "warn" && (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    {chk.status === "fail" && (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase">{chk.label}</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 border border-black uppercase ${
                            chk.status === "pass"
                              ? "bg-green-300 text-black"
                              : chk.status === "warn"
                              ? "bg-amber-300 text-black"
                              : "bg-red-300 text-black"
                          }`}
                        >
                          {chk.status === "pass" ? "Lolos" : chk.status === "warn" ? "Perhatian" : "Perbaiki"}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-black/75">{chk.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations & Actionable Rewrites */}
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6">
              <div className="pb-3 mb-4 border-b-2 border-black flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-black" />
                <h3 className="font-mono font-bold text-sm uppercase">
                  Saran Praktis untuk Memperbaiki CV Anda
                </h3>
              </div>

              <div className="space-y-4">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-black text-white border-2 border-black space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-[#1D4ED8] text-white px-2 py-0.5 font-bold uppercase">
                        {rec.type === "keyword" ? "Kata Kunci" : rec.type === "impact" ? "Pencapaian" : "Format"}
                      </span>
                      <h4 className="font-bold text-sm uppercase text-white">
                        {rec.title}
                      </h4>
                    </div>
                    <p className="text-xs font-mono text-white/80 leading-relaxed">
                      {rec.advice}
                    </p>
                    {rec.example && (
                      <div className="mt-2 p-2.5 bg-white/10 border border-white/20 text-xs font-mono text-blue-200">
                        {rec.example}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Next Step CTA */}
              <div className="mt-6 pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-mono text-black/70">
                  Ingin format yang pasti 100% rapi dan lolos pembacaan sistem rekruter?
                </div>
                <Link
                  href="/builder"
                  className="brutal-btn bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-black px-6 py-2.5 text-xs font-mono uppercase inline-flex items-center shadow-[3px_3px_0px_#000]"
                >
                  <span>SUSUN CV DI RESUME BUILDER</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
