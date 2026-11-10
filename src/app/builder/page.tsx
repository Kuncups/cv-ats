"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrutalistStar, Pill } from "@/components/BrutalistBadge";
import {
  Printer,
  Sparkles,
  Download,
  Upload,
  Plus,
  Trash2,
  FileText,
  RotateCcw,
  Check,
} from "lucide-react";

export interface ResumeData {
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    year: string;
    details: string;
  }>;
  skills: {
    technical: string;
    tools: string;
    soft: string;
  };
  projects: Array<{
    id: string;
    name: string;
    techStack: string;
    link: string;
    description: string;
  }>;
}

const DEFAULT_SAMPLE_RESUME: ResumeData = {
  personal: {
    fullName: "MUHAMMAD YUSUF",
    jobTitle: "Senior Fullstack Engineer",
    email: "yusuf@example.com",
    phone: "+62 812-3456-7890",
    location: "Jakarta, Indonesia",
    linkedin: "linkedin.com/in/myusuf",
    github: "github.com/myusuf",
    website: "yusuf.dev",
  },
  summary:
    "Senior Fullstack Engineer dengan 5+ tahun pengalaman merancang dan menskalakan aplikasi web terdistribusi berbasis Next.js, TypeScript, Cloudflare Workers, dan PostgreSQL. Terbukti meningkatkan Core Web Vitals sebesar 45% dan memangkas waktu load p99 dari 800ms menjadi 120ms pada sistem pemrosesan 500k+ transaksi per bulan.",
  experience: [
    {
      id: "exp-1",
      role: "Lead Fullstack Developer",
      company: "Fintech Nusantara",
      location: "Jakarta, Indonesia",
      startDate: "2023",
      endDate: "Sekarang",
      isCurrent: true,
      bullets: [
        "Memimpin arsitektur migrasi sistem monolith ke modular Edge runtime Cloudflare Workers, memangkas latensi respon API sebesar 65%.",
        "Mengembangkan payment webhook relay berdaya tahan tinggi yang berhasil memproses lebih dari 1.2M transaksi bulanan dengan zero data loss.",
        "Mengotomasi end-to-end testing menggunakan Playwright dan CI/CD GitHub Actions, menurunkan defect escape rate sebesar 40%.",
      ],
    },
    {
      id: "exp-2",
      role: "Software Engineer",
      company: "Digital Solusi Asia",
      location: "Bandung, Indonesia",
      startDate: "2021",
      endDate: "2023",
      isCurrent: false,
      bullets: [
        "Mengembangkan 12+ fitur dashboard multi-tenant dengan Next.js App Router, Tailwind CSS, dan Drizzle ORM.",
        "Mengoptimasi query database PostgreSQL dan Redis caching yang mengurangi penggunaan resource server sebesar 30%.",
        "Mementor 4 junior software engineer dalam praktik TypeScript type safety dan unit testing.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "Sarjana Komputer (S.Kom) - Teknik Informatika",
      institution: "Universitas Terkemuka",
      location: "Indonesia",
      year: "2017 - 2021",
      details: "IPK 3.82 / 4.00 • Fokus Studi: Rekayasa Perangkat Lunak & Sistem Terdistribusi",
    },
  ],
  skills: {
    technical: "TypeScript, JavaScript, React, Next.js, Node.js, Go, PostgreSQL, SQLite, REST APIs, GraphQL",
    tools: "Git, Cloudflare Workers, Docker, Redis, Tailwind CSS, Playwright, Linux, GitHub Actions",
    soft: "Kepemimpinan Teknis, Arsitektur Sistem, Code Review, Mentoring, Problem Solving",
  },
  projects: [
    {
      id: "proj-1",
      name: "Draft CV ATS Scanner",
      techStack: "Next.js, TypeScript, Cloudflare Workers, unpdf",
      link: "https://github.com/myusuf/cv-ats",
      description: "Platform audit skor ATS dan builder CV standar industri dengan pemrosesan dokumen in-memory tanpa pihak ketiga.",
    },
  ],
};

const EMPTY_RESUME: ResumeData = {
  personal: {
    fullName: "",
    jobTitle: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: { technical: "", tools: "", soft: "" },
  projects: [],
};

export default function BuilderPage() {
  const [data, setData] = useState<ResumeData>(DEFAULT_SAMPLE_RESUME);
  const [activeTab, setActiveTab] = useState<
    "personal" | "summary" | "experience" | "education" | "skills" | "projects"
  >("personal");
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Load from localStorage on mount if available
  useEffect(() => {
    const saved = localStorage.getItem("roster_resume_draft");
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved resume", e);
      }
    }
  }, []);

  // Save to localStorage on change
  const updateData = (newData: ResumeData) => {
    setData(newData);
    localStorage.setItem("roster_resume_draft", JSON.stringify(newData));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLoadSample = () => {
    updateData(DEFAULT_SAMPLE_RESUME);
  };

  const handleClear = () => {
    if (confirm("Kosongkan semua form resume?")) {
      updateData(EMPTY_RESUME);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${data.personal.fullName.toLowerCase().replace(/\s+/g, "-") || "draft"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        updateData(parsed);
      } catch (err) {
        alert("File JSON tidak valid.");
      }
    };
    reader.readAsText(file);
  };

  // Experience handlers
  const addExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      role: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      bullets: [""],
    };
    updateData({ ...data, experience: [newExp, ...data.experience] });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ ...data, experience: updated });
  };

  const removeExperience = (index: number) => {
    const updated = data.experience.filter((_, i) => i !== index);
    updateData({ ...data, experience: updated });
  };

  const addExpBullet = (expIndex: number) => {
    const updated = [...data.experience];
    updated[expIndex].bullets.push("");
    updateData({ ...data, experience: updated });
  };

  const updateExpBullet = (expIndex: number, bulletIndex: number, val: string) => {
    const updated = [...data.experience];
    updated[expIndex].bullets[bulletIndex] = val;
    updateData({ ...data, experience: updated });
  };

  const removeExpBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...data.experience];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    updateData({ ...data, experience: updated });
  };

  // Education handlers
  const addEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      year: "",
      details: "",
    };
    updateData({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ ...data, education: updated });
  };

  const removeEducation = (index: number) => {
    const updated = data.education.filter((_, i) => i !== index);
    updateData({ ...data, education: updated });
  };

  // Project handlers
  const addProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      name: "",
      techStack: "",
      link: "",
      description: "",
    };
    updateData({ ...data, projects: [...data.projects, newProj] });
  };

  const updateProject = (index: number, field: string, value: string) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ ...data, projects: updated });
  };

  const removeProject = (index: number) => {
    const updated = data.projects.filter((_, i) => i !== index);
    updateData({ ...data, projects: updated });
  };

  return (
    <div className="min-h-screen bg-[#FFF000] text-black flex flex-col font-sans">
      <Header />

      {/* Control Action Bar */}
      <div className="bg-black text-[#FFF000] border-b-3 border-black py-3 px-4 sm:px-6 sticky top-[68px] z-40 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              [ BUILDER MODE ]
            </span>
            <Pill variant="yellow" className="text-[10px]">
              ATS 1-KOLOM STANDAR
            </Pill>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-1.5 bg-white text-black font-mono text-xs font-bold border border-white hover:bg-[#FFF000] transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>LOAD CONTOH</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-1.5 bg-black text-[#FFF000] font-mono text-xs font-bold border border-[#FFF000] hover:bg-[#FFF000] hover:text-black transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>SIMPAN JSON</span>
            </button>

            <label className="px-3 py-1.5 bg-black text-white font-mono text-xs font-bold border border-white/50 hover:bg-white hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>LOAD JSON</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJson}
              />
            </label>

            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1.5 text-white/60 hover:text-red-400 font-mono text-xs transition-colors"
              title="Kosongkan form"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Print Primary Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="brutal-btn bg-[#FFF000] text-black font-mono text-xs font-black px-5 py-2 uppercase flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>CETAK / EXPORT PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile View Toggle */}
      <div className="lg:hidden flex border-b-2 border-black bg-white no-print">
        <button
          type="button"
          onClick={() => setMobileView("editor")}
          className={`flex-1 py-2.5 text-xs font-mono font-bold text-center border-r-2 border-black uppercase ${
            mobileView === "editor" ? "bg-[#FFF000]" : "bg-white"
          }`}
        >
          Form Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-2.5 text-xs font-mono font-bold text-center uppercase ${
            mobileView === "preview" ? "bg-[#FFF000]" : "bg-white"
          }`}
        >
          Live Preview ATS
        </button>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Form Editor (5 cols) */}
          <div
            className={`lg:col-span-6 space-y-4 no-print ${
              mobileView === "editor" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Editor Tabs Navigation */}
            <div className="flex flex-wrap gap-1 border-b-3 border-black pb-2 bg-black p-2">
              {[
                { id: "personal", label: "01. Kontak" },
                { id: "summary", label: "02. Ringkasan" },
                { id: "experience", label: "03. Pengalaman" },
                { id: "skills", label: "04. Keahlian" },
                { id: "education", label: "05. Pendidikan" },
                { id: "projects", label: "06. Proyek" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`text-xs font-mono font-bold px-3 py-1.5 border border-black uppercase transition-all ${
                    activeTab === tab.id
                      ? "bg-[#FFF000] text-black shadow-[2px_2px_0px_#fff]"
                      : "bg-black text-white hover:bg-white/20"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Panels */}
            <div className="bg-white border-3 border-black shadow-[6px_6px_0px_#000] p-6 space-y-4">
              {/* TAB 1: PERSONAL INFO */}
              {activeTab === "personal" && (
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-sm uppercase pb-2 border-b-2 border-black flex items-center justify-between">
                    <span>Identitas & Informasi Kontak</span>
                    <span className="text-[10px] bg-[#FFF000] px-2 py-0.5 border border-black">
                      WAJIB ATS
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={data.personal.fullName}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personal: { ...data.personal, fullName: e.target.value },
                          })
                        }
                        placeholder="Nama Lengkap Anda"
                        className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase mb-1">
                        Target Posisi / Jabatan
                      </label>
                      <input
                        type="text"
                        value={data.personal.jobTitle}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personal: { ...data.personal, jobTitle: e.target.value },
                          })
                        }
                        placeholder="cth: Senior Fullstack Engineer"
                        className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase mb-1">
                        Alamat Email
                      </label>
                      <input
                        type="email"
                        value={data.personal.email}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personal: { ...data.personal, email: e.target.value },
                          })
                        }
                        placeholder="email@example.com"
                        className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase mb-1">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={data.personal.phone}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personal: { ...data.personal, phone: e.target.value },
                          })
                        }
                        placeholder="+62 812..."
                        className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase mb-1">
                        Domisili (Kota)
                      </label>
                      <input
                        type="text"
                        value={data.personal.location}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personal: { ...data.personal, location: e.target.value },
                          })
                        }
                        placeholder="Jakarta, Indonesia"
                        className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase mb-1">
                        LinkedIn (URL / Handle)
                      </label>
                      <input
                        type="text"
                        value={data.personal.linkedin}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personal: { ...data.personal, linkedin: e.target.value },
                          })
                        }
                        placeholder="linkedin.com/in/username"
                        className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase mb-1">
                        GitHub / Portofolio
                      </label>
                      <input
                        type="text"
                        value={data.personal.github}
                        onChange={(e) =>
                          updateData({
                            ...data,
                            personal: { ...data.personal, github: e.target.value },
                          })
                        }
                        placeholder="github.com/username"
                        className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SUMMARY */}
              {activeTab === "summary" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <h3 className="font-mono font-bold text-sm uppercase">
                      Ringkasan Profesional (Professional Summary)
                    </h3>
                    <span className="text-[10px] font-mono text-black/60">
                      2-4 Kalimat Padat
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={data.summary}
                    onChange={(e) => updateData({ ...data, summary: e.target.value })}
                    placeholder="Tuliskan pengalaman bertahun-tahun, bidang spesialisasi, dan 1 pencapaian utama dengan angka konkret..."
                    className="w-full p-3 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black leading-relaxed"
                  />
                  <div className="p-3 bg-[#FFF000]/15 border-2 border-black text-xs font-mono">
                    <strong>TIPS ATS:</strong> Sertakan kata kunci posisi sasaran Anda di kalimat pertama.
                  </div>
                </div>
              )}

              {/* TAB 3: EXPERIENCE */}
              {activeTab === "experience" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <h3 className="font-mono font-bold text-sm uppercase">
                      Riwayat Pengalaman Kerja
                    </h3>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="px-2.5 py-1 bg-black text-[#FFF000] text-xs font-mono font-bold border border-black hover:bg-white hover:text-black flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>TAMBAH PEKERJAAN</span>
                    </button>
                  </div>

                  {data.experience.map((exp, expIdx) => (
                    <div
                      key={exp.id || expIdx}
                      className="p-4 border-2 border-black bg-zinc-50 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between border-b border-black/20 pb-2">
                        <span className="font-mono text-xs font-bold uppercase">
                          PEKERJAAN #{expIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExperience(expIdx)}
                          className="text-red-600 hover:text-red-800 text-xs font-mono flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                            Posisi / Jabatan
                          </label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateExperience(expIdx, "role", e.target.value)}
                            placeholder="cth: Software Engineer"
                            className="w-full p-1.5 border border-black text-xs font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                            Nama Perusahaan
                          </label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(expIdx, "company", e.target.value)}
                            placeholder="cth: PT Solusi Digital"
                            className="w-full p-1.5 border border-black text-xs font-sans"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                            Lokasi
                          </label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateExperience(expIdx, "location", e.target.value)}
                            placeholder="Jakarta, ID"
                            className="w-full p-1.5 border border-black text-xs font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                            Tahun Mulai
                          </label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(expIdx, "startDate", e.target.value)}
                            placeholder="2022"
                            className="w-full p-1.5 border border-black text-xs font-sans"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                            Tahun Selesai
                          </label>
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) => updateExperience(expIdx, "endDate", e.target.value)}
                            placeholder="Sekarang / 2024"
                            className="w-full p-1.5 border border-black text-xs font-sans"
                          />
                        </div>
                      </div>

                      {/* Bullets */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-mono font-bold uppercase text-black/70">
                            Pencapaian & Tanggung Jawab (Bullet Points)
                          </label>
                          <button
                            type="button"
                            onClick={() => addExpBullet(expIdx)}
                            className="text-[11px] font-mono font-bold text-black underline hover:text-[#FFF000] hover:bg-black px-1"
                          >
                            + Tambah Bullet
                          </button>
                        </div>

                        {exp.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="flex items-center gap-2">
                            <span className="font-mono text-xs text-black/60">•</span>
                            <input
                              type="text"
                              value={bullet}
                              onChange={(e) => updateExpBullet(expIdx, bIdx, e.target.value)}
                              placeholder="Gunakan formula: Action Verb + Task + Quantifiable Result..."
                              className="w-full p-1.5 border border-black text-xs font-sans"
                            />
                            {exp.bullets.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExpBullet(expIdx, bIdx)}
                                className="text-red-500 hover:text-red-800 text-xs px-1"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: SKILLS */}
              {activeTab === "skills" && (
                <div className="space-y-4">
                  <h3 className="font-mono font-bold text-sm uppercase pb-2 border-b-2 border-black">
                    Keahlian Teknis & Tools (ATS Keywords)
                  </h3>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase mb-1">
                      Bahasa Pemrograman & Framework
                    </label>
                    <textarea
                      rows={3}
                      value={data.skills.technical}
                      onChange={(e) =>
                        updateData({
                          ...data,
                          skills: { ...data.skills, technical: e.target.value },
                        })
                      }
                      placeholder="Pisahkan dengan koma: TypeScript, React, Next.js, Go, PostgreSQL, Python..."
                      className="w-full p-2 border-2 border-black text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase mb-1">
                      Tools, Infrastruktur & Platform
                    </label>
                    <textarea
                      rows={2}
                      value={data.skills.tools}
                      onChange={(e) =>
                        updateData({
                          ...data,
                          skills: { ...data.skills, tools: e.target.value },
                        })
                      }
                      placeholder="Docker, Git, Cloudflare Workers, AWS, Redis, Linux, Figma..."
                      className="w-full p-2 border-2 border-black text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase mb-1">
                      Keahlian Metodologi & Soft Skills
                    </label>
                    <input
                      type="text"
                      value={data.skills.soft}
                      onChange={(e) =>
                        updateData({
                          ...data,
                          skills: { ...data.skills, soft: e.target.value },
                        })
                      }
                      placeholder="Agile/Scrum, Code Review, System Architecture, Team Mentorship..."
                      className="w-full p-2 border-2 border-black text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: EDUCATION */}
              {activeTab === "education" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <h3 className="font-mono font-bold text-sm uppercase">Pendidikan</h3>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="px-2.5 py-1 bg-black text-[#FFF000] text-xs font-mono font-bold border border-black hover:bg-white hover:text-black flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>TAMBAH</span>
                    </button>
                  </div>

                  {data.education.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-3 border-2 border-black bg-zinc-50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold">PENDIDIKAN #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeEducation(idx)}
                          className="text-red-600 text-xs font-mono"
                        >
                          Hapus
                        </button>
                      </div>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                        placeholder="Gelar & Jurusan (cth: S.Kom - Teknik Informatika)"
                        className="w-full p-1.5 border border-black text-xs font-sans"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                          placeholder="Nama Universitas"
                          className="w-full p-1.5 border border-black text-xs font-sans"
                        />
                        <input
                          type="text"
                          value={edu.year}
                          onChange={(e) => updateEducation(idx, "year", e.target.value)}
                          placeholder="Tahun (2018 - 2022)"
                          className="w-full p-1.5 border border-black text-xs font-sans"
                        />
                      </div>
                      <input
                        type="text"
                        value={edu.details}
                        onChange={(e) => updateEducation(idx, "details", e.target.value)}
                        placeholder="Keterangan tambahan (IPK, Fokus studi)"
                        className="w-full p-1.5 border border-black text-xs font-sans"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: PROJECTS */}
              {activeTab === "projects" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b-2 border-black">
                    <h3 className="font-mono font-bold text-sm uppercase">Proyek & Portofolio</h3>
                    <button
                      type="button"
                      onClick={addProject}
                      className="px-2.5 py-1 bg-black text-[#FFF000] text-xs font-mono font-bold border border-black hover:bg-white hover:text-black flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>TAMBAH PROYEK</span>
                    </button>
                  </div>

                  {data.projects.map((proj, idx) => (
                    <div key={proj.id || idx} className="p-3 border-2 border-black bg-zinc-50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold">PROYEK #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeProject(idx)}
                          className="text-red-600 text-xs font-mono"
                        >
                          Hapus
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateProject(idx, "name", e.target.value)}
                          placeholder="Nama Proyek"
                          className="w-full p-1.5 border border-black text-xs font-sans"
                        />
                        <input
                          type="text"
                          value={proj.link}
                          onChange={(e) => updateProject(idx, "link", e.target.value)}
                          placeholder="Link URL / GitHub"
                          className="w-full p-1.5 border border-black text-xs font-sans"
                        />
                      </div>
                      <input
                        type="text"
                        value={proj.techStack}
                        onChange={(e) => updateProject(idx, "techStack", e.target.value)}
                        placeholder="Tech Stack (cth: Next.js, Cloudflare, PostgreSQL)"
                        className="w-full p-1.5 border border-black text-xs font-sans"
                      />
                      <textarea
                        rows={2}
                        value={proj.description}
                        onChange={(e) => updateProject(idx, "description", e.target.value)}
                        placeholder="Deskripsi singkat & dampak proyek..."
                        className="w-full p-1.5 border border-black text-xs font-sans"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Live ATS Preview (6 cols) */}
          <div
            className={`lg:col-span-6 flex flex-col ${
              mobileView === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Preview Banner */}
            <div className="flex items-center justify-between bg-black text-[#FFF000] px-4 py-2 border-3 border-black no-print">
              <span className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span>[ LIVE PREVIEW // FORMAT RESUME STANDAR ATS ]</span>
              </span>
              <span className="text-[10px] font-mono bg-white text-black px-2 py-0.5 font-bold">
                1-KOLOM BAKU
              </span>
            </div>

            {/* Resume Document A4 Canvas */}
            <div className="cv-preview-container bg-white border-3 border-black shadow-[8px_8px_0px_#000] p-8 sm:p-12 text-black font-sans leading-normal overflow-hidden min-h-[840px]">
              <div className="cv-document max-w-[720px] mx-auto text-black">
                {/* Header Section */}
                <div className="text-center pb-4 mb-4 border-b border-black">
                  <h1 className="text-2xl font-bold tracking-tight uppercase mb-1">
                    {data.personal.fullName || "NAMA LENGKAP"}
                  </h1>
                  {data.personal.jobTitle && (
                    <div className="text-sm font-semibold text-zinc-700 uppercase tracking-wide mb-2">
                      {data.personal.jobTitle}
                    </div>
                  )}
                  <div className="text-xs text-zinc-700 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>• {data.personal.phone}</span>}
                    {data.personal.location && <span>• {data.personal.location}</span>}
                    {data.personal.linkedin && <span>• {data.personal.linkedin}</span>}
                    {data.personal.github && <span>• {data.personal.github}</span>}
                  </div>
                </div>

                {/* Summary Section */}
                {data.summary && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                      PROFESSIONAL SUMMARY
                    </h2>
                    <p className="text-xs text-zinc-800 leading-relaxed text-justify">
                      {data.summary}
                    </p>
                  </div>
                )}

                {/* Experience Section */}
                {data.experience.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2">
                      WORK EXPERIENCE
                    </h2>
                    <div className="space-y-3">
                      {data.experience.map((exp, i) => (
                        <div key={exp.id || i}>
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="font-bold text-black">
                              {exp.role || "Posisi"} —{" "}
                              <span className="font-medium text-zinc-800">
                                {exp.company || "Perusahaan"}
                              </span>
                            </span>
                            <span className="font-medium text-zinc-600 text-[11px]">
                              {exp.startDate} - {exp.endDate}
                              {exp.location ? ` | ${exp.location}` : ""}
                            </span>
                          </div>
                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="list-disc ml-4 mt-1 space-y-1 text-xs text-zinc-800 leading-relaxed">
                              {exp.bullets.filter(Boolean).map((b, bIdx) => (
                                <li key={bIdx}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {(data.skills.technical || data.skills.tools || data.skills.soft) && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-1.5">
                      TECHNICAL & CORE SKILLS
                    </h2>
                    <div className="space-y-1 text-xs text-zinc-800">
                      {data.skills.technical && (
                        <div>
                          <strong className="font-semibold text-black">Languages & Frameworks:</strong>{" "}
                          {data.skills.technical}
                        </div>
                      )}
                      {data.skills.tools && (
                        <div>
                          <strong className="font-semibold text-black">Tools & Infrastructure:</strong>{" "}
                          {data.skills.tools}
                        </div>
                      )}
                      {data.skills.soft && (
                        <div>
                          <strong className="font-semibold text-black">Methodologies:</strong>{" "}
                          {data.skills.soft}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {data.education.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2">
                      EDUCATION
                    </h2>
                    <div className="space-y-2">
                      {data.education.map((edu, i) => (
                        <div key={edu.id || i}>
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="font-bold text-black">
                              {edu.institution || "Institusi"}
                            </span>
                            <span className="font-medium text-zinc-600 text-[11px]">
                              {edu.year}
                              {edu.location ? ` | ${edu.location}` : ""}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-800 font-medium">
                            {edu.degree}
                          </div>
                          {edu.details && (
                            <div className="text-[11px] text-zinc-600 italic">
                              {edu.details}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {data.projects.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2">
                      KEY PROJECTS
                    </h2>
                    <div className="space-y-2">
                      {data.projects.map((proj, i) => (
                        <div key={proj.id || i}>
                          <div className="flex justify-between items-baseline text-xs">
                            <span className="font-bold text-black">
                              {proj.name}
                              {proj.techStack ? (
                                <span className="font-normal text-zinc-600">
                                  {" "}
                                  ({proj.techStack})
                                </span>
                              ) : null}
                            </span>
                            {proj.link && (
                              <span className="font-mono text-[10px] text-zinc-600">
                                {proj.link}
                              </span>
                            )}
                          </div>
                          {proj.description && (
                            <p className="text-xs text-zinc-800 mt-0.5">
                              {proj.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
