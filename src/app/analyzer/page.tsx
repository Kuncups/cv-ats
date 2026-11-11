"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrutalistStar, DoubleArrow, Pill } from "@/components/BrutalistBadge";
import { SITE_CONFIG } from "@/config/site";
import { AtsAnalysisResult } from "@/lib/ats-scanner";
import {
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  Check,
  RotateCcw,
} from "lucide-react";

export default function AnalyzerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [bridgedText, setBridgedText] = useState<string | null>(null);
  const [bridgedTitle, setBridgedTitle] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);

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

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Pill variant="black">CEK SKOR CV</Pill>
            <Pill variant="white">ANALISIS KATA KUNCI</Pill>
            <Pill variant="yellow">STANDAR ATS RESMI</Pill>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-2">
            Cek Skor & Kesesuaian Kata Kunci CV Anda
          </h1>
          <p className="font-mono text-sm sm:text-base text-black/80 max-w-2xl leading-relaxed">
            Ketahui seberapa cocok CV Anda dengan lowongan yang dituju, temukan keahlian penting yang belum Anda cantumkan, dan dapatkan saran perbaikan praktis agar lebih berpeluang lolos screening HRD.
          </p>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* File Upload Dropzone or Bridged Text (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <span className="font-mono font-bold text-xs uppercase tracking-wider">
                  [ LANGKAH 1: DOKUMEN RESUME ]
                </span>
                <span className="text-[10px] font-mono bg-[#FFF000] px-2 py-0.5 border border-black font-bold">
                  {bridgedText ? "DARI BUILDER" : "MAKS. 2MB"}
                </span>
              </div>

              {bridgedText ? (
                <div className="border-3 border-black bg-[#FFF000]/25 p-6 flex-1 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-12 h-12 bg-black text-[#FFF000] flex items-center justify-center border-2 border-black">
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
                    className="text-xs font-mono underline hover:text-red-700 pt-2 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ganti dengan Unggah PDF Lain</span>
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-3 border-dashed border-black p-8 text-center flex-1 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    file ? "bg-[#FFF000]/20" : "bg-[#FFF000]/5 hover:bg-[#FFF000]/10"
                  }`}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-black text-[#FFF000] flex items-center justify-center border-2 border-black">
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
                      className="text-[11px] font-mono font-bold px-2 py-1 bg-[#FFF000] border border-black hover:bg-black hover:text-[#FFF000] transition-colors"
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
                className="w-full flex-1 p-3 font-mono text-xs sm:text-sm border-2 border-black bg-[#FFF000]/5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black resize-y"
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
                  className={`w-full sm:w-auto brutal-btn font-black px-8 py-3 text-sm font-mono uppercase flex items-center justify-center gap-2 ${
                    isAnalyzing || (!file && !bridgedText)
                      ? "bg-black/20 text-black/50 cursor-not-allowed border-black/30 shadow-none"
                      : "bg-black text-[#FFF000]"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SEDANG MEMINDAI DOKUMEN...</span>
                    </>
                  ) : (
                    <>
                      <span>ANALISIS KECOCOKAN CV SEKARANG</span>
                      <DoubleArrow className="w-5 h-3" />
                    </>
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
            <div className="bg-black text-[#FFF000] border-4 border-black shadow-[8px_8px_0px_#000] p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b-2 border-white/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs uppercase tracking-wider text-white/60">
                      HASIL PEMINDAIAN
                    </span>
                    <BrutalistStar className="w-4 h-4 text-[#FFF000]" />
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
                    {result.summary}
                  </h2>
                </div>

                {/* Score Number Display */}
                <div className="bg-[#FFF000] text-black border-3 border-black shadow-[4px_4px_0px_#fff] p-4 text-center shrink-0 min-w-[160px]">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-wider">
                    SKOR KECOCOKAN
                  </span>
                  <span className="text-5xl sm:text-6xl font-black font-mono tracking-tighter">
                    {result.overallScore}%
                  </span>
                  <span className="block text-[11px] font-bold uppercase mt-1">
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
                    {result.matchScore}%
                  </span>
                </div>
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">STRUKTUR & TATA LETAK</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {result.formattingScore}%
                  </span>
                </div>
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">TINDAKAN & PENCAPAIAN</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {result.contentScore}%
                  </span>
                </div>
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">KELENGKAPAN KONTAK</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {result.contactScore}%
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
                      className="px-3 py-1.5 bg-black text-[#FFF000] hover:bg-[#FFF000] hover:text-black font-mono font-bold text-xs border-2 border-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000]"
                      title="Salin kata kunci langsung ke draf CV Anda"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Terapkan di CV Builder →</span>
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
                    className="p-3 border-2 border-black bg-[#FFF000]/10 flex items-start gap-3"
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
                <Sparkles className="w-5 h-5 text-black" />
                <h3 className="font-mono font-bold text-sm uppercase">
                  Saran Praktis untuk Memperbaiki CV Anda
                </h3>
              </div>

              <div className="space-y-4">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-black text-white border-2 border-black space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-[#FFF000] text-black px-2 py-0.5 font-bold uppercase">
                        {rec.type === "keyword" ? "Kata Kunci" : rec.type === "impact" ? "Pencapaian" : "Format"}
                      </span>
                      <h4 className="font-bold text-sm uppercase text-[#FFF000]">
                        {rec.title}
                      </h4>
                    </div>
                    <p className="text-xs font-mono text-white/80 leading-relaxed">
                      {rec.advice}
                    </p>
                    {rec.example && (
                      <div className="mt-2 p-2.5 bg-white/10 border border-white/20 text-xs font-mono text-[#FFF000]">
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
                  className="brutal-btn bg-[#FFF000] text-black font-black px-6 py-2.5 text-xs font-mono uppercase inline-flex items-center gap-2"
                >
                  <span>SUSUN CV DI RESUME BUILDER</span>
                  <ArrowRight className="w-4 h-4" />
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
