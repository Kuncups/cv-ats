import React, { useState } from "react";
import { ResumeData } from "@/types/resume";
import { RESUME_PRESETS } from "@/data/resume-presets";
import { RichTextarea } from "@/components/RichText";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface StepPersonalProps {
  data: ResumeData;
  updateData: (data: ResumeData) => void;
  onNext: () => void;
  onLoadPreset: (presetId: string) => void;
}

export function StepPersonal({
  data,
  updateData,
  onNext,
  onLoadPreset,
}: StepPersonalProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const isEnglish = (data.language || "id") === "en";

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "summary",
          text: data.summary || "",
          role: data.personal.jobTitle || "",
          skills: data.skills.technical || "",
          language: data.language || "id",
        }),
      });
      const json = (await res.json()) as { data?: { result?: string } };
      if (json.data?.result) {
        updateData({ ...data, summary: json.data.result });
      }
    } catch (err) {
      console.error("AI summary error:", err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Collapsible Accordion for Presets */}
      <div className="border-2 border-black bg-zinc-50 overflow-hidden shadow-[2px_2px_0px_#000]">
        <button
          type="button"
          onClick={() => setIsAccordionOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-2.5 bg-zinc-100 hover:bg-blue-50 text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2 text-black">
            <Sparkles className="w-4 h-4 text-black" />
            <span>
              {isEnglish
                ? "Sample Career Profiles (Click to Expand)"
                : "Contoh Profil CV Sesuai Bidang (Klik untuk Buka)"}
            </span>
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-black">
            <span>{isAccordionOpen ? "TUTUP" : "PILIH PROFIL"}</span>
            {isAccordionOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {isAccordionOpen && (
          <div className="p-3 border-t-2 border-black bg-white grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in duration-150">
            {RESUME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onLoadPreset(preset.id);
                  setIsAccordionOpen(false);
                }}
                className="p-2 bg-zinc-50 hover:bg-blue-50 hover:border-[#1D4ED8] border-2 border-black font-mono text-[11px] font-bold text-center uppercase transition-all shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none flex flex-col items-center justify-center gap-1 cursor-pointer"
                title={`Muat contoh ${preset.label} (${preset.field})`}
              >
                <span className="font-black text-black">{preset.label}</span>
                <span className="text-[9px] text-zinc-500 font-sans normal-case">
                  {preset.field}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pb-2 border-b-2 border-black">
        <h3 className="font-mono font-bold text-sm uppercase flex items-center justify-between">
          <span>1. Informasi Pribadi & Kontak</span>
          <span className="text-[10px] bg-[#1D4ED8] text-white px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
            WAJIB ATS
          </span>
        </h3>
        <p className="text-xs text-zinc-600 mt-0.5 font-sans">
          Bantu recruiter mengenal dan menghubungi kamu.
        </p>
      </div>

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
            placeholder="cth: Staff Administrasi, HR Officer, Marketing Specialist, Akuntan"
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
            Nomor Handphone (Mobile / WhatsApp)
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
            Alamat (Domisili Opsional)
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
            URL Profil LinkedIn
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
            Portofolio / URL Website (Opsional)
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
            placeholder="portofolio, website, atau tautan profil"
            className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/* Deskripsi Singkat / Ringkasan Profesional */}
      <div className="pt-3 border-t border-black/20 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-xs font-mono font-bold uppercase">
            {isEnglish
              ? "Professional Summary (Short Bio)"
              : "Deskripsi Singkat Tentang Kamu (Ringkasan Profesional)"}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-black/60 hidden sm:inline">
              {data.summary.length}{" "}
              {isEnglish
                ? "chars"
                : "karakter"}
            </span>
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="px-2.5 py-1 bg-[#1D4ED8] hover:bg-[#2563EB] text-white text-[11px] font-mono font-bold border border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title={
                data.summary.trim()
                  ? (isEnglish ? "Refine your written summary with AI" : "Sempurnakan tulisan ringkasanmu dengan AI")
                  : (isEnglish ? "Generate professional summary with AI" : "Buat ringkasan profesional dengan AI")
              }
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingSummary ? "animate-spin" : ""}`} />
              <span>
                {isGeneratingSummary
                  ? (isEnglish ? "POLISHING..." : "MENYEMPURNAKAN...")
                  : data.summary.trim()
                  ? (isEnglish ? "REFINE WITH AI" : "SEMPURNAKAN DENGAN AI")
                  : (isEnglish ? "CREATE WITH AI" : "BUAT DENGAN AI")}
              </span>
            </button>
          </div>
        </div>
        <RichTextarea
          rows={5}
          value={data.summary}
          onChange={(val) => updateData({ ...data, summary: val })}
          placeholder={
            isEnglish
              ? "Write your years of experience, core expertise, and 1 key achievement with numbers (e.g. Generated **$120K** in revenue)..."
              : "Tuliskan pengalaman bertahun-tahun, bidang spesialisasi, dan 1 pencapaian utama dengan angka konkret (cth: Menaikkan omzet **35%**)..."
          }
        />
        <div className="p-2 bg-blue-50/70 border-2 border-black text-xs font-mono flex items-center justify-between">
          <span>
            <strong>TIPS ATS:</strong>{" "}
            {isEnglish
              ? "Highlight key skills in bold and include 1 quantified metric."
              : "Sertakan kata kunci posisi sasaran dan 1 indikator terukur (angka/persentase)."}
          </span>
        </div>
      </div>

      {/* Step Navigation Bottom */}
      <div className="pt-3 border-t-2 border-black flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2.5 bg-[#1D4ED8] text-white font-mono text-xs font-bold border-2 border-black hover:bg-[#2563EB] flex items-center justify-center transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
        >
          <span>SIMPAN & LANJUTKAN</span>
        </button>
      </div>
    </div>
  );
}
