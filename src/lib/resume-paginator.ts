import { ResumeData } from "@/types/resume";

export interface ResumePageContent {
  pageNumber: number;
  hasHeader: boolean;
  summary?: string;
  experience: ResumeData["experience"];
  skills?: ResumeData["skills"];
  education: ResumeData["education"];
  projects: ResumeData["projects"];
}

/**
 * Paginates resume sections based on A4 visual budget units (~115 units per page).
 */
export function paginateResume(data: ResumeData, budgetPerPage = 115): ResumePageContent[] {
  const pages: ResumePageContent[] = [
    {
      pageNumber: 1,
      hasHeader: true,
      experience: [],
      education: [],
      projects: [],
    },
  ];

  let currentPage = pages[0];
  let currentBudget = 10; // Header weight

  const checkNextPage = (cost: number) => {
    if (currentBudget + cost > budgetPerPage) {
      currentPage = {
        pageNumber: pages.length + 1,
        hasHeader: false,
        experience: [],
        education: [],
        projects: [],
      };
      pages.push(currentPage);
      currentBudget = 8; // Top margin allowance on subsequent pages
    }
    currentBudget += cost;
  };

  // 1. Summary
  if (data.summary) {
    const summaryLines = Math.ceil(data.summary.length / 95);
    const cost = Math.min(20, 6 + summaryLines * 2.0);
    checkNextPage(cost);
    currentPage.summary = data.summary;
  }

  // 2. Experience (Pengalaman Kerja)
  if (data.experience && data.experience.length > 0) {
    for (const exp of data.experience) {
      const bulletCount = exp.bullets ? exp.bullets.filter(Boolean).length : 0;
      const cost = 6.5 + bulletCount * 2.3;
      checkNextPage(cost);
      currentPage.experience.push(exp);
    }
  }

  // 3. Education (Jenjang Pendidikan)
  if (data.education && data.education.length > 0) {
    for (const edu of data.education) {
      checkNextPage(8);
      currentPage.education.push(edu);
    }
  }

  // 4. Projects / Organisations (Pengalaman Organisasi)
  if (data.projects && data.projects.length > 0) {
    for (const proj of data.projects) {
      checkNextPage(13);
      currentPage.projects.push(proj);
    }
  }

  // 5. Skills (Keterampilan, Prestasi & Pengalaman Lain)
  const hasSkills = Boolean(
    data.skills?.technical || data.skills?.tools || data.skills?.soft
  );
  if (hasSkills) {
    checkNextPage(14);
    currentPage.skills = data.skills;
  }

  return pages;
}
