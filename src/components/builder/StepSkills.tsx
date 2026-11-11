import React from "react";
import { ResumeData } from "@/types/resume";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepSkillsProps {
  data: ResumeData;
  updateData: (data: ResumeData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSkills({
  data,
  updateData,
  onNext,
  onBack,
}: StepSkillsProps) {
  return (
    <div className="space-y-4">
      <div className="pb-2 border-b-2 border-black">
        <h3 className="font-mono font-bold text-sm uppercase">
          5. Keterampilan, Prestasi & Pengalaman Lain
        </h3>
        <p className="text-xs text-zinc-600 mt-0.5 font-sans">
          Berlaku untuk semua bidang profesi (Administrasi, HR, Marketing, Keuangan, Operasional, IT, dll).
        </p>
      </div>

      <div>
        <label className="block text-xs font-mono font-bold uppercase mb-1">
          Keahlian Utama / Hard Skills (Core Competencies)
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
          placeholder="Pisahkan dengan koma: Administrasi Kantor, Pengelolaan Kas, Riset Pasar, Rekrutmen Karyawan, Analisis Data, Negosiasi B2B, Penyusunan SOP..."
          className="w-full p-2 border-2 border-black text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-xs font-mono font-bold uppercase mb-1">
          Aplikasi, Tools & Software
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
          placeholder="Microsoft Excel, SAP, Google Workspace, Canva, Accurate, CRM, Trello, SPSS..."
          className="w-full p-2 border-2 border-black text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-xs font-mono font-bold uppercase mb-1">
          Keterampilan Interpersonal & Soft Skills
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
          placeholder="Komunikasi Kerja, Manajemen Waktu, Problem Solving, Kepemimpinan Tim, Negosiasi..."
          className="w-full p-2 border-2 border-black text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* Step Navigation Bottom */}
      <div className="pt-3 border-t-2 border-black flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border-2 border-black font-mono text-xs font-bold hover:bg-black hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>SEBELUMNYA</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-5 py-2.5 bg-black text-[#FFF000] font-mono text-xs font-bold border-2 border-black hover:bg-white hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>SELESAI & TINJAU CV</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
