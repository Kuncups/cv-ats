export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year?: string;
  startDate?: string;
  endDate?: string;
  details: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  techStack: string;
  link: string;
  description: string;
}

export interface ResumeData {
  language?: "id" | "en";
  personal: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
  };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: {
    technical: string;
    tools: string;
    soft: string;
  };
  projects: ProjectItem[];
  customProjectTitle?: string;
}
