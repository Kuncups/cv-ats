export const SITE_CONFIG = {
  name: "Draft CV",
  shortName: "Draft CV",
  tagline: "ATS RESUME SCANNER & BUILDER",
  description:
    "Scan match score CV vs lowongan kerja via AI. Bangun resume standar ATS 1-kolom 100% terbaca sistem HRD.",
  url: "https://draftcv.pages.dev",
  version: "2024.11.0",
  year: "2024 -> 2026",
  security: {
    maxFileSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["application/pdf"] as const,
    magicBytesPdf: [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
    rateLimitMaxRequests: 10,
    rateLimitWindowSec: 60,
  },
  theme: {
    acidYellow: "#FFF000",
    jetBlack: "#000000",
    pureWhite: "#FFFFFF",
  },
  navigation: [
    { label: "SCANNER", href: "/analyzer" },
    { label: "BUILDER", href: "/builder" },
    { label: "STANDAR ATS", href: "/#standard" },
    { label: "FAQ", href: "/#faq" },
  ],
  sampleJobs: [
    {
      title: "Senior Fullstack Engineer",
      company: "Tech Corp",
      text: `Looking for a Senior Fullstack Engineer proficient in TypeScript, React, Next.js, Node.js, and PostgreSQL. 
Requirements:
- 4+ years building high-scale web applications with Next.js and React.
- Strong proficiency in TypeScript, Tailwind CSS, and REST/GraphQL APIs.
- Deep experience with PostgreSQL, Drizzle ORM or Prisma, and Redis caching.
- Familiarity with Cloudflare Workers, Docker, CI/CD, and AWS infrastructure.
- Demonstrated experience improving page performance, Core Web Vitals, and system reliability.
- Excellent communication and technical leadership skills.`,
    },
    {
      title: "Frontend Developer (React / Next.js)",
      company: "Digital Studio",
      text: `We are hiring a Frontend Developer to craft pixel-perfect, accessible user interfaces.
Requirements:
- Proven experience with React, Next.js (App Router), TypeScript, and Tailwind CSS.
- Expertise in responsive web design, semantic HTML5, and web performance optimization.
- Experience with state management (Zustand, React Query/TanStack Query).
- Understanding of Web Accessibility (WCAG 2.1) and cross-browser compatibility.
- Unit and integration testing with Vitest or Playwright.`,
    },
    {
      title: "Product Manager (Technical)",
      company: "Fintech Venture",
      text: `Seeking a Technical Product Manager to lead product discovery and execution for our core payments platform.
Requirements:
- 3+ years experience as PM in fintech, SaaS, or high-growth tech startup.
- Data-driven mindset: proficient in SQL, amplitude, analytics, and A/B testing frameworks.
- Deep understanding of payment gateways, API integrations, and checkout conversion funnel.
- Strong stakeholder management and agile sprint planning leadership.`,
    },
  ],
} as const;
