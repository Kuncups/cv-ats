import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ResumeData } from "@/app/builder/page";
import { paginateResume, ResumePageContent } from "@/lib/resume-paginator";

// A4 Dimensions (72 points per inch): 210mm x 297mm ≈ 595.28 x 841.89 points
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 42;
const MARGIN_TOP = 40;
const MARGIN_BOTTOM = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

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

export async function generateResumePdfBlob(data: ResumeData): Promise<Blob> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Resume - ${data.personal.fullName || "Draft CV"}`);
  pdfDoc.setAuthor(data.personal.fullName || "Draft CV");

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Synchronize with the exact same pagination as the HTML preview
  const pages: ResumePageContent[] = paginateResume(data);

  for (const pageContent of pages) {
    const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN_TOP;

    // Helper for Section Titles
    const drawSectionTitle = (title: string) => {
      const titleSize = 9.5;
      page.drawText(title, {
        x: MARGIN_X,
        y: y - titleSize,
        size: titleSize,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= titleSize + 2.5;

      page.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: PAGE_WIDTH - MARGIN_X, y },
        thickness: 0.75,
        color: rgb(0, 0, 0),
      });
      y -= 7.5;
    };

    if (pageContent.hasHeader) {
      // 1. Full Header Section (Page 1)
      const name = (data.personal.fullName || "NAMA LENGKAP").toUpperCase();
      const nameSize = 18;
      const nameWidth = fontBold.widthOfTextAtSize(name, nameSize);
      page.drawText(name, {
        x: (PAGE_WIDTH - nameWidth) / 2,
        y: y - nameSize,
        size: nameSize,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      y -= nameSize + 3;

      if (data.personal.jobTitle) {
        const title = data.personal.jobTitle.toUpperCase();
        const titleSize = 10;
        const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
        page.drawText(title, {
          x: (PAGE_WIDTH - titleWidth) / 2,
          y: y - titleSize,
          size: titleSize,
          font: fontBold,
          color: rgb(0.25, 0.25, 0.25),
        });
        y -= titleSize + 4;
      }

      // Contact line with bullet separator
      const contacts = [
        data.personal.email,
        data.personal.phone,
        data.personal.location,
        data.personal.linkedin,
        data.personal.github,
      ].filter(Boolean);

      if (contacts.length > 0) {
        const contactText = contacts.join("  •  ");
        const contactSize = 8.5;
        const contactWidth = fontRegular.widthOfTextAtSize(contactText, contactSize);
        const startX = Math.max(MARGIN_X, (PAGE_WIDTH - contactWidth) / 2);
        page.drawText(contactText, {
          x: startX,
          y: y - contactSize,
          size: contactSize,
          font: fontRegular,
          color: rgb(0.25, 0.25, 0.25),
        });
        y -= contactSize + 6;
      }

      // Bottom border line under header
      page.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: PAGE_WIDTH - MARGIN_X, y },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      y -= 12;
    } else {
      // Running Header for Page 2+
      const runningName = (data.personal.fullName || "RESUME").toUpperCase();
      const runningSubtitle = `Lanjutan Halaman ${pageContent.pageNumber}`;
      page.drawText(runningName, {
        x: MARGIN_X,
        y: y - 9,
        size: 9,
        font: fontBold,
        color: rgb(0, 0, 0),
      });
      const subWidth = fontRegular.widthOfTextAtSize(runningSubtitle, 8);
      page.drawText(runningSubtitle, {
        x: PAGE_WIDTH - MARGIN_X - subWidth,
        y: y - 9,
        size: 8,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 12;
      page.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: PAGE_WIDTH - MARGIN_X, y },
        thickness: 0.75,
        color: rgb(0, 0, 0),
      });
      y -= 10;
    }

    // 2. Summary
    if (pageContent.summary) {
      drawSectionTitle("PROFESSIONAL SUMMARY");
      const lines = wrapText(pageContent.summary, CONTENT_WIDTH, 8.5, fontRegular);
      for (const line of lines) {
        page.drawText(line, {
          x: MARGIN_X,
          y: y - 8.5,
          size: 8.5,
          font: fontRegular,
          color: rgb(0.12, 0.12, 0.12),
        });
        y -= 11.5;
      }
      y -= 6;
    }

    // 3. Work Experience
    if (pageContent.experience && pageContent.experience.length > 0) {
      drawSectionTitle("WORK EXPERIENCE");
      for (const exp of pageContent.experience) {
        const role = exp.role || "Posisi";
        const company = exp.company || "Perusahaan";
        const roleText = `${role} — `;
        const roleWidth = fontBold.widthOfTextAtSize(roleText, 9);

        // Role (bold)
        page.drawText(roleText, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Company (regular)
        page.drawText(company, {
          x: MARGIN_X + roleWidth,
          y: y - 9,
          size: 9,
          font: fontRegular,
          color: rgb(0.15, 0.15, 0.15),
        });

        // Date & Location (Right)
        const dateText = `${exp.startDate} - ${exp.endDate}${exp.location ? ` | ${exp.location}` : ""}`;
        const dateWidth = fontRegular.widthOfTextAtSize(dateText, 8);
        page.drawText(dateText, {
          x: PAGE_WIDTH - MARGIN_X - dateWidth,
          y: y - 9,
          size: 8,
          font: fontRegular,
          color: rgb(0.35, 0.35, 0.35),
        });
        y -= 12.5;

        // Bullets
        if (exp.bullets && exp.bullets.length > 0) {
          for (const bullet of exp.bullets.filter(Boolean)) {
            const bulletLines = wrapText(bullet, CONTENT_WIDTH - 14, 8.5, fontRegular);
            for (let i = 0; i < bulletLines.length; i++) {
              if (i === 0) {
                page.drawText("•", {
                  x: MARGIN_X + 4,
                  y: y - 8.5,
                  size: 8.5,
                  font: fontBold,
                  color: rgb(0, 0, 0),
                });
              }
              page.drawText(bulletLines[i], {
                x: MARGIN_X + 14,
                y: y - 8.5,
                size: 8.5,
                font: fontRegular,
                color: rgb(0.15, 0.15, 0.15),
              });
              y -= 11.5;
            }
          }
        }
        y -= 4;
      }
      y -= 4;
    }

    // 4. Skills
    if (
      pageContent.skills &&
      (pageContent.skills.technical || pageContent.skills.tools || pageContent.skills.soft)
    ) {
      drawSectionTitle("TECHNICAL & CORE SKILLS");
      const skillItems = [
        { label: "Languages & Frameworks", val: pageContent.skills.technical },
        { label: "Tools & Infrastructure", val: pageContent.skills.tools },
        { label: "Methodologies", val: pageContent.skills.soft },
      ].filter((s) => Boolean(s.val));

      for (const item of skillItems) {
        const labelText = `${item.label}: `;
        const labelWidth = fontBold.widthOfTextAtSize(labelText, 8.5);

        page.drawText(labelText, {
          x: MARGIN_X,
          y: y - 8.5,
          size: 8.5,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        const valueLines = wrapText(item.val, CONTENT_WIDTH - labelWidth, 8.5, fontRegular);
        page.drawText(valueLines[0] || "", {
          x: MARGIN_X + labelWidth,
          y: y - 8.5,
          size: 8.5,
          font: fontRegular,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= 12;

        for (let i = 1; i < valueLines.length; i++) {
          page.drawText(valueLines[i], {
            x: MARGIN_X + labelWidth,
            y: y - 8.5,
            size: 8.5,
            font: fontRegular,
            color: rgb(0.15, 0.15, 0.15),
          });
          y -= 11.5;
        }
      }
      y -= 6;
    }

    // 5. Education
    if (pageContent.education && pageContent.education.length > 0) {
      drawSectionTitle("EDUCATION");
      for (const edu of pageContent.education) {
        const instText = edu.institution || "Institusi";
        const yearText = `${edu.year}${edu.location ? ` | ${edu.location}` : ""}`;

        // Institution (Bold)
        page.drawText(instText, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Year & Location (Right)
        const yearWidth = fontRegular.widthOfTextAtSize(yearText, 8);
        page.drawText(yearText, {
          x: PAGE_WIDTH - MARGIN_X - yearWidth,
          y: y - 9,
          size: 8,
          font: fontRegular,
          color: rgb(0.35, 0.35, 0.35),
        });
        y -= 12;

        // Degree
        page.drawText(edu.degree || "", {
          x: MARGIN_X,
          y: y - 8.5,
          size: 8.5,
          font: fontRegular,
          color: rgb(0.15, 0.15, 0.15),
        });
        y -= 11.5;

        // Details (italic)
        if (edu.details) {
          page.drawText(edu.details, {
            x: MARGIN_X,
            y: y - 7.5,
            size: 7.5,
            font: fontItalic,
            color: rgb(0.4, 0.4, 0.4),
          });
          y -= 10;
        }
        y -= 3;
      }
      y -= 4;
    }

    // 6. Projects
    if (pageContent.projects && pageContent.projects.length > 0) {
      drawSectionTitle("KEY PROJECTS");
      for (const proj of pageContent.projects) {
        const projName = proj.name || "Nama Proyek";
        const projNameWidth = fontBold.widthOfTextAtSize(projName, 9);

        // Project Name (Bold)
        page.drawText(projName, {
          x: MARGIN_X,
          y: y - 9,
          size: 9,
          font: fontBold,
          color: rgb(0, 0, 0),
        });

        // Tech Stack
        if (proj.techStack) {
          const stackText = ` (${proj.techStack})`;
          page.drawText(stackText, {
            x: MARGIN_X + projNameWidth,
            y: y - 8.5,
            size: 8.5,
            font: fontRegular,
            color: rgb(0.35, 0.35, 0.35),
          });
        }

        // Link (Right)
        if (proj.link) {
          const linkWidth = fontRegular.widthOfTextAtSize(proj.link, 7.5);
          page.drawText(proj.link, {
            x: PAGE_WIDTH - MARGIN_X - linkWidth,
            y: y - 8.5,
            size: 7.5,
            font: fontItalic,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
        y -= 12;

        // Description
        if (proj.description) {
          const descLines = wrapText(proj.description, CONTENT_WIDTH, 8.5, fontRegular);
          for (const line of descLines) {
            page.drawText(line, {
              x: MARGIN_X,
              y: y - 8.5,
              size: 8.5,
              font: fontRegular,
              color: rgb(0.18, 0.18, 0.18),
            });
            y -= 11.5;
          }
        }
        y -= 4;
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
}
