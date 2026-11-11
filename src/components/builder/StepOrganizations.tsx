import React from "react";
import { ResumeData, ProjectItem } from "@/types/resume";
import { RichTextarea } from "@/components/RichText";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

interface StepOrganizationsProps {
  data: ResumeData;
  updateData: (data: ResumeData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepOrganizations({
  data,
  updateData,
  onNext,
  onBack,
}: StepOrganizationsProps) {
  const isEnglish = (data.language || "id") === "en";

  const addProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: "",
      techStack: "",
      link: "",
      description: "",
    };
    updateData({ ...data, projects: [...data.projects, newProj] });
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    updateData({ ...data, projects: updated });
  };

  const removeProject = (index: number) => {
    updateData({
      ...data,
      projects: data.projects.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b-2 border-black">
        <div>
          <h3 className="font-mono font-bold text-sm uppercase">
            4. Pengalaman Organisasi & Proyek
          </h3>
          <p className="text-xs text-zinc-600 mt-0.5 font-sans">
            Pengalaman organisasi, kepanitiaan, kepemimpinan, atau kegiatan proyek relevan.
          </p>
        </div>
        <button
          type="button"
          onClick={addProject}
          className="px-2.5 py-1 bg-black text-[#FFF000] text-xs font-mono font-bold border border-black hover:bg-white hover:text-black flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>TAMBAH</span>
        </button>
      </div>

      <div>
        <label className="block text-xs font-mono font-bold uppercase mb-1">
          Judul Bagian di CV (Opsional)
        </label>
        <input
          type="text"
          value={data.customProjectTitle || ""}
          onChange={(e) => updateData({ ...data, customProjectTitle: e.target.value })}
          placeholder="cth: Pengalaman Organisasi / Organisational Experience / Key Projects"
          className="w-full p-2 border-2 border-black text-xs font-sans focus:outline-none focus:ring-2 focus:ring-black"
        />
        <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
          Kosongkan untuk penamaan otomatis standar ATS (Pengalaman Organisasi).
        </span>
      </div>

      {data.projects.map((proj, idx) => (
        <div key={proj.id || idx} className="p-3 border-2 border-black bg-zinc-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs font-bold">ORGANISASI / KEGIATAN #{idx + 1}</span>
            <button
              type="button"
              onClick={() => removeProject(idx)}
              className="text-red-600 text-xs font-mono flex items-center gap-1 cursor-pointer hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={proj.name}
              onChange={(e) => updateProject(idx, "name", e.target.value)}
              placeholder="Nama Organisasi / Proyek / Kegiatan"
              className="w-full p-1.5 border border-black text-xs font-sans"
            />
            <input
              type="text"
              value={proj.link}
              onChange={(e) => updateProject(idx, "link", e.target.value)}
              placeholder={isEnglish ? "Period / Organization / Link" : "Periode / Afiliasi / Tautan"}
              className="w-full p-1.5 border border-black text-xs font-sans"
            />
          </div>
          <input
            type="text"
            value={proj.techStack}
            onChange={(e) => updateProject(idx, "techStack", e.target.value)}
            placeholder="Peran / Jabatan (cth: Project Officer, Sekretaris, Ketua Divisi)"
            className="w-full p-1.5 border border-black text-xs font-sans"
          />
          <RichTextarea
            rows={3}
            value={proj.description}
            onChange={(val) => updateProject(idx, "description", val)}
            placeholder={
              isEnglish
                ? "Activity description & key achievements. Use '-' or bullets (e.g. Organized annual conference for **500+** attendees)..."
                : "Deskripsi kegiatan & poin pencapaian. Gunakan tanda '-' atau baris baru (cth: Mengkoordinasikan seminar bagi **500+** peserta)..."
            }
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
          className="px-5 py-2.5 bg-black text-[#FFF000] font-mono text-xs font-bold border-2 border-black hover:bg-white hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>SIMPAN & LANJUTKAN</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
