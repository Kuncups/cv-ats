import React, { useState } from "react";
import { ResumeData, ExperienceItem } from "@/types/resume";
import { RichInput } from "@/components/RichText";
import { MonthYearPicker } from "@/components/MonthYearPicker";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface StepExperienceProps {
  data: ResumeData;
  updateData: (data: ResumeData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepExperience({
  data,
  updateData,
  onNext,
  onBack,
}: StepExperienceProps) {
  const isEnglish = (data.language || "id") === "en";
  // ponytail: HTML5 drag & drop + direct array swap. Upgrade to @dnd-kit if touch sensor needed.
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const items = [...data.experience];
    const [removed] = items.splice(draggedIdx, 1);
    items.splice(targetIndex, 0, removed);
    updateData({ ...data, experience: items });
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const moveExperience = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= data.experience.length) return;
    const items = [...data.experience];
    const [item] = items.splice(index, 1);
    items.splice(target, 0, item);
    updateData({ ...data, experience: items });
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
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

  const updateExperience = (index: number, field: keyof ExperienceItem, value: any) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ ...data, experience: updated });
  };

  const removeExperience = (index: number) => {
    updateData({
      ...data,
      experience: data.experience.filter((_, i) => i !== index),
    });
  };

  const addExpBullet = (expIndex: number) => {
    const updated = [...data.experience];
    updated[expIndex] = {
      ...updated[expIndex],
      bullets: [...updated[expIndex].bullets, ""],
    };
    updateData({ ...data, experience: updated });
  };

  const updateExpBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const updated = [...data.experience];
    const newBullets = [...updated[expIndex].bullets];
    newBullets[bulletIndex] = value;
    updated[expIndex] = { ...updated[expIndex], bullets: newBullets };
    updateData({ ...data, experience: updated });
  };

  const removeExpBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...data.experience];
    updated[expIndex] = {
      ...updated[expIndex],
      bullets: updated[expIndex].bullets.filter((_, i) => i !== bulletIndex),
    };
    updateData({ ...data, experience: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b-2 border-black">
        <div>
          <h3 className="font-mono font-bold text-sm uppercase">
            2. Pengalaman Profesional (Kerja)
          </h3>
          <p className="text-xs text-zinc-600 mt-0.5 font-sans">
            Cantumkan riwayat pekerjaan relevan, kata kerja aktif, dan hasil terukur.
          </p>
        </div>
        <button
          type="button"
          onClick={addExperience}
          className="px-2.5 py-1 bg-[#1D4ED8] text-white text-xs font-mono font-bold border border-black hover:bg-[#2563EB] flex items-center gap-1 shrink-0 cursor-pointer shadow-[1px_1px_0px_#000]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>TAMBAH PEKERJAAN</span>
        </button>
      </div>

      {data.experience.map((exp, expIdx) => (
        <div
          key={exp.id || expIdx}
          draggable
          onDragStart={() => handleDragStart(expIdx)}
          onDragOver={(e) => handleDragOver(e, expIdx)}
          onDrop={() => handleDrop(expIdx)}
          onDragEnd={handleDragEnd}
          className={`p-4 border-2 border-black bg-zinc-50 space-y-3 relative transition-all ${
            draggedIdx === expIdx
              ? "opacity-35 scale-[0.99] border-dashed bg-zinc-200"
              : ""
          } ${
            dragOverIdx === expIdx && draggedIdx !== expIdx
              ? "border-t-4 border-t-[#1D4ED8] shadow-[0_-4px_0px_#000]"
              : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-black/20 pb-2">
            <div
              className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing text-black hover:text-zinc-700 select-none"
              title="Tarik atau gunakan panah untuk ubah urutan"
            >
              <GripVertical className="w-4 h-4 text-zinc-500 hover:text-black" />
              <span className="font-mono text-xs font-bold uppercase">
                PEKERJAAN #{expIdx + 1}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center border border-black/40 bg-white">
                <button
                  type="button"
                  disabled={expIdx === 0}
                  onClick={() => moveExperience(expIdx, -1)}
                  className="p-1 hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                  title="Pindah ke atas"
                >
                  <ChevronUp className="w-3 h-3 text-black" />
                </button>
                <div className="w-[1px] h-3 bg-black/30" />
                <button
                  type="button"
                  disabled={expIdx === data.experience.length - 1}
                  onClick={() => moveExperience(expIdx, 1)}
                  className="p-1 hover:bg-blue-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                  title="Pindah ke bawah"
                >
                  <ChevronDown className="w-3 h-3 text-black" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => removeExperience(expIdx)}
                className="text-red-600 hover:text-red-800 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
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
                placeholder="cth: Staff Administrasi, Marketing Specialist, HR Officer"
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
                placeholder="cth: PT Solusi Bisnis Indonesia"
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
                {isEnglish ? "Start Date" : "Bulan & Tahun Mulai"}
              </label>
              <MonthYearPicker
                value={exp.startDate}
                onChange={(val) => updateExperience(expIdx, "startDate", val)}
                placeholder={isEnglish ? "Jan 2022" : "Jan 2022"}
                language={isEnglish ? "en" : "id"}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase mb-1">
                {isEnglish ? "End Date" : "Bulan & Tahun Selesai"}
              </label>
              <MonthYearPicker
                value={exp.endDate}
                onChange={(val) => updateExperience(expIdx, "endDate", val)}
                placeholder={isEnglish ? "Present / Dec 2024" : "Sekarang / Des 2024"}
                canBePresent={true}
                language={isEnglish ? "en" : "id"}
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
                className="text-[11px] font-mono font-bold text-black underline hover:text-[#1D4ED8] px-1 cursor-pointer"
              >
                + Tambah Bullet
              </button>
            </div>

            {exp.bullets.map((bullet, bIdx) => (
              <div key={bIdx} className="flex items-center gap-2">
                <span className="font-mono text-xs text-black/60 shrink-0">•</span>
                <div className="flex-1">
                  <RichInput
                    value={bullet}
                    onChange={(val) => updateExpBullet(expIdx, bIdx, val)}
                    placeholder={
                      isEnglish
                        ? "Formula: Action Verb + Task + Quantifiable Result (e.g. Led **15** team members...)"
                        : "Gunakan formula: Action Verb + Task + Hasil Terukur (cth: Memimpin **15** staf...)"
                    }
                  />
                </div>
                {exp.bullets.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExpBullet(expIdx, bIdx)}
                    className="text-red-500 hover:text-red-800 text-sm px-1 cursor-pointer shrink-0 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Step Navigation Bottom */}
      <div className="pt-3 border-t-2 border-black flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border-2 border-black font-mono text-xs font-bold hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <span>SEBELUMNYA</span>
        </button>
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

