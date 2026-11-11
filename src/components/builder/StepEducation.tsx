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
      startDate: "",
      endDate: "",
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

  const updateEducationDates = (index: number, start: string, end: string) => {
    const formatted = start && end ? `${start} - ${end}` : (end || start || "");
    const updated = [...data.education];
    updated[index] = {
      ...updated[index],
      startDate: start,
      endDate: end,
      year: formatted,
    };
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

      {data.education.map((edu, idx) => {
        const yearStr = edu.year || "";
        const hasRange = yearStr.includes(" - ");
        const defaultStart = edu.startDate || (hasRange ? yearStr.split(" - ")[0] : "");
        const defaultEnd = edu.endDate || (hasRange ? yearStr.split(" - ")[1] : yearStr);

        return (
          <div key={edu.id || idx} className="p-3 border-2 border-black bg-zinc-50 space-y-3">
            <div className="flex justify-between items-center border-b border-black/20 pb-2">
              <span className="font-mono text-xs font-bold uppercase">PENDIDIKAN #{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeEducation(idx)}
                className="text-red-600 hover:text-red-800 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                {isEnglish ? "Degree & Major" : "Gelar & Jurusan"}
              </label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                placeholder={
                  isEnglish
                    ? "e.g. Bachelor of Computer Science"
                    : "Gelar & Jurusan (cth: D3 Sistem Informasi / S.Kom. - Teknik Informatika)"
                }
                className="w-full p-1.5 border border-black text-xs font-sans bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                  {isEnglish ? "University / Institution" : "Nama Universitas / Institusi"}
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                  placeholder={isEnglish ? "University Name" : "Nama Perguruan Tinggi / Sekolah"}
                  className="w-full p-1.5 border border-black text-xs font-sans bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                  {isEnglish ? "Location" : "Kota / Lokasi"}
                </label>
                <input
                  type="text"
                  value={edu.location || ""}
                  onChange={(e) => updateEducation(idx, "location", e.target.value)}
                  placeholder={isEnglish ? "City, Country" : "cth: Jakarta Selatan, ID"}
                  className="w-full p-1.5 border border-black text-xs font-sans bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                  {isEnglish ? "Start Date" : "Bulan & Tahun Mulai"}
                </label>
                <MonthYearPicker
                  value={defaultStart}
                  onChange={(val) => updateEducationDates(idx, val, defaultEnd)}
                  placeholder={isEnglish ? "Aug 2017" : "Agu 2017"}
                  language={isEnglish ? "en" : "id"}
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                  {isEnglish ? "End Date / Graduation" : "Bulan & Tahun Selesai / Lulus"}
                </label>
                <MonthYearPicker
                  value={defaultEnd}
                  onChange={(val) => updateEducationDates(idx, defaultStart, val)}
                  placeholder={isEnglish ? "Present / Jul 2020" : "Sekarang / Jul 2020"}
                  canBePresent={true}
                  language={isEnglish ? "en" : "id"}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                {isEnglish ? "GPA & Additional Information" : "IPK & Keterangan Tambahan"}
              </label>
              <input
                type="text"
                value={edu.details}
                onChange={(e) => updateEducation(idx, "details", e.target.value)}
                placeholder={isEnglish ? "e.g. GPA 3.85 / 4.00, Cum Laude" : "cth: IPK 3.85 / 4.00, Lulusan Terbaik"}
                className="w-full p-1.5 border border-black text-xs font-sans bg-white"
              />
            </div>
          </div>
        );
      })}

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
