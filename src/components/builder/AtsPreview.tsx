import React from "react";
import { ResumeData } from "@/types/resume";
import { ResumePageContent } from "@/lib/resume-paginator";
import { RichText } from "@/components/RichText";
import { formatLocalizedDate, formatLocalizedDateRange } from "@/lib/rich-text-utils";

interface AtsPreviewProps {
  data: ResumeData;
  pages: ResumePageContent[];
  previewScale: number;
  isCompact?: boolean;
  onToggleCompact?: () => void;
}

export function AtsPreview({ data, pages, previewScale, isCompact = false, onToggleCompact }: AtsPreviewProps) {
  const isEnglish = (data.language || "id") === "en";

  return (
    <>
      {/* Preview Banner */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-black text-white px-4 py-2 border-3 border-black no-print mb-4">
        <span className="font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <span>[ PRATINJAU DOKUMEN // FORMAT RESMI STANDAR ATS ]</span>
        </span>
        <div className="flex items-center gap-2">
          {onToggleCompact && (
            <button
              type="button"
              onClick={onToggleCompact}
              className={`text-[10px] font-mono px-2 py-0.5 font-bold border border-white transition-colors cursor-pointer uppercase ${
                isCompact
                  ? "bg-[#1D4ED8] text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title="Persempit margin dan spasi agar muat 1 halaman"
            >
              {isCompact ? "SPASI PADAT: ON" : "PADATKAN SPASI"}
            </button>
          )}
          <span className="text-[10px] font-mono bg-white text-black px-2 py-0.5 font-bold">
            {pages.length === 1 ? "1 HALAMAN A4 (IDEAL)" : `${pages.length} HALAMAN A4`}
          </span>
        </div>
      </div>

      {/* Paginated Resume Pages (Sheet 1, Sheet 2, etc.) */}
      <div className="w-full flex flex-col items-center space-y-4">
        {pages.map((page, pIdx) => (
          <React.Fragment key={`page-${page.pageNumber}`}>
            {/* Visual Page Break Separator between pages */}
            {pIdx > 0 && (
              <div className="w-full flex items-center justify-center gap-3 my-4 no-print select-none">
                <div className="h-[2px] bg-black/40 flex-1 border-b border-dashed border-black" />
                <span className="font-mono text-[11px] font-bold bg-[#1D4ED8] text-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_#000] uppercase tracking-wider flex items-center gap-1.5">
                  <span>✂ BATAS HALAMAN {pIdx} // AWAL HALAMAN {page.pageNumber} ✂</span>
                </span>
                <div className="h-[2px] bg-black/40 flex-1 border-b border-dashed border-black" />
              </div>
            )}

            {/* A4 Page Canvas Sheet - Exact 210mm x 297mm (794px x 1123px at 96 DPI) */}
            <div
              style={{
                zoom: previewScale < 1 ? previewScale : undefined,
              }}
              className={`cv-preview-container cv-page relative bg-white border-3 border-black shadow-[8px_8px_0px_#000] w-[794px] min-h-[1123px] text-black leading-normal print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:min-h-0 print:[zoom:1] ${
                isCompact ? "p-[26px]" : "p-[38px]"
              }`}
            >
              {/* Page Badge Indicator */}
              <div className="absolute top-3 right-4 font-mono text-[10px] text-zinc-400 font-bold no-print select-none">
                HALAMAN {page.pageNumber} / {pages.length}
              </div>

              <div className="cv-document w-full text-black print:max-w-none print:w-full font-['Arial','Helvetica_Neue',Helvetica,sans-serif]">
                {page.hasHeader ? (
                  /* Header Section */
                  <div className="text-left pb-1 mb-2">
                    <h1 className="text-[22px] font-bold tracking-tight uppercase mb-1 text-black">
                      {data.personal.fullName || (isEnglish ? "FULL NAME" : "NAMA LENGKAP")}
                    </h1>
                    {data.personal.jobTitle && (
                      <div className="text-[13px] font-semibold text-zinc-800 uppercase tracking-wide mb-1">
                        {data.personal.jobTitle}
                      </div>
                    )}
                    {/* Contact Line 1 */}
                    <div className="text-[12px] text-zinc-600 mb-0.5">
                      {[
                        data.personal.phone,
                        data.personal.email,
                        data.personal.linkedin,
                        data.personal.github,
                        data.personal.website,
                      ]
                        .filter(Boolean)
                        .join(" | ")}
                    </div>
                    {/* Address / Location Line 2 */}
                    {data.personal.location && (
                      <div className="text-[12px] text-zinc-600">
                        {data.personal.location}
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Summary Section */}
                {page.summary && (
                  <div className="mb-4">
                    <p className="text-[12px] text-zinc-900 leading-[1.38] text-justify">
                      <RichText content={page.summary} />
                    </p>
                  </div>
                )}

                {/* Work Experiences Section */}
                {page.experience && page.experience.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-[15px] font-bold text-black border-b border-black pb-0.5 mb-2.5">
                      {isEnglish ? "Work Experience" : "Pengalaman Kerja"}
                    </h2>
                    <div className="space-y-3">
                      {page.experience.map((exp, i) => (
                        <div key={exp.id || i}>
                          <div className="flex justify-between items-baseline text-[12px]">
                            <span className="font-bold text-black">
                              {exp.company || (isEnglish ? "Company" : "Perusahaan")}
                              {exp.location ? ` - ${exp.location}` : ""}
                            </span>
                            <span className="font-normal text-black text-[12px] shrink-0">
                              {formatLocalizedDateRange(
                                exp.startDate,
                                exp.endDate,
                                isEnglish ? "en" : "id"
                              )}
                            </span>
                          </div>
                          <div className="italic text-[12px] text-black mb-1">
                            {exp.role || (isEnglish ? "Role / Position" : "Posisi")}
                          </div>
                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="list-disc ml-5 space-y-0.5 text-[12px] text-zinc-900 leading-[1.38]">
                              {exp.bullets.filter(Boolean).map((b, bIdx) => (
                                <li key={bIdx}>
                                  <RichText content={b} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {page.education && page.education.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-[15px] font-bold text-black border-b border-black pb-0.5 mb-2.5">
                      {isEnglish ? "Education" : "Jenjang Pendidikan"}
                    </h2>
                    <div className="space-y-2">
                      {page.education.map((edu, i) => (
                        <div key={edu.id || i}>
                          <div className="flex justify-between items-baseline text-[12px]">
                            <span className="font-bold text-black">
                              {edu.institution || (isEnglish ? "Institution" : "Institusi")}
                              {edu.location ? ` - ${edu.location}` : ""}
                            </span>
                            <span className="font-normal text-black text-[12px] shrink-0">
                              {formatLocalizedDate(edu.year, isEnglish ? "en" : "id")}
                            </span>
                          </div>
                          <div className="italic text-[12px] text-black">
                            {edu.degree}
                            {edu.details ? `, ${edu.details}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects / Organisational Experience Section */}
                {page.projects && page.projects.length > 0 && (
                  <div className="mb-4">
                    <h2 className="text-[15px] font-bold text-black border-b border-black pb-0.5 mb-2.5">
                      {data.customProjectTitle?.trim() ||
                        (isEnglish
                          ? "Organisational Experience"
                          : "Pengalaman Organisasi")}
                    </h2>
                    <div className="space-y-2.5">
                      {page.projects.map((proj, i) => (
                        <div key={proj.id || i}>
                          <div className="flex justify-between items-baseline text-[12px]">
                            <span className="font-bold text-black">{proj.name || (isEnglish ? "Activity / Project Name" : "Nama Kegiatan")}</span>
                            {proj.link && (
                              <span className="font-normal text-black text-[12px] shrink-0">
                                {formatLocalizedDate(proj.link, isEnglish ? "en" : "id")}
                              </span>
                            )}
                          </div>
                          {proj.techStack && (
                            <div className="italic text-[12px] text-black mb-0.5">
                              {proj.techStack}
                            </div>
                          )}
                          {proj.description && (
                            <div className="text-[12px] text-zinc-900 leading-[1.38]">
                              {proj.description
                                .split("\n")
                                .map((line) => line.trim())
                                .filter(Boolean)
                                .map((line, lIdx) => {
                                  const isBullet =
                                    line.startsWith("-") ||
                                    line.startsWith("•") ||
                                    proj.description.includes("\n");
                                  const clean = line.replace(/^[-•*]\s*/, "");
                                  return isBullet ? (
                                    <div
                                      key={lIdx}
                                      className="flex items-start gap-1.5 ml-2"
                                    >
                                      <span className="font-bold text-black">•</span>
                                      <RichText content={clean} />
                                    </div>
                                  ) : (
                                    <p key={lIdx}>
                                      <RichText content={clean} />
                                    </p>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills, Awards & Additional Section */}
                {page.skills &&
                  (page.skills.technical || page.skills.tools || page.skills.soft) && (
                    <div className="mb-4">
                      <h2 className="text-[15px] font-bold text-black border-b border-black pb-0.5 mb-2.5">
                        {isEnglish
                          ? "Skills, Awards & Additional"
                          : "Keterampilan, Prestasi & Pengalaman Lain"}
                      </h2>
                      <div className="space-y-1 text-[12px] text-zinc-900 leading-[1.38]">
                        {page.skills.technical && (
                          <div>
                            <strong className="font-bold text-black">
                              {isEnglish ? "Technical & Core Skills:" : "Hard Skills:"}
                            </strong>{" "}
                            <RichText content={page.skills.technical} />
                          </div>
                        )}
                        {page.skills.tools && (
                          <div>
                            <strong className="font-bold text-black">
                              {isEnglish ? "Tools & Software:" : "Tools & Aplikasi:"}
                            </strong>{" "}
                            <RichText content={page.skills.tools} />
                          </div>
                        )}
                        {page.skills.soft && (
                          <div>
                            <strong className="font-bold text-black">
                              {isEnglish
                                ? "Soft Skills & Competencies:"
                                : "Soft Skills:"}
                            </strong>{" "}
                            <RichText content={page.skills.soft} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
