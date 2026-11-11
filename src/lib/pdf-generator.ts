import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ResumeData } from "@/types/resume";
import { paginateResume, ResumePageContent } from "@/lib/resume-paginator";
import {
  parseRichTextTokens,
  formatLocalizedDate,
  formatLocalizedDateRange,
} from "@/lib/rich-text-utils";

// A4 Dimensions: 210mm x 297mm ≈ 595.28 x 841.89 points
// Margins: 34pt left/right (~12mm), 48pt top (~17mm), 42pt bottom (~14.8mm)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 34;
const MARGIN_TOP = 48;
const MARGIN_BOTTOM = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2; // 527.28pt

interface FormattedWord {
  text: string;
  font: any;
  underline?: boolean;
  width: number;
}

function drawFormattedParagraph(
  page: any,
  rawText: string,
  options: {
    x: number;
    y: number;
    maxWidth: number;
    fontSize: number;
    fontRegular: any;
    fontBold: any;
    fontItalic: any;
    fontBoldItalic?: any;
    color?: any;
    lineHeight?: number;
  }
): number {
  const {
    x,
    maxWidth,
    fontSize,
    fontRegular,
    fontBold,
    fontItalic,
    fontBoldItalic = fontBold,
    color = rgb(0.12, 0.12, 0.12),
    lineHeight = 14.5,
  } = options;
  let { y } = options;

  if (!rawText) return y;

  const spans = parseRichTextTokens(rawText);
  const words: FormattedWord[] = [];

  for (const span of spans) {
    const font =
      span.bold && span.italic
        ? fontBoldItalic
        : span.bold
        ? fontBold
        : span.italic
        ? fontItalic
        : fontRegular;
    const spanWords = span.text.split(" ");
    for (let i = 0; i < spanWords.length; i++) {
      const w = spanWords[i];
      if (w.length === 0 && i > 0 && i < spanWords.length - 1) continue;
      const wordText = i < spanWords.length - 1 ? `${w} ` : w;
      words.push({
        text: wordText,
        font,
        underline: span.underline,
        width: font.widthOfTextAtSize(wordText, fontSize),
      });
    }
  }

  const lines: FormattedWord[][] = [];
  let currentLine: FormattedWord[] = [];
  let currentLineWidth = 0;

  for (const word of words) {
    if (currentLineWidth + word.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = [word];
      currentLineWidth = word.width;
    } else {
      currentLine.push(word);
      currentLineWidth += word.width;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  for (const line of lines) {
    let curX = x;
    for (const w of line) {
      page.drawText(w.text, {
        x: curX,
        y: y - fontSize,
        size: fontSize,
        font: w.font,
        color,
      });
      if (w.underline) {
        page.drawLine({
          start: { x: curX, y: y - fontSize - 1 },
          end: { x: curX + w.width, y: y - fontSize - 1 },
          thickness: 0.5,
          color,
        });
      }
      curX += w.width;
    }
    y -= lineHeight;
  }

  return y;
}

function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function wrapInlineText(
  firstLinePrefixWidth: number,
  text: string,
  totalWidth: number,
  fontSize: number,
  font: any
): string[] {
  if (!text) return [];
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";
  let maxWidth = totalWidth - firstLinePrefixWidth;

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
      maxWidth = totalWidth;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateResumePdfBlob(data: ResumeData): Promise<Blob> {
  const isEnglish = (data.language || "id") === "en";

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Resume - ${data.personal.fullName || (isEnglish ? "Draft CV" : "Draf CV")}`);
  pdfDoc.setAuthor(data.personal.fullName || (isEnglish ? "Draft CV" : "Draf CV"));

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

  // Synchronize with the exact same pagination as the HTML preview
  const pages: ResumePageContent[] = paginateResume(data);

  for (const pageContent of pages) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN_TOP;

    // Helper for Section Titles (Bold 11.5pt with thin underline and clean spacing)
    const drawSectionTitle = (title: string) => {
      const titleSize = 11.5;
      page.drawText(title, {
        x: MARGIN_X,
        y: y - titleSize,
        size: titleSize,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      // Jarak lega antara teks judul dan garis hitam (mencegah huruf g, p, y menempel garis)
      y -= titleSize + 5;

      page.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: PAGE_WIDTH - MARGIN_X, y },
        thickness: 0.75,
        color: rgb(0, 0, 0),
      });
      // Jarak lega antara garis hitam dan teks pertama di bawahnya
      y -= 11;
    };

    if (pageContent.hasHeader) {
      // 1. Full Header Section (Page 1) - Left-aligned matching reference CV
      const name = (data.personal.fullName || (isEnglish ? "FULL NAME" : "NAMA LENGKAP")).toUpperCase();
      const nameSize = 18;
      page.drawText(name, {
        x: MARGIN_X,
        y: y - nameSize,
        size: nameSize,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      // Jarak lega antara Nama dan Jabatan
      y -= nameSize + 11;

      if (data.personal.jobTitle) {
        const title = data.personal.jobTitle;
        page.drawText(title, {
          x: MARGIN_X,
          y: y - 10,
          size: 10,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        });
        // Jarak lega antara Jabatan dan Kontak
        y -= 17;
      }

      // Contact line (Phone | Email | LinkedIn | GitHub)
      const contactItems = [
        data.personal.phone,
        data.personal.email,
        data.personal.linkedin,
        data.personal.github,
        data.personal.website,
      ].filter(Boolean);

      if (contactItems.length > 0) {
        const contactText = contactItems.join(" | ");
        page.drawText(contactText, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontRegular,
          color: rgb(0.35, 0.35, 0.35),
        });
        // Jarak lega antara Kontak dan Lokasi
        y -= 15;
      }

      // Address line
      if (data.personal.location) {
        page.drawText(data.personal.location, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontRegular,
          color: rgb(0.35, 0.35, 0.35),
        });
        y -= 15;
      }

      y -= 8; // Ruang lega bawah header sebelum seksi berikutnya
    }

    // 2. Summary (Direct paragraph matching reference CV)
    if (pageContent.summary) {
      y = drawFormattedParagraph(page, pageContent.summary, {
        x: MARGIN_X,
        y,
        maxWidth: CONTENT_WIDTH,
        fontSize: 9,
        fontRegular,
        fontBold,
        fontItalic,
        fontBoldItalic,
        color: rgb(0.12, 0.12, 0.12),
        lineHeight: 14.5,
      });
      y -= 10;
    }

    // 3. Work Experience (Pengalaman Kerja)
    if (pageContent.experience && pageContent.experience.length > 0) {
      drawSectionTitle(isEnglish ? "Work Experience" : "Pengalaman Kerja");
      for (let i = 0; i < pageContent.experience.length; i++) {
        const exp = pageContent.experience[i];
        const role = exp.role || (isEnglish ? "Role / Position" : "Posisi");
        const companyLine = exp.location
          ? `${exp.company} - ${exp.location}`
          : exp.company || (isEnglish ? "Company" : "Perusahaan");
        const dateText = formatLocalizedDateRange(
          exp.startDate,
          exp.endDate,
          isEnglish ? "en" : "id"
        );
        const dateWidth = fontRegular.widthOfTextAtSize(dateText, 9);

        // Line 1 Left: Company - Location (Bold, matching reference CV)
        page.drawText(companyLine, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Line 1 Right: Date Range (Regular)
        page.drawText(dateText, {
          x: PAGE_WIDTH - MARGIN_X - dateWidth,
          y: y - 9,
          size: 9,
          font: fontRegular,
          color: rgb(0, 0, 0),
        });
        y -= 13.5;

        // Line 2 Left: Role / Job Title (Italic)
        page.drawText(role, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontItalic,
          color: rgb(0, 0, 0),
        });
        y -= 13;

        // Bullets (with rich text bold/italic/underline support)
        if (exp.bullets && exp.bullets.length > 0) {
          const bullets = exp.bullets.filter(Boolean);
          for (let bIdx = 0; bIdx < bullets.length; bIdx++) {
            const bullet = bullets[bIdx];
            page.drawText("•", {
              x: MARGIN_X + 4,
              y: y - 9,
              size: 9,
              font: fontBold,
              color: rgb(0, 0, 0),
            });
            y = drawFormattedParagraph(page, bullet, {
              x: MARGIN_X + 14,
              y,
              maxWidth: CONTENT_WIDTH - 14,
              fontSize: 9,
              fontRegular,
              fontBold,
              fontItalic,
              fontBoldItalic,
              color: rgb(0.12, 0.12, 0.12),
              lineHeight: 14.5,
            });
            if (bIdx < bullets.length - 1) {
              y -= 2;
            }
          }
        }
        // Jeda antar-pengalaman kerja (hanya jika ada item berikutnya)
        if (i < pageContent.experience.length - 1) {
          y -= 7;
        }
      }
      // Margin penutup seksi ke judul seksi berikutnya (mb-4)
      y -= 10;
    }

    // 4. Education (Jenjang Pendidikan)
    if (pageContent.education && pageContent.education.length > 0) {
      drawSectionTitle(isEnglish ? "Education" : "Jenjang Pendidikan");
      for (let i = 0; i < pageContent.education.length; i++) {
        const edu = pageContent.education[i];
        const instLine = edu.location
          ? `${edu.institution} - ${edu.location}`
          : edu.institution || (isEnglish ? "Institution" : "Institusi");
        const yearText = formatLocalizedDate(edu.year || "", isEnglish ? "en" : "id");
        const yearWidth = fontRegular.widthOfTextAtSize(yearText, 9);

        // Line 1 Left: Institution - Location (Bold)
        page.drawText(instLine, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Line 1 Right: Year Range (Regular)
        page.drawText(yearText, {
          x: PAGE_WIDTH - MARGIN_X - yearWidth,
          y: y - 9,
          size: 9,
          font: fontRegular,
          color: rgb(0, 0, 0),
        });
        y -= 13.5;

        // Line 2: Degree & Details (Italic)
        const degreeText = `${edu.degree || ""}${edu.details ? `, ${edu.details}` : ""}`;
        page.drawText(degreeText, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontItalic,
          color: rgb(0, 0, 0),
        });
        y -= 13;
        // Jeda antar-item pendidikan
        if (i < pageContent.education.length - 1) {
          y -= 5;
        }
      }
      y -= 10;
    }

    // 5. Organisational Experience / Projects (Pengalaman Organisasi)
    if (pageContent.projects && pageContent.projects.length > 0) {
      const sectionName =
        data.customProjectTitle?.trim() ||
        (isEnglish ? "Organisational Experience" : "Pengalaman Organisasi");
      drawSectionTitle(sectionName);

      for (let i = 0; i < pageContent.projects.length; i++) {
        const proj = pageContent.projects[i];
        const projName = proj.name || (isEnglish ? "Activity / Project Name" : "Nama Kegiatan");
        const dateOrLink = formatLocalizedDate(proj.link || "", isEnglish ? "en" : "id");
        const dateWidth = fontRegular.widthOfTextAtSize(dateOrLink, 9);

        // Line 1 Left: Name (Bold)
        page.drawText(projName, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Line 1 Right: Date or Link
        if (dateOrLink) {
          page.drawText(dateOrLink, {
            x: PAGE_WIDTH - MARGIN_X - dateWidth,
            y: y - 9,
            size: 9,
            font: fontRegular,
            color: rgb(0, 0, 0),
          });
        }
        y -= 13.5;

        // Line 2: Role / Tech Stack (Italic)
        if (proj.techStack) {
          page.drawText(proj.techStack, {
            x: MARGIN_X,
            y: y - 9,
            size: 9,
            font: fontItalic,
            color: rgb(0, 0, 0),
          });
          y -= 13;
        }

        // Description / Bullet lines (with rich text bold/italic/underline support)
        if (proj.description) {
          const rawLines = proj.description.split("\n").map((l) => l.trim()).filter(Boolean);
          for (let lIdx = 0; lIdx < rawLines.length; lIdx++) {
            const rawLine = rawLines[lIdx];
            const isBullet = rawLine.startsWith("-") || rawLine.startsWith("•") || rawLines.length > 1;
            const cleanLine = rawLine.replace(/^[-•*]\s*/, "");
            const bulletIndent = isBullet ? 14 : 0;
            if (isBullet) {
              page.drawText("•", {
                x: MARGIN_X + 4,
                y: y - 9,
                size: 9,
                font: fontBold,
                color: rgb(0, 0, 0),
              });
            }
            y = drawFormattedParagraph(page, cleanLine, {
              x: MARGIN_X + bulletIndent,
              y,
              maxWidth: CONTENT_WIDTH - bulletIndent,
              fontSize: 9,
              fontRegular,
              fontBold,
              fontItalic,
              fontBoldItalic,
              color: rgb(0.12, 0.12, 0.12),
              lineHeight: 14.5,
            });
            if (isBullet && lIdx < rawLines.length - 1) {
              y -= 2;
            }
          }
        }
        // Jeda antar-kegiatan/proyek
        if (i < pageContent.projects.length - 1) {
          y -= 7;
        }
      }
      y -= 10;
    }

    // 6. Skills, Awards & Additional (Keterampilan, Prestasi & Pengalaman Lain)
    if (
      pageContent.skills &&
      (pageContent.skills.technical || pageContent.skills.tools || pageContent.skills.soft)
    ) {
      drawSectionTitle(
        isEnglish
          ? "Skills, Awards & Additional"
          : "Keterampilan, Prestasi & Pengalaman Lain"
      );
      const skillItems = [
        {
          label: isEnglish ? "Technical & Core Skills" : "Hard Skills",
          val: pageContent.skills.technical,
        },
        {
          label: isEnglish ? "Tools & Software" : "Tools & Aplikasi",
          val: pageContent.skills.tools,
        },
        {
          label: isEnglish ? "Soft Skills & Competencies" : "Soft Skills",
          val: pageContent.skills.soft,
        },
      ].filter((s) => Boolean(s.val));

      for (let i = 0; i < skillItems.length; i++) {
        const item = skillItems[i];
        const labelText = `${item.label}: `;
        const labelWidth = fontBold.widthOfTextAtSize(labelText, 9);

        page.drawText(labelText, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        const valueLines = wrapInlineText(labelWidth, item.val, CONTENT_WIDTH, 9, fontRegular);
        if (valueLines[0]) {
          page.drawText(valueLines[0], {
            x: MARGIN_X + labelWidth,
            y: y - 9,
            size: 9,
            font: fontRegular,
            color: rgb(0.15, 0.15, 0.15),
          });
        }
        y -= 13.5;

        for (let l = 1; l < valueLines.length; l++) {
          page.drawText(valueLines[l], {
            x: MARGIN_X,
            y: y - 9,
            size: 9,
            font: fontRegular,
            color: rgb(0.15, 0.15, 0.15),
          });
          y -= 13.5;
        }
        if (i < skillItems.length - 1) {
          y -= 4;
        }
      }
      y -= 6;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
}
