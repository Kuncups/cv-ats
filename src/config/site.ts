export const SITE_CONFIG = {
  name: "Draft CV",
  shortName: "Draft CV",
  tagline: "Bantu Rapikan CV & Tingkatkan Peluang Kerja",
  description:
    "Bantu merapikan format dan struktur CV Anda agar sesuai standar ATS, terbaca sempurna oleh recruiter, dan meningkatkan peluang lolos panggilan kerja.",
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
    primary: "#1D4ED8",
    swissBlue: "#1D4ED8",
    swissBlueHover: "#2563EB",
    jetBlack: "#000000",
    pureWhite: "#FFFFFF",
  },
  navigation: [
    { label: "CEK SKOR CV", href: "/analyzer" },
    { label: "BUAT CV BARU", href: "/builder" },
    { label: "PANDUAN ATS", href: "/#standard" },
    { label: "TANYA JAWAB", href: "/#faq" },
  ],
  sampleJobs: [
    {
      title: "Human Resources & Administration Staff",
      shortTitle: "HR & Administrasi",
      company: "PT Prima Solusi Nusantara",
      text: `Dibutuhkan Staff Human Resources & Administrasi Perkantoran untuk mengelola operasional personalia harian.
Kualifikasi & Tanggung Jawab:
- Pengalaman minimal 1-3 tahun di bidang administrasi HR / General Affair / Operasional Perkantoran.
- Menguasai administrasi personalia, pengelolaan absensi karyawan, cuti, dan pengarsipan dokumen kerja.
- Terbiasa membantu proses rekrutmen: sourcing kandidat, screening CV, penjadwalan interview, dan onboarding.
- Mahir mengoperasikan Microsoft Office (terutama Excel untuk rekapitulasi data) dan Google Workspace.
- Memiliki kemampuan komunikasi yang baik, teliti, terorganisir, dan menjaga kerahasiaan data perusahaan.`,
    },
    {
      title: "Digital Marketing & Social Media Specialist",
      shortTitle: "Marketing & Medsos",
      company: "PT Global Retail Kreatif",
      text: `Mencari Digital Marketing Specialist untuk merancang dan mengeksekusi strategi pemasaran multi-channel.
Kualifikasi & Tanggung Jawab:
- Pengalaman 2+ tahun dalam digital marketing, pengelolaan media sosial, atau brand campaign.
- Terbiasa mengelola iklan berbayar (Meta Ads, TikTok Ads, atau Google Ads) dengan optimasi budget dan ROAS.
- Memahami konsep Search Engine Optimization (SEO/SEM), content marketing, dan riset kata kunci.
- Kemampuan copywriting yang persuasif, perencanaan kalender konten, dan analisis performa metrik (Google Analytics / Meta Business Suite).
- Kreatif, adaptif terhadap tren media sosial terkini, dan mampu bekerja sama dengan tim kreatif.`,
    },
    {
      title: "Staff Akuntansi & Perpajakan (Accounting & Tax)",
      shortTitle: "Akuntansi & Pajak",
      company: "PT Surya Abadi Mandiri",
      text: `Dibutuhkan Staff Akuntansi & Perpajakan yang teliti untuk menyusun laporan keuangan dan kepatuhan pajak perusahaan.
Kualifikasi & Tanggung Jawab:
- Lulusan D3/S1 Akuntansi atau Manajemen Keuangan dengan pengalaman 1-3 tahun di bidang terkait.
- Menguasai penyusunan jurnal umum, buku besar, neraca saldo, dan laporan laba rugi.
- Memahami regulasi perpajakan Indonesia (PPh 21, PPh 23, PPN) dan operasional aplikasi e-Faktur / e-Bupot.
- Terbiasa melakukan rekonsiliasi bank dan verifikasi invoice vendor secara teliti.
- Mahir Microsoft Excel (VLOOKUP, HLOOKUP, Pivot Table) dan memiliki nilai tambah jika menguasai software akuntansi (Accurate / SAP).`,
    },
    {
      title: "Software Engineer / Web Developer",
      shortTitle: "Software & IT",
      company: "Tech Nusantara Studio",
      text: `Looking for a Software Engineer proficient in modern web technologies to build responsive and scalable applications.
Requirements:
- 2+ years experience building web applications using JavaScript/TypeScript, React, Next.js, and Node.js.
- Solid understanding of REST APIs, database design (PostgreSQL/MySQL), and responsive UI styling (Tailwind CSS).
- Familiarity with version control (Git), deployment workflows, and clean code practices.
- Strong analytical mindset, problem-solving skills, and proactive communication.`,
    },
  ],
} as const;
