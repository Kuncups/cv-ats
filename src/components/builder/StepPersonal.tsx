import React, { useState } from "react";
import { ResumeData } from "@/types/resume";
import { RESUME_PRESETS } from "@/data/resume-presets";
import { RichTextarea } from "@/components/RichText";
import { ArrowRight, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

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
  const isEnglish = (data.language || "id") === "en";

  return (
    <div className="space-y-4">
      {/* Collapsible Accordion for Presets */}
      <div className="border-2 border-black bg-zinc-50 overflow-hidden shadow-[2px_2px_0px_#000]">
        <button
          type="button"
          onClick={() => setIsAccordionOpen((prev) => !prev)}
          className="w-full flex items-center justify-between p-2.5 bg-zinc-100 hover:bg-[#FFF000] text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
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
                className="p-2 bg-zinc-50 hover:bg-[#FFF000] border-2 border-black font-mono text-[11px] font-bold text-center uppercase transition-all shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none flex flex-col items-center justify-center gap-1 cursor-pointer"
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
          <span className="text-[10px] bg-[#FFF000] px-2 py-0.5 border border-black">
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
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono font-bold uppercase">
            {isEnglish
              ? "Professional Summary (Short Bio)"
              : "Deskripsi Singkat Tentang Kamu (Ringkasan Profesional)"}
          </label>
          <span className="text-[10px] font-mono text-black/60">
            {data.summary.length}{" "}
            {isEnglish
              ? "characters (100-300 recommended)"
              : "karakter (direkomendasikan 100-300)"}
          </span>
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
        <div className="p-2 bg-[#FFF000]/15 border-2 border-black text-xs font-mono flex items-center justify-between">
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
          className="px-5 py-2.5 bg-black text-[#FFF000] font-mono text-xs font-bold border-2 border-black hover:bg-white hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>SIMPAN & LANJUTKAN</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
