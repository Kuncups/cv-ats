import React from "react";
import { ResumeData, EducationItem } from "@/types/resume";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

interface StepEducationProps {
  data: ResumeData;
  updateData: (data: ResumeData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepEducation({
  data,
  updateData,
  onNext,
  onBack,
}: StepEducationProps) {
  const isEnglish = (data.language || "id") === "en";

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      year: "",
      details: "",
    };
    updateData({ ...data, education: [...data.education, newEdu] });
  };

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ ...data, education: updated });
  };

  const removeEducation = (index: number) => {
    updateData({
      ...data,
      education: data.education.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b-2 border-black">
        <div>
          <h3 className="font-mono font-bold text-sm uppercase">
            3. Jenjang Pendidikan
          </h3>
          <p className="text-xs text-zinc-600 mt-0.5 font-sans">
            Tuliskan riwayat pendidikan formal, institusi, jurusan, tahun, dan IPK/penghargaan.
          </p>
        </div>
        <button
          type="button"
          onClick={addEducation}
          className="px-2.5 py-1 bg-[#1D4ED8] text-white text-xs font-mono font-bold border border-black hover:bg-[#2563EB] flex items-center gap-1 shrink-0 cursor-pointer shadow-[1px_1px_0px_#000]"
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
              className="text-red-600 text-xs font-mono flex items-center gap-1 cursor-pointer hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
          <input
            type="text"
            value={edu.degree}
            onChange={(e) => updateEducation(idx, "degree", e.target.value)}
            placeholder="Gelar & Jurusan (cth: Sarjana Manajemen / S.M. - Manajemen SDM)"
            className="w-full p-1.5 border border-black text-xs font-sans"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={edu.institution}
              onChange={(e) => updateEducation(idx, "institution", e.target.value)}
              placeholder={isEnglish ? "University / Institution" : "Nama Universitas / Institusi"}
              className="w-full p-1.5 border border-black text-xs font-sans"
            />
            <MonthYearPicker
              value={edu.year}
              onChange={(val) => updateEducation(idx, "year", val)}
              placeholder={isEnglish ? "Year / Period (2018 - 2022)" : "Bulan & Tahun (2018 - 2022)"}
              language={isEnglish ? "en" : "id"}
            />
          </div>
          <input
            type="text"
            value={edu.details}
            onChange={(e) => updateEducation(idx, "details", e.target.value)}
            placeholder="Keterangan tambahan (cth: IPK 3.75 / 4.00, Lulusan Terbaik)"
            className="w-full p-1.5 border border-black text-xs font-sans"
          />
        </div>
      ))}

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
          className="px-5 py-2.5 bg-[#1D4ED8] text-white font-mono text-xs font-bold border-2 border-black hover:bg-[#2563EB] flex items-center gap-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
        >
          <span>SIMPAN & LANJUTKAN</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
