import { sanitizeText } from "@/lib/security";

export interface SentenceSuggestion {
  id: string;
  category: "efisiensi" | "skala" | "lugas";
  title: string;
  sentence: string;
  reason: string;
}

export interface SuggestionOptions {
  text: string;
  role?: string;
  company?: string;
  language?: "id" | "en";
}

/**
 * Strips conversational and informal filler phrases.
 */
function cleanInformalDraft(raw: string, isEn: boolean): string {
  let cleaned = raw.trim();

  if (isEn) {
    const fillerRegexEn =
      /^(i\s+was\s+responsible\s+for|i\s+was|responsible\s+for|my\s+role\s+was\s+to|i\s+helped\s+to|helped\s+with|assisted\s+in|worked\s+on|did|handled|my\s+job\s+was\s+to|i\s+have|i)\s+/i;
    while (fillerRegexEn.test(cleaned)) {
      cleaned = cleaned.replace(fillerRegexEn, "").trim();
    }
    return cleaned;
  }

  const fillerRegexId =
    /^(tugas\s+saya\s+adalah|pekerjaan\s+saya\s+adalah|tanggung\s+jawab\s+saya|bertanggung\s+jawab\s+(atas|untuk)?|tugas\s+saya|tugas\s+kami|pekerjaan\s+saya|ikut\s+serta|ikut|membantu|bantu|ngurus|mengurus|bikin|membuat|mengerjakan|handle|menangani|melakukan|jaga|menjaga|nunggu|pernah|saya|aku)\s+/i;
  while (fillerRegexId.test(cleaned)) {
    cleaned = cleaned.replace(fillerRegexId, "").trim();
  }
  return cleaned;
}

/**
 * Replaces colloquial Indonesian phrases with standard ATS professional vocabulary.
 */
function elevateIndonesianDraft(text: string): string {
  return text
    .replace(/\b(bikin|buat)\s+web\b/gi, "mengembangkan aplikasi web responsif")
    .replace(/\b(bikin|buat)\s+desain\b/gi, "merancang materi visual promosi")
    .replace(/\b(bikin|buat)\s+konten\b/gi, "memproduksi konten kreatif multi-platform")
    .replace(/\b(hitung\s+uang|ngitung\s+kasir)\b/gi, "mengoperasikan sistem POS dan merekonsiliasi kas")
    .replace(/\b(layani|layani\s+pembeli|melayani\s+pembeli)\b/gi, "melayani transaksi pelanggan")
    .replace(/\b(jual|jualan)\s+produk\b/gi, "memasarkan serta menjual produk ritel")
    .replace(/\b(jaga|nunggu)\s+toko\b/gi, "mengelola operasional harian toko")
    .replace(/\b(kirim|ngirim)\s+barang\b/gi, "mengoordinasikan alur distribusi logistik barang")
    .replace(/\b(rekap|cek)\s+absensi\b/gi, "merekonsiliasi data absensi dan kompensasi kerja")
    .replace(/\b(cek|hitung)\s+stok\b/gi, "mengontrol dan mengaudit inventaris stok barang")
    .replace(/\b(bikin|buat)\s+laporan\b/gi, "menyusun laporan berkala dan rekonsiliasi data")
    .replace(/\b(layani|handle)\s+komplain\b/gi, "menangani resolusi komunikasi dan kendala pelanggan")
    .replace(/\b(analisa|ngolah)\s+data\b/gi, "menganalisis dataset dan menyajikan visualisasi data")
    .replace(/\b(tes|cek)\s+bug\b/gi, "melakukan pengujian fungsionalitas sistem (QA) serta mitigasi bug")
    .trim();
}

/**
 * Bolds metrics and percentages for visual contrast.
 */
function formatBoldMetrics(text: string): string {
  let result = text.replace(/(?<!\*)\b(\d+(?:\.\d+)?%)(?!\*)/g, "**$1**");
  result = result.replace(/(?<!\*)\b(Rp\s*[\d,.]+(?:\s*(?:Juta|Miliar|Ribu))?|\$\d+(?:,\d+)*(?:K|M|B)?)(?!\*)/gi, "**$1**");
  result = result.replace(/(?<!\*)\b(\d+\+?\s+(?:karyawan|staf|klien|proyek|user|pengguna|transaksi|dokumen|berkas|fitur|cabang|orang|SKU|konten))(?!\*)/gi, "**$1**");
  return result;
}

/**
 * Generate 3 distinct sentence suggestions for a resume bullet point.
 */
export function getBulletSuggestions(opts: SuggestionOptions): SentenceSuggestion[] {
  const isEn = opts.language === "en";
  const raw = sanitizeText(opts.text || "").trim();
  const role = opts.role?.trim() || "";
  const company = opts.company?.trim() || "";

  // CASE 1: Empty Draft -> Provide Role-Tailored Starters
  if (!raw) {
    if (isEn) {
      const targetRole = role || "Professional Specialist";
      return [
        {
          id: "starter-1",
          category: "efisiensi",
          title: "Efficiency & Workflow",
          sentence: `Spearheaded core initiatives as **${targetRole}**, optimizing operational turnaround time by **25%** through standardized SOPs.`,
          reason: "Highlights process improvement and measurable efficiency gains.",
        },
        {
          id: "starter-2",
          category: "skala",
          title: "Scale & Volume",
          sentence: `Managed deliverables across **10+** cross-functional projects, maintaining a **100%** on-time milestone completion rate.`,
          reason: "Demonstrates capacity to handle large scale and multi-tasking.",
        },
        {
          id: "starter-3",
          category: "lugas",
          title: "Standard Deliverable",
          sentence: `Coordinated end-to-end division workflows, ensuring compliance with industry standards and stakeholder expectations.`,
          reason: "Clear, direct, and universally ATS-friendly phrasing.",
        },
      ];
    }

    const targetRole = role || "Staf Profesional";
    return [
      {
        id: "starter-1",
        category: "efisiensi",
        title: "Efisiensi & Alur Kerja",
        sentence: `Mengoptimalkan alur kerja operasional sebagai **${targetRole}**, meningkatkan efisiensi proses hingga **25%** melalui standarisasi SOP.`,
        reason: "Menonjolkan inisiatif perbaikan proses dan efisiensi waktu.",
      },
      {
        id: "starter-2",
        category: "skala",
        title: "Skala & Volume Tanggung Jawab",
        sentence: `Mengelola penyelesaian target kerja untuk **10+** agenda berkala dengan tingkat akurasi dan kepatuhan waktu **100%**.`,
        reason: "Menunjukkan kapasitas kerja nyata dan rekam jejak reliabilitas.",
      },
      {
        id: "starter-3",
        category: "lugas",
        title: "Lugas & Standar SOP",
        sentence: `Mengoordinasikan tanggung jawab harian divisi secara terstruktur sesuai standar mutu dan target perusahaan.`,
        reason: "Kalimat ringkas, tegas, dan langsung lolos pembacaan sistem ATS.",
      },
    ];
  }

  // CASE 2: User Provided Draft -> Elevate & Produce 3 Variations
  if (isEn) {
    let cleaned = cleanInformalDraft(raw, true);
    cleaned = formatBoldMetrics(cleaned);
    const startsWithVerb = /^(spearheaded|managed|developed|orchestrated|executed|optimized|implemented|designed|accelerated|engineered|coordinated)\b/i.test(cleaned);
    const actionCore = startsWithVerb ? cleaned : `Managed ${cleaned.charAt(0).toLowerCase() + cleaned.slice(1)}`;

    return [
      {
        id: "eff-1",
        category: "efisiensi",
        title: "Fokus Efisiensi & Ketepatan",
        sentence: `Spearheaded ${cleaned.replace(/^[a-z]+\s+/i, "")}, streamlining process turnaround time by **20%** with zero discrepancies.`,
        reason: "Emphasizes precision, error reduction, and speed improvement.",
      },
      {
        id: "vol-2",
        category: "skala",
        title: "Fokus Skala & Beban Kerja",
        sentence: `${actionCore}, consistently achieving **100%** procedural compliance across scheduled milestones.`,
        reason: "Shows high dependability in meeting corporate targets.",
      },
      {
        id: "lug-3",
        category: "lugas",
        title: "Lugas & Terstruktur",
        sentence: `Coordinated and executed ${cleaned.replace(/^[a-z]+\s+/i, "")} in alignment with corporate SOP standards.`,
        reason: "Crisp and concise executive phrasing without unnecessary fluff.",
      },
    ];
  }

  // Indonesian Variant Generation
  let cleaned = cleanInformalDraft(raw, false);
  cleaned = elevateIndonesianDraft(cleaned);
  cleaned = formatBoldMetrics(cleaned);
  const trimmed = cleaned.replace(/[.,;:\s]+$/, "");

  // Determine domain-specific action verb
  let domainVerb = "Mengelola";
  if (/\b(jual|jualan|sales|toko|kasir|ritel|retail|omzet|produk)\b/i.test(trimmed)) {
    domainVerb = "Mengoptimalkan aktivitas transaksi dan penjualan";
  } else if (/\b(lapor|laporan|pajak|keuangan|fiskal|kas|invoice|rekening|pembukuan)\b/i.test(trimmed)) {
    domainVerb = "Menyusun dan merekonsiliasi administrasi";
  } else if (/\b(web|aplikasi|fitur|frontend|backend|software|database|coding|bug|sistem)\b/i.test(trimmed)) {
    domainVerb = "Mengembangkan dan mengimplementasikan";
  } else if (/\b(pelanggan|customer|klien|komplain|service|konsumen)\b/i.test(trimmed)) {
    domainVerb = "Mengoordinasikan komunikasi pelayanan dan resolusi";
  } else if (/\b(konten|desain|marketing|iklan|sosial|poster|canva|video|branding|instagram|tiktok)\b/i.test(trimmed)) {
    domainVerb = "Merancang dan memproduksi materi kreatif";
  } else if (/\b(stok|gudang|logistik|inventaris|distribusi|pengiriman|armada)\b/i.test(trimmed)) {
    domainVerb = "Mengontrol dan mengaudit tata kelola";
  } else if (/\b(rekrut|rekrutmen|payroll|absensi|karyawan|personalia)\b/i.test(trimmed)) {
    domainVerb = "Mengelola administrasi kepersonaliaan dan";
  }

  const startsWithActive = /^(mengembangkan|merancang|memimpin|mengoptimalkan|mengoordinasikan|menyusun|mengelola|merekonsiliasi|mengontrol|meningkatkan|mengevaluasi|mengoperasikan|memasarkan|memproduksi)\b/i.test(trimmed);
  const corePhrase = startsWithActive ? trimmed : `${domainVerb} ${trimmed}`;

  return [
    {
      id: "var-1",
      category: "efisiensi",
      title: "1. Berbasis Efisiensi & Akurasi",
      sentence: `${corePhrase}, memastikan tingkat akurasi **100%** serta meminimalkan potensi kesalahan data.`,
      reason: "Menonjolkan presisi hasil kerja dan kepatuhan SOP perusahaan.",
    },
    {
      id: "var-2",
      category: "skala",
      title: "2. Berbasis Dampak Kinerja & Volume",
      sentence: `${corePhrase}, guna meningkatkan efisiensi alur operasional kerja hingga **20%**.`,
      reason: "Menyertakan persentase peningkatan efisiensi (formula Google X-Y-Z).",
    },
    {
      id: "var-3",
      category: "lugas",
      title: "3. Kalimat Lugas & Terstruktur",
      sentence: `${corePhrase} secara teratur dan konsisten sesuai target divisi yang ditetapkan.`,
      reason: "Ringkas, formal, dan tidak berbelit-belit untuk rekruter.",
    },
  ];
}
