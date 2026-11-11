"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrutalistStar, Pill } from "@/components/BrutalistBadge";
import { AuthModal } from "@/components/AuthModal";
import { generateResumePdfBlob } from "@/lib/pdf-generator";
import { paginateResume } from "@/lib/resume-paginator";
import { ResumeData } from "@/types/resume";
import {
  RESUME_PRESETS,
  SAMPLE_ADMIN_HR,
  SAMPLE_MARKETING,
  SAMPLE_FINANCE,
  SAMPLE_TECH,
  DEFAULT_SAMPLE_RESUME,
  EMPTY_RESUME,
} from "@/data/resume-presets";
import { StepPersonal } from "@/components/builder/StepPersonal";
import { StepExperience } from "@/components/builder/StepExperience";
import { StepEducation } from "@/components/builder/StepEducation";
import { StepOrganizations } from "@/components/builder/StepOrganizations";
import { StepSkills } from "@/components/builder/StepSkills";
import { StepReview } from "@/components/builder/StepReview";
import { AtsPreview } from "@/components/builder/AtsPreview";
import {
  Trash2,
  Check,
  LogOut,
  UserCheck,
  Cloud,
} from "lucide-react";

// Backwards compatibility re-exports
export type { ResumeData, ExperienceItem, EducationItem, ProjectItem } from "@/types/resume";
export {
  RESUME_PRESETS,
  SAMPLE_ADMIN_HR,
  SAMPLE_MARKETING,
  SAMPLE_FINANCE,
  SAMPLE_TECH,
  DEFAULT_SAMPLE_RESUME,
  EMPTY_RESUME,
};

export default function BuilderPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [resumeCloudId, setResumeCloudId] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [data, setData] = useState<ResumeData>(DEFAULT_SAMPLE_RESUME);
  const [activeTab, setActiveTab] = useState<
    "personal" | "experience" | "education" | "organizations" | "skills" | "review"
  >("personal");
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const pages = paginateResume(data);
  const isEnglish = (data.language || "id") === "en";

  // Auto-scale A4 preview sheet to fit column width
  useEffect(() => {
    const handleResize = () => {
      if (!previewWrapperRef.current) return;
      const availableWidth = previewWrapperRef.current.clientWidth - 16;
      if (availableWidth > 0 && availableWidth < 794) {
        setPreviewScale(availableWidth / 794);
      } else {
        setPreviewScale(1);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileView]);

  // Load from localStorage on mount if available
  useEffect(() => {
    const saved = localStorage.getItem("roster_resume_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.language) parsed.language = "id";
        setData(parsed);
      } catch (e) {
        console.error("Failed to parse saved resume", e);
      }
    }
    const storedId = localStorage.getItem("roster_resume_id");
    if (storedId) {
      setResumeCloudId(storedId);
    }
  }, []);

  // Save to localStorage on change
  const updateData = (newData: ResumeData) => {
    setData(newData);
    localStorage.setItem("roster_resume_draft", JSON.stringify(newData));
  };

  // Auto-save to cloud with debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!session?.user) {
      setCloudSyncStatus("idle");
      return;
    }

    setCloudSyncStatus("saving");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.personal.jobTitle || data.personal.fullName || "Draft CV",
            content: data,
            id: resumeCloudId || undefined,
          }),
        });

        if (!res.ok) throw new Error("Gagal menyimpan ke cloud");
        const json = (await res.json()) as { data?: { id?: string } };
        if (json.data?.id) {
          setResumeCloudId(json.data.id);
          localStorage.setItem("roster_resume_id", json.data.id);
        }
        setCloudSyncStatus("saved");
      } catch (err) {
        console.error("Auto-save cloud error:", err);
        setCloudSyncStatus("error");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [data, session?.user, resumeCloudId]);

  const handleDownloadPdf = async () => {
    if (!session?.user) {
      setPendingDownload(true);
      setShowAuthModal(true);
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const blob = await generateResumePdfBlob(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const sanitizedName = data.personal.fullName
        ? data.personal.fullName.toLowerCase().replace(/[^a-z0-9]/g, "-")
        : "ats";
      a.download = `resume-${sanitizedName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal membuat PDF otomatis:", err);
      alert("Terjadi kesalahan saat membuat file PDF. Silakan coba lagi.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Post-login auto-download trigger
  useEffect(() => {
    if (session?.user && pendingDownload) {
      setPendingDownload(false);
      handleDownloadPdf();
    }
  }, [session?.user, pendingDownload]);

  const handleBridgeToAnalyzer = () => {
    const lines: string[] = [];
    lines.push(data.personal.fullName);
    lines.push(data.personal.jobTitle);
    lines.push(
      [
        data.personal.email,
        data.personal.phone,
        data.personal.location,
        data.personal.linkedin,
        data.personal.github,
      ]
        .filter(Boolean)
        .join(" | ")
    );

    if (data.summary) {
      lines.push("\nPROFESSIONAL SUMMARY\n" + data.summary);
    }

    if (data.experience.length > 0) {
      lines.push("\nWORK EXPERIENCE");
      for (const exp of data.experience) {
        lines.push(`${exp.role} - ${exp.company} (${exp.startDate} - ${exp.endDate})`);
        for (const b of exp.bullets) {
          if (b) lines.push(`- ${b}`);
        }
      }
    }

    if (data.skills.technical || data.skills.tools || data.skills.soft) {
      lines.push("\nSKILLS & COMPETENCIES");
      if (data.skills.technical) lines.push(`Hard Skills: ${data.skills.technical}`);
      if (data.skills.tools) lines.push(`Tools & Software: ${data.skills.tools}`);
      if (data.skills.soft) lines.push(`Soft Skills: ${data.skills.soft}`);
    }

    if (data.education.length > 0) {
      lines.push("\nEDUCATION");
      for (const edu of data.education) {
        lines.push(`${edu.degree} - ${edu.institution} (${edu.year}) ${edu.details}`);
      }
    }

    if (data.projects.length > 0) {
      const projTitle = data.customProjectTitle?.toUpperCase() || "KEY PROJECTS & ORGANISATIONS";
      lines.push(`\n${projTitle}`);
      for (const p of data.projects) {
        lines.push(`${p.name} (${p.techStack}) - ${p.description}`);
      }
    }

    sessionStorage.setItem("draftcv_bridge_text", lines.join("\n"));
    sessionStorage.setItem("draftcv_bridge_title", data.personal.jobTitle || "Resume Anda");
    router.push("/analyzer");
  };

  const handleLoadPreset = (presetId: string) => {
    const found = RESUME_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    if (
      confirm(
        `Muat template contoh untuk bidang "${found.label}"? Perubahan yang belum disimpan akan digantikan.`
      )
    ) {
      updateData(found.data);
    }
  };

  const handleClear = () => {
    if (confirm("Kosongkan semua isi CV? Data yang telah diisi akan dihapus.")) {
      updateData(EMPTY_RESUME);
      localStorage.removeItem("roster_resume_draft");
      localStorage.removeItem("roster_resume_id");
      setResumeCloudId(null);
      setCloudSyncStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-blueprint text-black flex flex-col font-mono selection:bg-[#FFF000] selection:text-black">
      <Header />

      {/* Top Status & Fast Action Bar */}
      <div className="bg-black text-white border-b-2 border-black px-4 py-2.5 sm:px-6 lg:px-8 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-[#FFF000] hover:underline font-bold flex items-center gap-1"
            >
              <span>← Beranda</span>
            </Link>
            <span className="text-white/40">|</span>
            <span className="text-white/80 font-bold hidden sm:inline">
              CV BUILDER ATS
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Debounced Cloud Auto-Save Status */}
            {session?.user ? (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 border border-white/20 text-xs font-mono select-none"
                title="Perubahan disimpan otomatis ke cloud saat Anda mengetik"
              >
                {cloudSyncStatus === "saving" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#FFF000] animate-ping" />
                    <span className="text-[#FFF000]">Menyimpan...</span>
                  </>
                ) : cloudSyncStatus === "error" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-red-300">Gagal Sinkron</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-zinc-300">Tersimpan di Cloud</span>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-xs font-mono transition-colors cursor-pointer"
                title="Masuk untuk menyimpan CV otomatis ke cloud"
              >
                <Cloud className="w-3.5 h-3.5 text-zinc-400" />
                <span>Tersimpan Lokal</span>
                <span className="text-white/40">•</span>
                <span className="text-[#FFF000] underline font-bold">MASUK</span>
              </button>
            )}

            {/* User Account Info when logged in */}
            {session?.user && (
              <div className="hidden sm:flex items-center gap-2 bg-white/10 px-2.5 py-1.5 border border-white/30 text-xs font-mono text-white">
                <UserCheck className="w-3.5 h-3.5 text-[#FFF000]" />
                <span className="font-bold truncate max-w-[120px]">
                  {session.user.name || session.user.email}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-white/60 hover:text-red-400 ml-1 cursor-pointer"
                  title="Keluar"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Button Kosongkan CV */}
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-1.5 bg-black hover:bg-red-950/50 text-red-400 hover:text-red-200 font-mono text-xs font-bold border border-red-500/60 hover:border-red-400 transition-colors flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_rgba(239,68,68,0.4)] active:translate-x-[1px] active:translate-y-[1px]"
              title="Kosongkan seluruh data form CV"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan CV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View Toggle */}
      <div className="lg:hidden flex border-b-2 border-black bg-white no-print">
        <button
          type="button"
          onClick={() => setMobileView("editor")}
          className={`flex-1 py-2.5 text-xs font-mono font-bold text-center border-r-2 border-black uppercase cursor-pointer ${
            mobileView === "editor" ? "bg-[#FFF000]" : "bg-white"
          }`}
        >
          Formulir Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-2.5 text-xs font-mono font-bold text-center uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileView === "preview" ? "bg-[#FFF000]" : "bg-white"
          }`}
        >
          <span>Pratinjau CV ATS</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 border border-black ${
              pages.length > 1 ? "bg-red-300 text-black font-black" : "bg-zinc-100"
            }`}
          >
            {pages.length} Hlm
          </span>
        </button>
      </div>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 print:p-0 print:m-0 print:max-w-none print:w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block print:w-full">
          {/* Left Side: Form Editor (5 cols on lg+) */}
          <div
            className={`lg:col-span-5 space-y-4 no-print ${
              mobileView === "editor" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Top Toolbar: Language Switcher */}
            <div className="p-3 bg-white border-3 border-black shadow-[4px_4px_0px_#000] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-black">
                  BAHASA DOKUMEN CV:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateData({ ...data, language: "id" })}
                    className={`px-3 py-1 font-mono text-xs font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                      (data.language || "id") === "id"
                        ? "bg-[#FFF000] text-black shadow-[2px_2px_0px_#000]"
                        : "bg-white text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    🇮🇩 Bahasa Indonesia
                  </button>
                  <button
                    type="button"
                    onClick={() => updateData({ ...data, language: "en" })}
                    className={`px-3 py-1 font-mono text-xs font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                      data.language === "en"
                        ? "bg-[#FFF000] text-black shadow-[2px_2px_0px_#000]"
                        : "bg-white text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>
            </div>

            {/* ATS Form Stepper */}
            <div className="flex flex-wrap gap-1 border-b-3 border-black pb-2 bg-black p-2">
              {(isEnglish
                ? [
                    { id: "personal", step: "1", label: "Personal Info" },
                    { id: "experience", step: "2", label: "Experience" },
                    { id: "education", step: "3", label: "Education" },
                    { id: "organizations", step: "4", label: "Organisations" },
                    { id: "skills", step: "5", label: "Skills" },
                    { id: "review", step: "6", label: "Review" },
                  ]
                : [
                    { id: "personal", step: "1", label: "Informasi Pribadi" },
                    { id: "experience", step: "2", label: "Profesional" },
                    { id: "education", step: "3", label: "Pendidikan" },
                    { id: "organizations", step: "4", label: "Organisasi" },
                    { id: "skills", step: "5", label: "Lainnya" },
                    { id: "review", step: "6", label: "Tinjau" },
                  ]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs font-mono font-bold px-2.5 py-1.5 border border-black uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#FFF000] text-black shadow-[2px_2px_0px_#fff]"
                      : "bg-black text-white hover:bg-white/20"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-center text-[10px] leading-4 font-mono font-black ${
                      activeTab === tab.id
                        ? "bg-black text-[#FFF000]"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {tab.step}
                  </span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modular Step Form Panels */}
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6 space-y-4">
              {activeTab === "personal" && (
                <StepPersonal
                  data={data}
                  updateData={updateData}
                  onNext={() => setActiveTab("experience")}
                  onLoadPreset={handleLoadPreset}
                />
              )}

              {activeTab === "experience" && (
                <StepExperience
                  data={data}
                  updateData={updateData}
                  onNext={() => setActiveTab("education")}
                  onBack={() => setActiveTab("personal")}
                />
              )}

              {activeTab === "education" && (
                <StepEducation
                  data={data}
                  updateData={updateData}
                  onNext={() => setActiveTab("organizations")}
                  onBack={() => setActiveTab("experience")}
                />
              )}

              {activeTab === "organizations" && (
                <StepOrganizations
                  data={data}
                  updateData={updateData}
                  onNext={() => setActiveTab("skills")}
                  onBack={() => setActiveTab("education")}
                />
              )}

              {activeTab === "skills" && (
                <StepSkills
                  data={data}
                  updateData={updateData}
                  onNext={() => setActiveTab("review")}
                  onBack={() => setActiveTab("organizations")}
                />
              )}

              {activeTab === "review" && (
                <StepReview
                  data={data}
                  updateData={updateData}
                  onBack={() => setActiveTab("skills")}
                  onDownload={handleDownloadPdf}
                  onBridgeToAnalyzer={handleBridgeToAnalyzer}
                  onPrint={() => window.print()}
                  onViewMobilePreview={() => setMobileView("preview")}
                  isGeneratingPdf={isGeneratingPdf}
                />
              )}
            </div>
          </div>

          {/* Right Side: Live ATS Preview (7 cols on lg+) */}
          <div
            ref={previewWrapperRef}
            className={`cv-preview-wrapper lg:col-span-7 flex flex-col items-center print:!block print:!w-full ${
              mobileView === "preview" ? "block w-full" : "hidden lg:flex"
            }`}
          >
            <AtsPreview data={data} pages={pages} previewScale={previewScale} />
          </div>
        </div>
      </main>

      {/* Mobile Floating Page Budget Indicator with Overflow Alert */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40 no-print animate-in fade-in slide-in-from-bottom-2">
        <button
          type="button"
          onClick={() => setMobileView(mobileView === "editor" ? "preview" : "editor")}
          className={`flex items-center gap-2 px-3.5 py-2 border-2 border-black shadow-[4px_4px_0px_#000] font-mono text-xs font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
            pages.length > 1
              ? "bg-red-400 text-black hover:bg-red-300"
              : "bg-[#FFF000] text-black hover:bg-yellow-300"
          }`}
          title={
            pages.length > 1
              ? "Perhatian: Format CV melebihi 1 halaman A4!"
              : "Panjang CV ideal: Tepat 1 Halaman A4"
          }
        >
          {pages.length > 1 ? (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span>⚠️ {pages.length} Halaman (Overflow!)</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-green-600" />
              <span>✓ 1 Halaman (Ideal)</span>
            </>
          )}
          <span className="text-[10px] underline ml-0.5">
            {mobileView === "editor" ? "Lihat" : "Edit"}
          </span>
        </button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingDownload(false);
        }}
        onSuccess={() => {
          if (pendingDownload) {
            setPendingDownload(false);
            handleDownloadPdf();
          }
        }}
      />

      <Footer />
    </div>
  );
}
