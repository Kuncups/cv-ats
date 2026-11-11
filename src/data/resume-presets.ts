import { ResumeData } from "@/types/resume";

export const SAMPLE_ADMIN_HR: ResumeData = {
  language: "id",
  personal: {
    fullName: "SITI NURHALIZA, S.M.",
    jobTitle: "Human Resources & Administration Specialist",
    email: "siti.nurhaliza@email.com",
    phone: "081234567890",
    location: "Jakarta Selatan, DKI Jakarta",
    linkedin: "linkedin.com/in/sitinurhaliza",
    github: "",
    website: "",
  },
  summary:
    "Profesional Human Resources dan Administrasi Perkantoran berpengalaman lebih dari 4 tahun dalam pengelolaan administrasi personalia, proses rekrutmen end-to-end, dan manajemen operasional kantor. Terbukti sukses memangkas waktu proses rekrutmen hingga 35% dan meningkatkan akurasi data kehadiran karyawan sebesar 98% melalui implementasi digitalisasi SOP administrasi perkantoran.",
  experience: [
    {
      id: "exp-1",
      role: "Senior HR & General Affair Officer",
      company: "PT Prima Nusantara Abadi",
      location: "Jakarta, Indonesia",
      startDate: "Jan 2023",
      endDate: "Sekarang",
      isCurrent: true,
      bullets: [
        "Memimpin operasional HR & General Affair untuk 150+ karyawan, mencakup administrasi payroll, BPJS Ketenagakerjaan & Kesehatan, serta manajemen inventaris kantor.",
        "Mengelola proses rekrutmen end-to-end (sourcing, screening CV ATS, wawancara kerja, dan onboarding) dengan rata-rata time-to-hire 21 hari.",
        "Merancang dan memperbarui 12 Standard Operating Procedure (SOP) divisi personalia yang meningkatkan efisiensi alur kerja sebesar 25%.",
        "Menyelesaikan evaluasi kinerja berkala (KPI) seluruh divisi dengan tingkat penyelesaian 100% tepat waktu.",
      ],
    },
    {
      id: "exp-2",
      role: "Staff Administrasi & Operasional",
      company: "PT Mitra Sejahtera Logistik",
      location: "Tangerang, Banten",
      startDate: "Agu 2020",
      endDate: "Des 2022",
      isCurrent: false,
      bullets: [
        "Mengelola pencatatan dokumen operasional harian, surat-menyurat resmi perusahaan, dan pengarsipan digital 500+ berkas per bulan.",
        "Melakukan rekonsiliasi klaim pengeluaran operasional (petty cash) dan verifikasi invoice dengan akurasi 99.8%.",
        "Berkoordinasi dengan vendor eksternal terkait pengadaan fasilitas kantor dan perawatan aset gedung.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Universitas Indonesia",
      degree: "Sarjana Manajemen (S.M.)",
      location: "Depok, Indonesia",
      year: "2016 - 2020",
      details: "IPK 3.72 / 4.00, Konsentrasi Manajemen SDM",
    },
  ],
  skills: {
    technical:
      "Manajemen Personalia (HRIS), Rekrutmen & Sourcing, Pengelolaan Payroll, Regulasi Ketenagakerjaan (UU Cipta Kerja), Administrasi Kantor & Pengarsipan",
    tools:
      "Microsoft Excel (VLOOKUP, Pivot Table), Google Workspace, SAP HR, Talenta / Mekari, Trello, Canva",
    soft: "Komunikasi Interpersonal, Negosiasi, Manajemen Waktu, Problem Solving, Kepemimpinan Tim",
  },
  projects: [
    {
      id: "proj-1",
      name: "Digitalisasi Sistem Database Kepegawaian",
      link: "PT Prima Nusantara Abadi",
      techStack: "Project Lead",
      description:
        "Memimpin migrasi 150+ berkas fisik karyawan ke sistem arsip digital cloud, menghemat waktu pencarian dokumen hingga 60%.",
    },
    {
      id: "proj-2",
      name: "Program Employee Engagement & Gathering Tahunan",
      link: "Panitia Pelaksana",
      techStack: "Ketua Koordinator",
      description:
        "Mengoordinasikan acara gathering dan pelatihan 150 karyawan dengan anggaran efisien dan kepuasan peserta mencapai 94%.",
    },
  ],
  customProjectTitle: "Pengalaman Organisasi & Proyek",
};

export const SAMPLE_MARKETING: ResumeData = {
  language: "id",
  personal: {
    fullName: "BUDI PRATAMA, S.I.Kom.",
    jobTitle: "Digital Marketing & Brand Specialist",
    email: "budi.pratama@email.com",
    phone: "081398765432",
    location: "Jakarta Barat, DKI Jakarta",
    linkedin: "linkedin.com/in/budipratama",
    github: "",
    website: "budipratama-portfolio.com",
  },
  summary:
    "Spesialis Pemasaran Digital dan Komunikasi Kreatif dengan pengalaman 3+ tahun mengelola kampanye multi-channel di industri retail dan FMCG. Berhasil menaikkan pendapatan penjualan online sebesar 45% YoY dan ROI iklan berbayar (ROAS 4.2x) melalui optimasi paid ads, strategi content marketing, dan SEO data-driven.",
  experience: [
    {
      id: "exp-1",
      role: "Digital Marketing Specialist",
      company: "PT Global Retail Indonesia",
      location: "Jakarta, Indonesia",
      startDate: "Mar 2022",
      endDate: "Sekarang",
      isCurrent: true,
      bullets: [
        "Mengelola anggaran iklan Meta Ads dan Google Ads sebesar Rp120 juta/bulan dengan return on ad spend (ROAS) rata-rata 4.2x.",
        "Meningkatkan organic traffic website sebesar 80% dalam 12 bulan melalui optimasi strategi SEO on-page dan artikel pilar.",
        "Memimpin tim kreatif dalam produksi 40+ konten media sosial per bulan yang menaikkan followers sebesar 120k.",
      ],
    },
    {
      id: "exp-2",
      role: "Marketing & Content Associate",
      company: "PT Media Kreasi Kreatif",
      location: "Bandung, Jawa Barat",
      startDate: "Jul 2020",
      endDate: "Feb 2022",
      isCurrent: false,
      bullets: [
        "Menyusun copy dan editorial plan untuk kampanye brand awareness 8 klien korporat dengan tingkat engagement di atas benchmark (3.8%).",
        "Menginisiasi kampanye email newsletter mingguan dengan open rate rata-rata 28% dan CTR 4.5%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Universitas Padjadjaran",
      degree: "Sarjana Ilmu Komunikasi (S.I.Kom.)",
      location: "Bandung, Indonesia",
      year: "2016 - 2020",
      details: "IPK 3.65 / 4.00, Jurusan Hubungan Masyarakat",
    },
  ],
  skills: {
    technical:
      "Social Media Strategy, Search Engine Optimization (SEO/SEM), Paid Ads (Meta & Google), Copywriting, Email Marketing, Analisis Riset Pasar",
    tools:
      "Google Analytics 4, Meta Ads Manager, TikTok Ads, Ahrefs, SEMrush, Canva, Mailchimp, WordPress",
    soft: "Pemikiran Kreatif, Analisis Data, Negosiasi Klien, Presentasi Publik, Manajemen Kampanye",
  },
  projects: [
    {
      id: "proj-1",
      name: "Peluncuran Produk Seasonal Ramadhan Campaign",
      link: "PT Global Retail Indonesia",
      techStack: "Campaign Lead",
      description:
        "Menghasilkan penjualan kotor Rp1.8 Miliar dalam 30 hari melalui integrasi influencer endorsement dan kampanye konten viral.",
    },
  ],
  customProjectTitle: "Pengalaman Proyek & Kampanye",
};

export const SAMPLE_FINANCE: ResumeData = {
  language: "id",
  personal: {
    fullName: "DIAN LESTARI, S.Ak.",
    jobTitle: "Finance & Accounting Staff",
    email: "dian.lestari@email.com",
    phone: "082155567890",
    location: "Surabaya, Jawa Timur",
    linkedin: "linkedin.com/in/dianlestari",
    github: "",
    website: "",
  },
  summary:
    "Lulusan Akuntansi dengan pengalaman 3+ tahun dalam penyusunan laporan keuangan komprehensif, rekonsiliasi kas/bank, dan kepatuhan perpajakan (PPh 21, 23, Final, dan PPN). Teliti, memiliki sertifikasi Brevet Pajak A & B, serta terbiasa mengolah ribuan transaksi harian menggunakan software akuntansi modern.",
  experience: [
    {
      id: "exp-1",
      role: "Accounting & Tax Staff",
      company: "PT Surya Abadi Makmur",
      location: "Surabaya, Jawa Timur",
      startDate: "Feb 2022",
      endDate: "Sekarang",
      isCurrent: true,
      bullets: [
        "Menyusun laporan keuangan bulanan (Neraca, Laba Rugi, Arus Kas) tepat waktu untuk audit internal dan eksternal tahunan.",
        "Menghitung dan melaporkan SPT Masa PPN dan PPh Pasal 21, 23, dan 4 ayat 2 menggunakan aplikasi e-Faktur dan e-Bupot.",
        "Melakukan rekonsiliasi 4 rekening bank korporat setiap akhir bulan dengan selisih nihil.",
      ],
    },
    {
      id: "exp-2",
      role: "Junior Finance Staff",
      company: "CV Berkat Mulia Mandiri",
      location: "Surabaya, Jawa Timur",
      startDate: "Agu 2020",
      endDate: "Jan 2022",
      isCurrent: false,
      bullets: [
        "Memproses verifikasi invoice vendor dan pembuatan faktur tagihan pelanggan rata-rata 200 faktur per bulan.",
        "Mengelola pencatatan kas kecil (petty cash) dan verifikasi bukti transaksi pendukung operasional kantor.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Universitas Airlangga",
      degree: "Sarjana Akuntansi (S.Ak.)",
      location: "Surabaya, Indonesia",
      year: "2016 - 2020",
      details: "IPK 3.80 / 4.00, Sertifikasi Brevet Pajak A & B",
    },
  ],
  skills: {
    technical:
      "Penyusunan Laporan Keuangan (PSAK), Perpajakan (PPh 21/23/PPN), Rekonsiliasi Bank, Audit Internal, Manajemen Kas Kecil (Petty Cash)",
    tools:
      "Accurate Accounting Software, SAP Finance, Microsoft Excel (VLOOKUP, Pivot Table), e-Faktur, e-Bupot",
    soft: "Ketelitian Tinggi, Integritas Finansial, Berpikir Analitis, Manajemen Waktu, Komunikasi Kerja",
  },
  projects: [
    {
      id: "proj-1",
      name: "Implementasi Sistem Akuntansi Digital Accurate Online",
      link: "PT Surya Abadi Makmur",
      techStack: "Finance Team Lead",
      description:
        "Memigrasikan pencatatan jurnal manual berbasis spreadsheet ke Accurate Online, meningkatkan kecepatan tutup buku dari 10 hari menjadi 4 hari kerja.",
    },
  ],
  customProjectTitle: "Proyek & Sertifikasi",
};

export const SAMPLE_TECH: ResumeData = {
  language: "id",
  personal: {
    fullName: "DIMAS ARYA PRATAMA, S.Kom.",
    jobTitle: "Senior Software Engineer",
    email: "dimas.aryapratama@email.com",
    phone: "081234567890",
    location: "Jakarta Selatan, DKI Jakarta",
    linkedin: "linkedin.com/in/dimasaryapratama",
    github: "github.com/dimasaryadev",
    website: "dimasarya.dev",
  },
  summary:
    "Senior Software Engineer berpengalaman 4+ tahun dalam perancangan arsitektur sistem web skalabel, microservices backend, dan integrasi cloud. Terbukti sukses memangkas latensi API hingga 45% dan menangani transaksi volume tinggi hingga 100k+ request/menit menggunakan TypeScript, React, Next.js, Node.js (NestJS), PostgreSQL, dan Docker.",
  experience: [
    {
      id: "exp-1",
      role: "Senior Full Stack Engineer",
      company: "PT Inovasi Teknologi Digital",
      location: "Jakarta, Indonesia",
      startDate: "Jan 2023",
      endDate: "Sekarang",
      isCurrent: true,
      bullets: [
        "Memimpin perancangan ulang arsitektur monolitik ke microservices menggunakan NestJS, TypeScript, dan Docker, meningkatkan keandalan sistem hingga 99.9% uptime.",
        "Mengembangkan antarmuka frontend berbasis Next.js dan Tailwind CSS dengan skor Core Web Vitals 95+ untuk 300k+ pengguna aktif bulanan.",
        "Mengoptimalkan kueri PostgreSQL dan Redis caching, mengurangi waktu respons database dari 280ms menjadi 65ms pada jam sibuk.",
        "Membangun automated CI/CD pipeline dengan GitHub Actions dan Kubernetes, mempercepat siklus deployment dari mingguan menjadi harian.",
      ],
    },
    {
      id: "exp-2",
      role: "Software Engineer",
      company: "PT Solusi Cloud Nusantara",
      location: "Bandung, Jawa Barat",
      startDate: "Agu 2020",
      endDate: "Des 2022",
      isCurrent: false,
      bullets: [
        "Mengembangkan RESTful dan GraphQL API untuk modul e-commerce terintegrasi payment gateway (QRIS, Virtual Account) dengan keberhasilan transaksi 99.8%.",
        "Menulis 150+ unit dan integration test menggunakan Jest dan Supertest, mempertahankan test coverage di atas 85%.",
        "Berkolaborasi dalam tim Agile lintas fungsi (Product, UI/UX, QA) dalam sprint 2 mingguan untuk meluncurkan 8 modul fitur tepat waktu.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "Institut Teknologi Bandung",
      degree: "Sarjana Teknik Informatika (S.Kom.)",
      location: "Bandung, Indonesia",
      year: "2016 - 2020",
      details: "IPK 3.82 / 4.00, Konsentrasi Rekayasa Perangkat Lunak",
    },
  ],
  skills: {
    technical:
      "TypeScript, JavaScript, Go, React, Next.js, Node.js (NestJS/Express), PostgreSQL, Redis, RESTful API, GraphQL",
    tools:
      "Docker, Kubernetes, Git, GitHub Actions, AWS (EC2, S3), Linux, Tailwind CSS, Jest, Postman",
    soft: "System Architecture, Problem Solving, Agile Scrum, Code Review, Komunikasi Tim Lintas Fungsi",
  },
  projects: [
    {
      id: "proj-1",
      name: "Distributed Task Queue Engine",
      techStack: "Go, Redis, Docker, gRPC",
      link: "github.com/dimasaryadev/task-queue",
      description:
        "Merancang message broker asynchronous berkinerja tinggi yang mampu memproses hingga 50.000 job/detik dengan mekanisme retry adaptif dan zero-loss queue.",
    },
    {
      id: "proj-2",
      name: "Enterprise E-Commerce Microservices",
      techStack: "Next.js, NestJS, PostgreSQL, RabbitMQ",
      link: "github.com/dimasaryadev/ecommerce-core",
      description:
        "Membangun sistem e-commerce berbasis modular microservices dengan katalog produk dinamis, keranjang belanja real-time, dan webhook pembayaran otomatis.",
    },
  ],
  customProjectTitle: "Pengalaman Proyek & Open Source",
};

export const RESUME_PRESETS: Array<{ id: string; label: string; field: string; data: ResumeData }> = [
  { id: "admin-hr", label: "Administrasi & HR", field: "Umum & Perkantoran", data: SAMPLE_ADMIN_HR },
  { id: "marketing", label: "Marketing & Sales", field: "Pemasaran & Bisnis", data: SAMPLE_MARKETING },
  { id: "finance", label: "Keuangan & Akuntansi", field: "Finansial & Pajak", data: SAMPLE_FINANCE },
  { id: "tech", label: "Teknologi & IT", field: "Software & Sistem", data: SAMPLE_TECH },
];

export const DEFAULT_SAMPLE_RESUME: ResumeData = SAMPLE_ADMIN_HR;

export const EMPTY_RESUME: ResumeData = {
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
