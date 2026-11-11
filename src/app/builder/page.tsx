"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrutalistStar, Pill } from "@/components/BrutalistBadge";
import { AuthModal } from "@/components/AuthModal";
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
import { CoverLetterModal } from "@/components/builder/CoverLetterModal";
import {
  Trash2,
  Check,
  Cloud,
  FolderOpen,
  Plus,
  ChevronDown,
  Pencil,
  X,
  Download,
  Copy,
  Sparkles,
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
  const [userDrafts, setUserDrafts] = useState<Array<{ id: string; title: string; updatedAt: string }>>([]);
  const [showDraftMenu, setShowDraftMenu] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const isInitialMount = useRef(true);
  const lastSavedPayloadRef = useRef<string>("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [data, setData] = useState<ResumeData>(DEFAULT_SAMPLE_RESUME);
  const [activeTab, setActiveTab] = useState<
    "personal" | "experience" | "education" | "organizations" | "skills" | "review"
  >("personal");
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [isCompact, setIsCompact] = useState(false);
  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const pages = paginateResume(data, isCompact ? 135 : 115);
  const isEnglish = (data.language || "id") === "en";

  // Auto-scale A4 preview sheet to fit column width
  useEffect(() => {
    const handleResize = () => {
      if (!previewWrapperRef.current) return;
      const availableWidth = previewWrapperRef.current.clientWidth - 28;
      if (availableWidth > 0 && availableWidth < 794) {
        setPreviewScale(availableWidth / 794);
      } else {
        setPreviewScale(1);
      }
    };

    const timer = setTimeout(handleResize, 60);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [mobileView]);

  // Load from localStorage on mount if available
  useEffect(() => {
    const saved = localStorage.getItem("roster_resume_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.language) parsed.language = "id";
        setData(parsed);
        lastSavedPayloadRef.current = JSON.stringify(parsed);
      } catch (e) {
        console.error("Failed to parse saved resume", e);
      }
    }
    const storedId = localStorage.getItem("roster_resume_id");
    if (storedId) {
      setResumeCloudId(storedId);
    }
  }, []);

  // Fetch list of user's saved drafts from cloud
  const fetchUserDrafts = useCallback(async () => {
    if (!session?.user) return;
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const json = (await res.json()) as { data?: Array<{ id: string; title: string; updatedAt: string }> };
        if (Array.isArray(json.data)) {
          setUserDrafts(json.data);
          // If no active draft is set but user has drafts in cloud, activate the latest one
          const currentId = localStorage.getItem("roster_resume_id");
          if (!currentId && json.data.length > 0) {
            handleSwitchDraft(json.data[0].id);
          }
        }
      }
    } catch (err) {
      console.warn("Gagal mengambil daftar draf:", err);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      fetchUserDrafts();
    } else {
      setUserDrafts([]);
    }
  }, [session?.user, fetchUserDrafts]);

  // Switch active draft
  const handleSwitchDraft = async (draftId: string) => {
    try {
      const res = await fetch(`/api/resumes?id=${draftId}`);
      if (res.ok) {
        const json = (await res.json()) as { data?: { content?: ResumeData } };
        if (json.data?.content) {
          setData(json.data.content);
          setResumeCloudId(draftId);
          lastSavedPayloadRef.current = JSON.stringify(json.data.content);
          localStorage.setItem("roster_resume_draft", JSON.stringify(json.data.content));
          localStorage.setItem("roster_resume_id", draftId);
          setShowDraftMenu(false);
        }
      }
    } catch (err) {
      console.error("Gagal berpindah draf:", err);
    }
  };

  // Create new draft
  const handleCreateNewDraft = async () => {
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    const newDraftNumber = userDrafts.length + 1;
    const newTitle = `Draf CV #${newDraftNumber}`;
    const newResume: ResumeData = {
      ...DEFAULT_SAMPLE_RESUME,
      personal: {
        ...DEFAULT_SAMPLE_RESUME.personal,
        jobTitle: newTitle,
        fullName: session.user.name || DEFAULT_SAMPLE_RESUME.personal.fullName,
        email: session.user.email || DEFAULT_SAMPLE_RESUME.personal.email,
      },
    };

    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newResume,
        }),
      });

      if (res.ok) {
        const json = (await res.json()) as { data?: { id?: string } };
        if (json.data?.id) {
          setData(newResume);
          setResumeCloudId(json.data.id);
          lastSavedPayloadRef.current = JSON.stringify(newResume);
          localStorage.setItem("roster_resume_draft", JSON.stringify(newResume));
          localStorage.setItem("roster_resume_id", json.data.id);
          setShowDraftMenu(false);
          await fetchUserDrafts();
        }
      }
    } catch (err) {
      console.error("Gagal membuat draf baru:", err);
    }
  };

  // Delete draft
  const handleDeleteDraft = async (
    draftId: string,
    draftTitle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!confirm(`Hapus draf "${draftTitle}" secara permanen dari akun Anda?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/resumes?id=${draftId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const remaining = userDrafts.filter((d) => d.id !== draftId);
        setUserDrafts(remaining);

        if (resumeCloudId === draftId) {
          if (remaining.length > 0) {
            handleSwitchDraft(remaining[0].id);
          } else {
            setData(EMPTY_RESUME);
            setResumeCloudId(null);
            localStorage.removeItem("roster_resume_draft");
            localStorage.removeItem("roster_resume_id");
          }
        }
      }
    } catch (err) {
      console.error("Gagal menghapus draf:", err);
    }
  };

  // Clone draft
  const handleCloneDraft = async (
    draftId: string,
    draftTitle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await fetch(`/api/resumes?id=${draftId}`);
      if (!res.ok) throw new Error("Gagal mengambil data draf");
      const json = (await res.json()) as any;
      const contentToClone: ResumeData = json.data?.content || data;
      const newClonedTitle = `${draftTitle || "Draf CV"} (Salinan)`;

      const saveRes = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newClonedTitle,
          content: contentToClone,
        }),
      });

      if (saveRes.ok) {
        const savedJson = (await saveRes.json()) as any;
        if (savedJson.data?.id) {
          setData(contentToClone);
          setResumeCloudId(savedJson.data.id);
          lastSavedPayloadRef.current = JSON.stringify(contentToClone);
          localStorage.setItem("roster_resume_draft", JSON.stringify(contentToClone));
          localStorage.setItem("roster_resume_id", savedJson.data.id);
          setShowDraftMenu(false);
          await fetchUserDrafts();
        }
      }
    } catch (err) {
      console.error("Gagal menduplikasi draf:", err);
    }
  };

  // Rename draft
  const handleStartRename = (
    draftId: string,
    currentTitle: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditingDraftId(draftId);
    setEditingTitle(currentTitle);
  };

  const handleSaveRename = async (draftId: string) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setEditingDraftId(null);
      return;
    }

    try {
      const res = await fetch("/api/resumes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draftId, title: trimmed }),
      });

      if (res.ok) {
        setUserDrafts((prev) =>
          prev.map((d) => (d.id === draftId ? { ...d, title: trimmed } : d))
        );
        if (resumeCloudId === draftId) {
          setData((prev) => ({
            ...prev,
            personal: {
              ...prev.personal,
              jobTitle: trimmed,
            },
          }));
        }
      }
    } catch (err) {
      console.error("Gagal mengganti nama draf:", err);
    } finally {
      setEditingDraftId(null);
    }
  };

  // Save to localStorage on change
  const updateData = (newData: ResumeData) => {
    setData(newData);
    localStorage.setItem("roster_resume_draft", JSON.stringify(newData));
  };

  // Auto-save to cloud with debounce and dirty check
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!session?.user) {
      setCloudSyncStatus("idle");
      return;
    }

    const currentPayload = JSON.stringify(data);
    if (lastSavedPayloadRef.current === currentPayload) {
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
        lastSavedPayloadRef.current = currentPayload;
        const json = (await res.json()) as { data?: { id?: string } };
        if (json.data?.id) {
          const savedId = json.data.id;
          setResumeCloudId(savedId);
          localStorage.setItem("roster_resume_id", savedId);
          const currentTitle = data.personal.jobTitle || data.personal.fullName || "Draf CV";
          setUserDrafts((prev) => {
            const exists = prev.some((d) => d.id === savedId);
            if (exists) {
              return prev.map((d) =>
                d.id === savedId
                  ? { ...d, title: currentTitle, updatedAt: new Date().toISOString() }
                  : d
              );
            }
            return [
              { id: savedId, title: currentTitle, updatedAt: new Date().toISOString() },
              ...prev,
            ];
          });
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
      const { generateResumePdfBlob } = await import("@/lib/pdf-generator");
      const blob = await generateResumePdfBlob(data, isCompact);
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
    <div className="min-h-screen bg-blueprint text-black flex flex-col font-sans selection:bg-[#1D4ED8] selection:text-white">
      <Header />

      {/* Top Status & Fast Action Bar */}
      <div className="bg-black text-white border-b-2 border-black px-3 py-2 sm:px-6 lg:px-8 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-white hover:text-blue-200 hover:underline font-bold flex items-center gap-1"
            >
              <span>← Beranda</span>
            </Link>
            <span className="text-white/40">|</span>
            <span className="text-white/80 font-bold hidden sm:inline">
              CV BUILDER ATS
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Multi-Draft Selector for Authenticated User */}
            {session?.user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDraftMenu((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 bg-white text-black font-bold border-2 border-black hover:bg-zinc-100 text-xs font-mono transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
                  title="Buka daftar draf CV Anda"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-[#1D4ED8]" />
                  <span className="max-w-[90px] xs:max-w-[130px] sm:max-w-[160px] truncate">
                    {userDrafts.find((d) => d.id === resumeCloudId)?.title ||
                      data.personal.jobTitle ||
                      "Draf CV"}
                  </span>
                  <span className="text-[10px] px-1 bg-[#1D4ED8] text-white font-mono">
                    {userDrafts.length}
                  </span>
                  <ChevronDown className="w-3 h-3 text-black/70" />
                </button>

                {/* Dropdown Menu */}
                {showDraftMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDraftMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 w-[calc(100vw-24px)] sm:w-72 max-w-sm bg-white text-black border-3 border-black shadow-[4px_4px_0px_#000] z-50 p-2 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-black text-[11px] font-mono font-bold uppercase">
                        <span>DRAF CV SAYA</span>
                        <button
                          type="button"
                          onClick={handleCreateNewDraft}
                          className="text-[10px] bg-[#1D4ED8] hover:bg-[#2563EB] text-white px-2 py-0.5 border border-black font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>DRAF BARU</span>
                        </button>
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {userDrafts.length === 0 ? (
                          <div className="p-3 text-center text-xs font-mono text-black/60">
                            Belum ada draf tersimpan
                          </div>
                        ) : (
                          userDrafts.map((d) => {
                            const isActive = d.id === resumeCloudId;
                            if (editingDraftId === d.id) {
                              return (
                                <div
                                  key={d.id}
                                  className="p-1.5 border border-black bg-white flex items-center gap-1 text-xs"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSaveRename(d.id);
                                      if (e.key === "Escape") setEditingDraftId(null);
                                    }}
                                    autoFocus
                                    className="flex-1 p-1 text-xs border border-black font-sans bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveRename(d.id)}
                                    className="p-1 bg-[#1D4ED8] text-white hover:bg-[#2563EB] border border-black cursor-pointer"
                                    title="Simpan nama baru"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingDraftId(null)}
                                    className="p-1 bg-white hover:bg-zinc-100 text-black border border-black cursor-pointer"
                                    title="Batal"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={d.id}
                                onClick={() => handleSwitchDraft(d.id)}
                                className={`p-2 border cursor-pointer transition-colors flex items-center justify-between gap-2 text-xs font-mono ${
                                  isActive
                                    ? "bg-blue-50 border-[#1D4ED8] font-bold"
                                    : "bg-white border-black/20 hover:border-black hover:bg-zinc-50"
                                }`}
                              >
                                <div className="flex flex-col min-w-0 flex-1">
                                  <span className="truncate">{d.title || "Draf Tanpa Judul"}</span>
                                  <span className="text-[10px] text-black/50">
                                    {new Date(d.updatedAt).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {isActive && (
                                    <span className="text-[9px] bg-[#1D4ED8] text-white px-1.5 py-0.5 font-bold">
                                      AKTIF
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartRename(d.id, d.title, e)}
                                    className="text-black/60 hover:text-[#1D4ED8] p-1 hover:bg-black/5 rounded cursor-pointer"
                                    title="Ubah nama draf"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCloneDraft(d.id, d.title, e)}
                                    className="text-black/60 hover:text-[#1D4ED8] p-1 hover:bg-black/5 rounded cursor-pointer"
                                    title="Duplikat draf ini"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  {!isActive && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleDeleteDraft(d.id, d.title, e)}
                                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded cursor-pointer"
                                      title="Hapus draf ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Debounced Cloud Auto-Save Status */}
            {session?.user ? (
              <div
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/10 border border-white/20 text-[11px] sm:text-xs font-mono select-none"
                title="Perubahan disimpan otomatis ke cloud saat Anda mengetik"
              >
                {cloudSyncStatus === "saving" ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1D4ED8] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                    </span>
                    <span className="text-blue-300 font-bold hidden sm:inline">Menyimpan...</span>
                    <span className="text-blue-300 font-bold sm:hidden">Simpan</span>
                  </>
                ) : cloudSyncStatus === "error" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-red-300">Gagal</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-zinc-300 hidden sm:inline">Tersimpan di Cloud</span>
                    <span className="text-zinc-300 sm:hidden">Cloud</span>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-[11px] sm:text-xs font-mono transition-colors cursor-pointer"
                title="Masuk untuk menyimpan CV otomatis ke cloud"
              >
                <Cloud className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline">Tersimpan Lokal</span>
                <span className="hidden sm:inline text-white/40">•</span>
                <span className="text-blue-400 underline font-bold">MASUK</span>
              </button>
            )}

            {/* Button Kosongkan CV */}
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-black hover:bg-red-950/50 text-red-400 hover:text-red-200 font-mono text-[11px] sm:text-xs font-bold border border-red-500/60 hover:border-red-400 transition-colors flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-[2px_2px_0px_rgba(239,68,68,0.4)] active:translate-x-[1px] active:translate-y-[1px]"
              title="Kosongkan seluruh data form CV"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kosongkan CV</span>
              <span className="sm:hidden">Reset</span>
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
            mobileView === "editor" ? "bg-[#1D4ED8] text-white" : "bg-white text-black"
          }`}
        >
          Formulir Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-2.5 text-xs font-mono font-bold text-center uppercase cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileView === "preview" ? "bg-[#1D4ED8] text-white" : "bg-white text-black"
          }`}
        >
          <span>Pratinjau CV ATS</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 border border-black font-mono font-bold leading-none ${
              pages.length > 1
                ? "bg-red-400 text-black"
                : "bg-white text-black"
            }`}
          >
            {pages.length} Hlm
          </span>
        </button>
      </div>

      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8 print:p-0 print:m-0 print:max-w-none print:w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start print:block print:w-full">
          {/* Left Side: Form Editor (5 cols on lg+) */}
          <div
            className={`lg:col-span-5 space-y-4 no-print ${
              mobileView === "editor" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Top Toolbar: Language & Font Switcher */}
            <div className="p-3 bg-white border-3 border-black shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold uppercase text-black">
                  BAHASA DOKUMEN:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateData({ ...data, language: "id" })}
                    className={`px-3 py-1 font-mono text-xs font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                      (data.language || "id") === "id"
                        ? "bg-[#1D4ED8] text-white shadow-[2px_2px_0px_#000]"
                        : "bg-white text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    🇮🇩 ID
                  </button>
                  <button
                    type="button"
                    onClick={() => updateData({ ...data, language: "en" })}
                    className={`px-3 py-1 font-mono text-xs font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                      data.language === "en"
                        ? "bg-[#1D4ED8] text-white shadow-[2px_2px_0px_#000]"
                        : "bg-white text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/15">
                <span className="text-xs font-mono font-bold uppercase text-black">
                  FONT STANDAR ATS:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateData({ ...data, fontFamily: "sans" })}
                    className={`px-2.5 py-1 font-sans text-xs font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                      (data.fontFamily || "sans") === "sans"
                        ? "bg-black text-white shadow-[2px_2px_0px_#000]"
                        : "bg-white text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    Sans (Modern)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateData({ ...data, fontFamily: "serif" })}
                    className={`px-2.5 py-1 font-serif text-xs font-bold border-2 border-black uppercase transition-all cursor-pointer ${
                      data.fontFamily === "serif"
                        ? "bg-black text-white shadow-[2px_2px_0px_#000]"
                        : "bg-white text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    Serif (Formal)
                  </button>
                </div>
              </div>
            </div>

            {/* ATS Form Stepper */}
            <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-1 border-b-3 border-black pb-2 bg-black p-2">
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
                  className={`text-xs font-mono font-bold px-2.5 py-1.5 border border-black uppercase transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    activeTab === tab.id
                      ? "bg-[#1D4ED8] text-white shadow-[2px_2px_0px_#fff]"
                      : "bg-black text-white hover:bg-white/20"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-center text-[10px] leading-4 font-mono font-black ${
                      activeTab === tab.id
                        ? "bg-white text-[#1D4ED8]"
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
            <div className="bg-white border-3 border-black shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] p-4 sm:p-6 space-y-4">
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
                  onViewMobilePreview={() => setMobileView("preview")}
                  onOpenCoverLetter={() => setShowCoverLetterModal(true)}
                  isGeneratingPdf={isGeneratingPdf}
                />
              )}
            </div>
          </div>

          {/* Right Side: Live ATS Preview (7 cols on lg+) */}
          <div
            ref={previewWrapperRef}
            className={`cv-preview-wrapper lg:col-span-7 flex flex-col items-center lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto no-scrollbar print:!block print:!w-full print:!overflow-visible print:!static ${
              mobileView === "preview" ? "block w-full" : "hidden lg:flex"
            }`}
          >
            <AtsPreview
              data={data}
              pages={pages}
              previewScale={previewScale}
              isCompact={isCompact}
              onToggleCompact={() => setIsCompact(!isCompact)}
              manualZoom={manualZoom}
              onManualZoomChange={setManualZoom}
            />
          </div>
        </div>
      </main>

      {/* Mobile Floating Action / Sticky Bar */}
      {mobileView === "preview" ? (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md text-white border-t-2 border-black p-2.5 px-3 flex items-center justify-between gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.4)] no-print">
          <button
            type="button"
            onClick={() => setMobileView("editor")}
            className="py-2 px-3 bg-white hover:bg-zinc-100 text-black font-mono font-bold text-xs border border-black uppercase text-center cursor-pointer shadow-[2px_2px_0px_#000] shrink-0"
          >
            ← Formulir
          </button>

          <span
            className={`text-[10px] px-2 py-1 font-mono font-bold border border-black truncate ${
              pages.length > 1 ? "bg-red-500 text-white" : "bg-green-600 text-white"
            }`}
          >
            {pages.length > 1 ? `⚠️ ${pages.length} Hlm` : "✓ 1 Hlm"}
          </span>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex-1 py-2 px-3 bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-mono font-bold text-xs border border-black uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000] disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <span>Memproses...</span>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Mobile Floating Page Budget Indicator with Overflow Alert */
        <div className="lg:hidden fixed bottom-4 right-4 z-40 no-print animate-in fade-in slide-in-from-bottom-2">
          <button
            type="button"
            onClick={() => setMobileView("preview")}
            className={`flex items-center gap-2 px-3.5 py-2 border-2 border-black shadow-[4px_4px_0px_#000] font-mono text-xs font-bold transition-transform active:translate-x-0.5 active:translate-y-0.5 cursor-pointer ${
              pages.length > 1
                ? "bg-red-400 text-black hover:bg-red-300"
                : "bg-[#1D4ED8] text-white hover:bg-[#2563EB]"
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
            <span className="text-[10px] underline ml-0.5">Lihat</span>
          </button>
        </div>
      )}

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

      <CoverLetterModal
        isOpen={showCoverLetterModal}
        onClose={() => setShowCoverLetterModal(false)}
        data={data}
      />

      <Footer />
    </div>
  );
}
