import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ResumeData } from "@/app/builder/page";

// A4 Dimensions in points (72 points per inch)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function wrapText(text: string, maxWidth: number, fontSize: number, font: any): string[] {
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

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const checkPageBreak = (neededHeight: number) => {
    if (y - neededHeight < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  // 1. Header (Name & Title)
  const name = data.personal.fullName || "NAMA LENGKAP";
  const nameSize = 18;
  const nameWidth = fontBold.widthOfTextAtSize(name, nameSize);
  page.drawText(name, {
    x: (PAGE_WIDTH - nameWidth) / 2,
    y: y - nameSize,
    size: nameSize,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= nameSize + 4;

  if (data.personal.jobTitle) {
    const title = data.personal.jobTitle.toUpperCase();
    const titleSize = 10;
    const titleWidth = fontBold.widthOfTextAtSize(title, titleSize);
    page.drawText(title, {
      x: (PAGE_WIDTH - titleWidth) / 2,
      y: y - titleSize,
      size: titleSize,
      font: fontBold,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= titleSize + 4;
  }

  // Contact line
  const contacts = [
    data.personal.email,
    data.personal.phone,
    data.personal.location,
    data.personal.linkedin,
    data.personal.github,
  ].filter(Boolean);

  if (contacts.length > 0) {
    const contactText = contacts.join("  |  ");
    const contactSize = 8.5;
    const contactWidth = fontRegular.widthOfTextAtSize(contactText, contactSize);
    const startX = Math.max(MARGIN, (PAGE_WIDTH - contactWidth) / 2);
    page.drawText(contactText, {
      x: startX,
      y: y - contactSize,
      size: contactSize,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= contactSize + 6;
  }

  // Divider line under header
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_WIDTH - MARGIN, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 12;

  // Helper for Section Titles
  const drawSectionTitle = (title: string) => {
    checkPageBreak(30);
    const titleSize = 10;
    page.drawText(title, {
      x: MARGIN,
      y: y - titleSize,
      size: titleSize,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= titleSize + 2;

    page.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    y -= 8;
  };

  // 2. Summary
  if (data.summary) {
    drawSectionTitle("PROFESSIONAL SUMMARY");
    const lines = wrapText(data.summary, CONTENT_WIDTH, 9, fontRegular);
    for (const line of lines) {
      checkPageBreak(13);
      page.drawText(line, {
        x: MARGIN,
        y: y - 9,
        size: 9,
        font: fontRegular,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= 12;
    }
    y -= 6;
  }

  // 3. Work Experience
  if (data.experience.length > 0) {
    drawSectionTitle("WORK EXPERIENCE");
    for (const exp of data.experience) {
      checkPageBreak(35);
      // Role & Company (Left) + Dates (Right)
      const roleText = `${exp.role || "Posisi"} — ${exp.company || "Perusahaan"}`;
      const dateText = `${exp.startDate} - ${exp.endDate}${exp.location ? ` | ${exp.location}` : ""}`;

      page.drawText(roleText, {
        x: MARGIN,
        y: y - 9,
        size: 9.5,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      const dateWidth = fontRegular.widthOfTextAtSize(dateText, 8.5);
      page.drawText(dateText, {
        x: PAGE_WIDTH - MARGIN - dateWidth,
        y: y - 9,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 13;

      // Bullets
      if (exp.bullets && exp.bullets.length > 0) {
        for (const bullet of exp.bullets.filter(Boolean)) {
          const bulletLines = wrapText(bullet, CONTENT_WIDTH - 14, 8.5, fontRegular);
          for (let i = 0; i < bulletLines.length; i++) {
            checkPageBreak(12);
            if (i === 0) {
              page.drawText("•", {
                x: MARGIN + 4,
                y: y - 8.5,
                size: 8.5,
                font: fontBold,
                color: rgb(0, 0, 0),
              });
            }
            page.drawText(bulletLines[i], {
              x: MARGIN + 14,
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
  if (data.skills.technical || data.skills.tools || data.skills.soft) {
    drawSectionTitle("TECHNICAL & CORE SKILLS");
    const skillItems = [
      { label: "Languages & Frameworks", val: data.skills.technical },
      { label: "Tools & Infrastructure", val: data.skills.tools },
      { label: "Methodologies & Soft Skills", val: data.skills.soft },
    ].filter((s) => Boolean(s.val));

    for (const item of skillItems) {
      checkPageBreak(14);
      const labelText = `${item.label}: `;
      const labelWidth = fontBold.widthOfTextAtSize(labelText, 8.5);

      page.drawText(labelText, {
        x: MARGIN,
        y: y - 8.5,
        size: 8.5,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      const valueLines = wrapText(item.val, CONTENT_WIDTH - labelWidth, 8.5, fontRegular);
      page.drawText(valueLines[0] || "", {
        x: MARGIN + labelWidth,
        y: y - 8.5,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 12;

      for (let i = 1; i < valueLines.length; i++) {
        checkPageBreak(12);
        page.drawText(valueLines[i], {
          x: MARGIN + labelWidth,
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
  if (data.education.length > 0) {
    drawSectionTitle("EDUCATION");
    for (const edu of data.education) {
      checkPageBreak(25);
      const instText = edu.institution || "Institusi";
      const yearText = `${edu.year}${edu.location ? ` | ${edu.location}` : ""}`;

      page.drawText(instText, {
        x: MARGIN,
        y: y - 9,
        size: 9.5,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      const yearWidth = fontRegular.widthOfTextAtSize(yearText, 8.5);
      page.drawText(yearText, {
        x: PAGE_WIDTH - MARGIN - yearWidth,
        y: y - 9,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 12;

      const degreeText = edu.degree + (edu.details ? ` (${edu.details})` : "");
      page.drawText(degreeText, {
        x: MARGIN,
        y: y - 8.5,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 14;
    }
    y -= 4;
  }

  // 6. Projects
  if (data.projects.length > 0) {
    drawSectionTitle("KEY PROJECTS");
    for (const proj of data.projects) {
      checkPageBreak(25);
      const projTitle = proj.name + (proj.techStack ? ` (${proj.techStack})` : "");
      page.drawText(projTitle, {
        x: MARGIN,
        y: y - 9,
        size: 9,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      if (proj.link) {
        const linkWidth = fontRegular.widthOfTextAtSize(proj.link, 8);
        page.drawText(proj.link, {
          x: PAGE_WIDTH - MARGIN - linkWidth,
          y: y - 9,
          size: 8,
          font: fontItalic,
          color: rgb(0.4, 0.4, 0.4),
        });
      }
      y -= 12;

      if (proj.description) {
        const descLines = wrapText(proj.description, CONTENT_WIDTH, 8.5, fontRegular);
        for (const line of descLines) {
          checkPageBreak(12);
          page.drawText(line, {
            x: MARGIN,
            y: y - 8.5,
            size: 8.5,
            font: fontRegular,
            color: rgb(0.2, 0.2, 0.2),
          });
          y -= 11.5;
        }
      }
      y -= 4;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
}
