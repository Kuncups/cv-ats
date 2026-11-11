import { ResumeData } from "@/types/resume";

const SECTION_HEADERS = {
  summary: /^(?:(?:professional\s+)?(?:summary|ringkasan|profile|profil|about(?:\s+me)?|tentang(?:\s+saya)?))$/i,
  experience: /^(?:(?:work\s+)?(?:experience|experiences)|pengalaman(?:\s+kerja)?|employment(?:\s+history)?|riwayat\s+pekerjaan)$/i,
  skills: /^(?:(?:technical\s*(?:&|and)?\s*(?:core\s*)?|core\s+)?(?:skills|keahlian|kompetensi|keahlian\s+utama|technologies|tech\s+stack))$/i,
  education: /^(?:education|pendidikan|riwayat\s+pendidikan|academic(?:\s+background)?)$/i,
  projects: /^(?:(?:key\s+)?(?:projects|proyek)|portofolio|portfolio)$/i,
};

type SectionKey = keyof typeof SECTION_HEADERS;

export function parseResumeFromText(rawText: string): ResumeData {
  const clean = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = clean
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const result: ResumeData = {
    language: "id",
    personal: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: { technical: "", tools: "", soft: "" },
    projects: [],
  };

  // 1. Extract global contact info using regex
  const fullText = lines.join(" ");

  const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) result.personal.email = emailMatch[0];

  const phoneMatch = fullText.match(/(?:\+?62|08)[0-9\s-]{8,15}/) || fullText.match(/(?:\+\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,5}/);
  if (phoneMatch) result.personal.phone = phoneMatch[0].trim();

  const linkedinMatch = fullText.match(/(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    result.personal.linkedin = linkedinMatch[0].includes("linkedin.com")
      ? linkedinMatch[0]
      : `linkedin.com/in/${linkedinMatch[1]}`;
  }

  const githubMatch = fullText.match(/(?:github\.com\/|github:\s*)([a-zA-Z0-9_-]+)/i);
  if (githubMatch) {
    result.personal.github = githubMatch[0].includes("github.com")
      ? githubMatch[0]
      : `github.com/${githubMatch[1]}`;
  }

  // 2. Identify candidate name and title from top lines (before first section header)
  const headerLines: string[] = [];
  let currentSection: SectionKey | null = null;
  const sectionContent: Record<SectionKey, string[]> = {
    summary: [],
    experience: [],
    skills: [],
    education: [],
    projects: [],
  };

  for (const line of lines) {
    // Check if line matches a known section header
    let matchedKey: SectionKey | null = null;
    const stripped = line.replace(/^[#*-]\s*/, "").replace(/[:\-_]+$/, "").trim();

    for (const [key, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(stripped)) {
        matchedKey = key as SectionKey;
        break;
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
      continue;
    }

    if (!currentSection) {
      // Still in header area
      headerLines.push(line);
    } else {
      sectionContent[currentSection].push(line);
    }
  }

  // Parse header lines for Name & Job Title
  const candidateNameLines = headerLines.filter((l) => {
    // Skip lines that are purely contact details
    if (l.includes("@")) return false;
    if (/(?:phone|telp|wa|linkedin|github|http)/i.test(l)) return false;
    if (/^[+0-9\s-()]+$/.test(l)) return false;
    return true;
  });

  if (candidateNameLines.length > 0) {
    result.personal.fullName = candidateNameLines[0].replace(/^[A-Z\s]+:/, "").trim();
  }
  if (candidateNameLines.length > 1) {
    result.personal.jobTitle = candidateNameLines[1].trim();
  }

  // Try to find location in header lines
  const locLine = headerLines.find((l) =>
    /(?:jakarta|bandung|surabaya|yogyakarta|indonesia|remote|bali|semarang|bogor|tangerang|bekasi)/i.test(l)
  );
  if (locLine && !locLine.includes("@")) {
    const parts = locLine.split(/[|•,-]/);
    const candidateLoc = parts.find((p) =>
      /(?:jakarta|bandung|surabaya|yogyakarta|indonesia|remote|bali|semarang|bogor|tangerang|bekasi)/i.test(p)
    );
    if (candidateLoc) result.personal.location = candidateLoc.trim();
  }

  // 3. Parse Summary Section
  if (sectionContent.summary.length > 0) {
    result.summary = sectionContent.summary.join(" ").replace(/\s+/g, " ").trim();
  }

  // 4. Parse Skills Section
  if (sectionContent.skills.length > 0) {
    const rawSkills = sectionContent.skills.join(" ");
    result.skills.technical = rawSkills
      .replace(/languages?\s*&?\s*frameworks?:?/i, "")
      .replace(/tools?\s*&?\s*infrastructure?:?/i, "")
      .trim();
  }

  // 5. Parse Experience Section
  if (sectionContent.experience.length > 0) {
    const expLines = sectionContent.experience;
    let currentExp: {
      id: string;
      role: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      isCurrent: boolean;
      bullets: string[];
    } | null = null;

    for (const line of expLines) {
      const isBullet = /^[•\-*]/.test(line);
      const cleanLine = line.replace(/^[•\-*]\s*/, "").trim();

      // Check if this looks like a date line or company/role line
      const hasDate = /(?:20\d\d|19\d\d|\b(?:jan|feb|mar|apr|may|mei|jun|jul|aug|agu|sep|oct|okt|nov|dec|des)\b|present|sekarang)/i.test(line);

      if (!isBullet && (hasDate || line.includes("—") || line.includes(" - ") || line.includes(" | "))) {
        // Likely a new experience entry header
        if (currentExp) {
          result.experience.push(currentExp);
        }

        const parts = line.split(/[—|]|\s-\s/);
        const role = parts[0]?.trim() || "Posisi";
        const company = parts[1]?.trim() || "Perusahaan";

        currentExp = {
          id: `exp-${Date.now()}-${result.experience.length}`,
          role,
          company,
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: /present|sekarang/i.test(line),
          bullets: [],
        };
      } else if (currentExp) {
        if (cleanLine) currentExp.bullets.push(cleanLine);
      } else {
        // First entry fallback
        currentExp = {
          id: `exp-${Date.now()}-0`,
          role: cleanLine,
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          isCurrent: false,
          bullets: [],
        };
      }
    }
    if (currentExp) {
      result.experience.push(currentExp);
    }
  }

  // 6. Parse Education Section
  if (sectionContent.education.length > 0) {
    const eduLines = sectionContent.education;
    let currentEdu: {
      id: string;
      degree: string;
      institution: string;
      year: string;
      location: string;
      details: string;
    } | null = null;

    for (const line of eduLines) {
      const cleanLine = line.replace(/^[•\-*]\s*/, "").trim();
      const isDegree = /(?:sarjana|bachelor|magister|master|diploma|s1|s2|d3|sma|smk|universitas|institut|polytechnic|politeknik|college)/i.test(cleanLine);

      if (isDegree || !currentEdu) {
        if (currentEdu) result.education.push(currentEdu);
        currentEdu = {
          id: `edu-${Date.now()}-${result.education.length}`,
          institution: cleanLine,
          degree: "",
          year: "",
          location: "",
          details: "",
        };
      } else if (currentEdu) {
        if (/(?:20\d\d|19\d\d)/.test(cleanLine) && !currentEdu.year) {
          currentEdu.year = cleanLine;
        } else if (!currentEdu.degree) {
          currentEdu.degree = cleanLine;
        } else {
          currentEdu.details = (currentEdu.details ? `${currentEdu.details} • ` : "") + cleanLine;
        }
      }
    }
    if (currentEdu) result.education.push(currentEdu);
  }

  // 7. Parse Projects Section
  if (sectionContent.projects.length > 0) {
    const projLines = sectionContent.projects;
    let currentProj: {
      id: string;
      name: string;
      description: string;
      techStack: string;
      link: string;
    } | null = null;

    for (const line of projLines) {
      const cleanLine = line.replace(/^[•\-*]\s*/, "").trim();
      if (!currentProj) {
        currentProj = {
          id: `proj-${Date.now()}-0`,
          name: cleanLine,
          description: "",
          techStack: "",
          link: "",
        };
      } else if (!currentProj.description) {
        currentProj.description = cleanLine;
      } else {
        result.projects.push(currentProj);
        currentProj = {
          id: `proj-${Date.now()}-${result.projects.length}`,
          name: cleanLine,
          description: "",
          techStack: "",
          link: "",
        };
      }
    }
    if (currentProj) result.projects.push(currentProj);
  }

  return result;
}
