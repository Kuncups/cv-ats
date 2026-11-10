import { ResumeData } from "@/app/builder/page";

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
 * Paginates resume sections based on A4 visual budget units (~105 units per page).
 */
export function paginateResume(data: ResumeData, budgetPerPage = 105): ResumePageContent[] {
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
  let currentBudget = 16; // Header weight

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
      currentBudget = 10; // Top margin allowance on subsequent pages
    }
    currentBudget += cost;
  };

  // 1. Summary
  if (data.summary) {
    const summaryLines = Math.ceil(data.summary.length / 85);
    const cost = Math.min(24, 8 + summaryLines * 3);
    checkNextPage(cost);
    currentPage.summary = data.summary;
  }

  // 2. Experience
  if (data.experience && data.experience.length > 0) {
    for (const exp of data.experience) {
      const bulletCount = exp.bullets ? exp.bullets.filter(Boolean).length : 0;
      const cost = 9 + bulletCount * 3.5;
      checkNextPage(cost);
      currentPage.experience.push(exp);
    }
  }

  // 3. Skills
  const hasSkills = Boolean(
    data.skills?.technical || data.skills?.tools || data.skills?.soft
  );
  if (hasSkills) {
    checkNextPage(13);
    currentPage.skills = data.skills;
  }

  // 4. Education
  if (data.education && data.education.length > 0) {
    for (const edu of data.education) {
      checkNextPage(9);
      currentPage.education.push(edu);
    }
  }

  // 5. Projects
  if (data.projects && data.projects.length > 0) {
    for (const proj of data.projects) {
      checkNextPage(9);
      currentPage.projects.push(proj);
    }
  }

  return pages;
}
