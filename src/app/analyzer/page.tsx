"use client";

import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";

export default function AnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);

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
    if (!file) {
      setError("Pilih atau unggah file resume PDF terlebih dahulu.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
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
    <div className="min-h-screen bg-[#FFF000] text-black flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Pill variant="black">ATS SCANNER ENGINE</Pill>
            <Pill variant="white">REALTIME PARSER</Pill>
            <Pill variant="yellow">CLOUDFLARE EDGE</Pill>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none mb-2">
            Audit Skor ATS & Keyword Match
          </h1>
          <p className="font-mono text-sm sm:text-base text-black/80 max-w-2xl">
            Sistem memindai struktur teks digital, heading baku, metrik pencapaian, dan mencocokkan kata kunci resume Anda dengan kriteria lowongan kerja sasaran.
          </p>
        </div>

        {/* Input Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* File Upload Dropzone (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                <span className="font-mono font-bold text-xs uppercase tracking-wider">
                  [ STEP 01: UNGGAH PDF CV ]
                </span>
                <span className="text-[10px] font-mono bg-[#FFF000] px-2 py-0.5 border border-black font-bold">
                  MAX 2MB
                </span>
              </div>

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
                      {(file.size / 1024).toFixed(1)} KB • Klik untuk ganti
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white text-black flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm uppercase">
                      Tarik & Letakkan File PDF di Sini
                    </span>
                    <span className="text-xs font-mono text-black/60">
                      atau klik untuk menjelajah file dari perangkat
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t-2 border-black/10 flex items-center gap-2 text-xs font-mono text-black/60">
                <Info className="w-4 h-4 shrink-0" />
                <span>Format harus PDF asli (bukan gambar scan/foto kamera).</span>
              </div>
            </div>
          </div>

          {/* Job Description Input (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-black">
                <span className="font-mono font-bold text-xs uppercase tracking-wider">
                  [ STEP 02: TARGET LOWONGAN KERJA ]
                </span>
                <span className="text-[10px] font-mono text-black/60">
                  {jobDescription.length} karakter
                </span>
              </div>

              {/* Sample Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mb-3">
                <span className="text-[11px] font-mono font-bold text-black/70 mr-1">
                  CONTOH LOKER:
                </span>
                {SITE_CONFIG.sampleJobs.map((sample, idx) => (
                  <button
                    key={sample.title}
                    type="button"
                    onClick={() => handleSelectSampleJob(idx)}
                    className="text-[11px] font-mono font-bold px-2 py-1 bg-[#FFF000] border border-black hover:bg-black hover:text-[#FFF000] transition-colors"
                  >
                    {sample.title}
                  </button>
                ))}
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Tempel teks deskripsi pekerjaan (Job Description / Requirements) di sini..."
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
                  disabled={isAnalyzing || !file}
                  className={`w-full sm:w-auto brutal-btn font-black px-8 py-3 text-sm font-mono uppercase flex items-center justify-center gap-2 ${
                    isAnalyzing || !file
                      ? "bg-black/20 text-black/50 cursor-not-allowed border-black/30 shadow-none"
                      : "bg-black text-[#FFF000]"
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>MEMINDAI DOKUMEN...</span>
                    </>
                  ) : (
                    <>
                      <span>MULAI AUDIT ATS</span>
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
                    <span className="font-mono text-xs uppercase tracking-widest text-white/60">
                      STATUS HASIL PEMINDAIAN
                    </span>
                    <BrutalistStar className="w-4 h-4 text-[#FFF000]" />
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
                    {result.summary}
                  </h2>
                </div>

                {/* Score Number Display */}
                <div className="bg-[#FFF000] text-black border-3 border-black shadow-[4px_4px_0px_#fff] p-4 text-center shrink-0 min-w-[160px]">
                  <span className="block font-mono text-[10px] font-bold uppercase tracking-widest">
                    SKOR ATS TOTAL
                  </span>
                  <span className="text-5xl sm:text-6xl font-black font-mono tracking-tighter">
                    {result.overallScore}%
                  </span>
                  <span className="block text-[11px] font-bold uppercase mt-1">
                    {result.overallScore >= 80
                      ? "SIAP SCREENING"
                      : result.overallScore >= 60
                      ? "PERLU OPTIMASI"
                      : "RISIKO TINGGI"}
                  </span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">KEYWORD MATCH</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {result.matchScore}%
                  </span>
                </div>
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">FORMAT & STRUKTUR</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {result.formattingScore}%
                  </span>
                </div>
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">ACTION VERBS & METRIK</span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                    {result.contentScore}%
                  </span>
                </div>
                <div className="border-2 border-white/30 p-3 bg-white/5">
                  <span className="block text-xs font-mono text-white/60">DATA KONTAK</span>
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
                      Kata Kunci Ditemukan ({result.matchedKeywords.length})
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
                      Tidak ada kata kunci lowongan spesifik yang cocok.
                    </p>
                  )}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6">
                <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-black">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <h3 className="font-mono font-bold text-sm uppercase">
                      Kata Kunci Belum Ada ({result.missingKeywords.length})
                    </h3>
                  </div>
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
                      Semua kata kunci utama lowongan sudah tercakup di CV Anda!
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Checklist Audit Section */}
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6">
              <div className="pb-3 mb-4 border-b-2 border-black flex items-center justify-between">
                <h3 className="font-mono font-bold text-sm uppercase">
                  Daftar Periksa Kelayakan ATS (Format & Struktur)
                </h3>
                <span className="text-xs font-mono text-black/60">
                  {result.checks.filter((c) => c.status === "pass").length} / {result.checks.length} Lolos
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
                          {chk.status}
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
                  Rekomendasi Revisi untuk Meningkatkan Skor
                </h3>
              </div>

              <div className="space-y-4">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-4 bg-black text-white border-2 border-black space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-[#FFF000] text-black px-2 py-0.5 font-bold uppercase">
                        {rec.type}
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
                  Ingin format yang pasti 100% lulus dan bebas risiko kolom terpotong?
                </div>
                <Link
                  href="/builder"
                  className="brutal-btn bg-[#FFF000] text-black font-black px-6 py-2.5 text-xs font-mono uppercase inline-flex items-center gap-2"
                >
                  <span>BUAT ULANG DI RESUME BUILDER</span>
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
