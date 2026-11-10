import { extractText } from "unpdf";

export interface AtsCheckItem {
  id: string;
  category: "contact" | "structure" | "content" | "formatting";
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface AtsAnalysisResult {
  overallScore: number;
  matchScore: number;
  formattingScore: number;
  contactScore: number;
  contentScore: number;
  summary: string;
  stats: {
    wordCount: number;
    charCount: number;
    estimatedPages: number;
  };
  checks: AtsCheckItem[];
  matchedKeywords: string[];
  missingKeywords: string[];
  actionVerbCount: number;
  metricsCount: number;
  recommendations: Array<{
    type: "keyword" | "format" | "impact";
    title: string;
    advice: string;
    example?: string;
  }>;
}

const COMMON_STOP_WORDS = new Set([
  "and", "the", "with", "for", "from", "that", "this", "have", "been", "will",
  "dalam", "dengan", "untuk", "yang", "pada", "dari", "atau", "adalah", "sebagai",
  "kami", "anda", "saya", "akan", "dapat", "bisa", "harus", "tentang", "serta",
  "years", "year", "month", "experience", "looking", "candidate", "requirements",
  "responsibilities", "skills", "ability", "strong", "proven", "proficient", "role",
  "team", "work", "working", "good", "knowledge", "must", "plus", "understanding"
]);

const ACTION_VERBS = [
  "spearheaded", "architected", "developed", "engineered", "built", "designed",
  "implemented", "optimized", "increased", "reduced", "scaled", "orchestrated",
  "deployed", "refactored", "migrated", "automated", "mentored", "launched",
  "mengembangkan", "merancang", "membangun", "mengoptimalkan", "meningkatkan",
  "mengurangi", "mengotomasi", "memimpin", "mengimplementasikan"
];

const STANDARD_SECTIONS = [
  { name: "Experience", patterns: [/experience/i, /pengalaman/i, /employment/i, /work history/i] },
  { name: "Education", patterns: [/education/i, /pendidikan/i, /academic/i] },
  { name: "Skills", patterns: [/skills/i, /keahlian/i, /kompetensi/i, /technologies/i, /tech stack/i] },
  { name: "Summary", patterns: [/summary/i, /ringkasan/i, /profile/i, /about/i, /tentang/i] },
  { name: "Projects", patterns: [/projects/i, /proyek/i, /portfolio/i, /portofolio/i] },
];

/**
 * Extract clean keywords from text by filtering out stop words, numbers, and short tokens.
 */
function extractMeaningfulKeywords(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9#+.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 2 && !COMMON_STOP_WORDS.has(t) && !/^\d+$/.test(t));

  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }

  // Return unique keywords sorted by frequency
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

/**
 * Scan CV PDF buffer and compare against Job Description.
 */
export async function analyzeCvPdf(
  pdfBuffer: ArrayBuffer,
  jobDescription: string
): Promise<AtsAnalysisResult> {
  // 1. Extract text via unpdf
  let extractedText = "";
  try {
    const { text } = await extractText(pdfBuffer);
    extractedText = Array.isArray(text) ? text.join("\n") : text || "";
  } catch (err) {
    throw new Error(
      `Gagal membaca teks PDF: ${err instanceof Error ? err.message : "Format PDF rusak"}`
    );
  }

  return analyzeCvText(extractedText, jobDescription);
}

/**
 * Scan extracted CV text directly and compare against Job Description.
 */
export function analyzeCvText(
  rawText: string,
  jobDescription: string
): AtsAnalysisResult {
  const cleanText = rawText.replace(/\s+/g, " ").trim();
  const lowerText = cleanText.toLowerCase();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 450));

  const checks: AtsCheckItem[] = [];

  // Check: Scanned Image vs Selectable Text
  if (cleanText.length < 100) {
    checks.push({
      id: "text-selectable",
      category: "formatting",
      label: "Format Teks Digital",
      status: "fail",
      detail:
        "Teks yang diekstrak terlalu sedikit (<100 karakter). CV terindikasi berupa gambar hasil scan. Sistem ATS tidak dapat membaca isi dokumen ini.",
    });
  } else {
    checks.push({
      id: "text-selectable",
      category: "formatting",
      label: "Format Teks Digital",
      status: "pass",
      detail: `Terbaca sempurna (${wordCount} kata). Teks selectable dan kompatibel dengan parser ATS.`,
    });
  }

  // 3. Contact Information Checks
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,5}/;
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
  const githubRegex = /github\.com\/[\w-]+/i;

  const hasEmail = emailRegex.test(cleanText);
  const hasPhone = phoneRegex.test(cleanText);
  const hasLinkedIn = linkedinRegex.test(cleanText);
  const hasGithub = githubRegex.test(cleanText);

  checks.push({
    id: "contact-email",
    category: "contact",
    label: "Alamat Email",
    status: hasEmail ? "pass" : "fail",
    detail: hasEmail ? "Alamat email valid terdeteksi." : "Email tidak ditemukan atau terpotong.",
  });

  checks.push({
    id: "contact-phone",
    category: "contact",
    label: "Nomor Telepon",
    status: hasPhone ? "pass" : "warn",
    detail: hasPhone
      ? "Nomor kontak terdeteksi."
      : "Nomor telepon tidak terdeteksi dengan format standar.",
  });

  checks.push({
    id: "contact-social",
    category: "contact",
    label: "Tautan Portofolio / Profil",
    status: hasLinkedIn || hasGithub ? "pass" : "warn",
    detail:
      hasLinkedIn || hasGithub
        ? "Link profil profesional (LinkedIn/GitHub) terdeteksi."
        : "Disarankan menyertakan tautan LinkedIn atau GitHub aktif.",
  });

  // 4. Section Structure Checks
  for (const sec of STANDARD_SECTIONS) {
    const found = sec.patterns.some((p) => p.test(cleanText));
    checks.push({
      id: `section-${sec.name.toLowerCase()}`,
      category: "structure",
      label: `Bagian ${sec.name}`,
      status: found ? "pass" : "warn",
      detail: found
        ? `Heading "${sec.name}" ditemukan dengan format standar.`
        : `Heading "${sec.name}" tidak terdeteksi. ATS menyukai penamaan section baku.`,
    });
  }

  // 5. Length Check
  if (wordCount >= 250 && wordCount <= 1000) {
    checks.push({
      id: "doc-length",
      category: "formatting",
      label: "Panjang Dokumen",
      status: "pass",
      detail: `Panjang ideal (${wordCount} kata / ~${estimatedPages} halaman).`,
    });
  } else if (wordCount < 250) {
    checks.push({
      id: "doc-length",
      category: "formatting",
      label: "Panjang Dokumen",
      status: "warn",
      detail: `Dokumen terlalu pendek (${wordCount} kata). Berikan detail lebih pada deskripsi tanggung jawab pekerjaan.`,
    });
  } else {
    checks.push({
      id: "doc-length",
      category: "formatting",
      label: "Panjang Dokumen",
      status: "warn",
      detail: `Dokumen cukup panjang (${wordCount} kata / ~${estimatedPages} halaman). Disarankan ringkas menjadi 1-2 halaman.`,
    });
  }

  // 6. Action Verbs & Metrics
  let actionVerbCount = 0;
  for (const verb of ACTION_VERBS) {
    const matches = lowerText.match(new RegExp(`\\b${verb}`, "g"));
    if (matches) actionVerbCount += matches.length;
  }

  const metricMatches = cleanText.match(/\b\d+(\.\d+)?(%|\$|x|k|\+)?\b/gi) || [];
  const metricsCount = metricMatches.length;

  checks.push({
    id: "content-impact",
    category: "content",
    label: "Kata Kerja Aksi & Metrik Hasil",
    status: actionVerbCount >= 5 && metricsCount >= 3 ? "pass" : "warn",
    detail: `Ditemukan ${actionVerbCount} kata kerja tindakan dan ${metricsCount} metrik angka. Gunakan formula 'Pencapaian [X] diukur dengan [Y] melalui tindakan [Z]'.`,
  });

  // 7. Job Description Keyword Matching
  const jdKeywords = extractMeaningfulKeywords(jobDescription);
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jdKeywords.slice(0, 30)) {
    // Check if word or phrase is in CV
    const kwRegex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (kwRegex.test(lowerText)) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  // 8. Calculate Categorical & Overall Scores
  const totalKeywordsChecked = matchedKeywords.length + missingKeywords.length;
  const keywordMatchRatio = totalKeywordsChecked > 0 ? matchedKeywords.length / totalKeywordsChecked : 0.7;
  const matchScore = Math.round(keywordMatchRatio * 100);

  const contactPassCount = checks.filter((c) => c.category === "contact" && c.status === "pass").length;
  const contactScore = Math.round((contactPassCount / 3) * 100);

  const structurePassCount = checks.filter((c) => c.category === "structure" && c.status === "pass").length;
  const formattingScore = Math.round((structurePassCount / STANDARD_SECTIONS.length) * 100);

  const contentScore = Math.min(100, Math.round((actionVerbCount * 6 + Math.min(metricsCount, 8) * 6)));

  // Weighted overall score: Match (40%), Structure/Format (25%), Content/Metrics (20%), Contact (15%)
  const overallScore = Math.min(
    100,
    Math.max(
      15,
      Math.round(
        matchScore * 0.4 +
        formattingScore * 0.25 +
        contentScore * 0.2 +
        contactScore * 0.15
      )
    )
  );

  // 9. Generate Contextual Recommendations
  const recommendations: AtsAnalysisResult["recommendations"] = [];

  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 6).join(", ");
    recommendations.push({
      type: "keyword",
      title: "Tambahkan Kata Kunci yang Hilang",
      advice: `Lowongan kerja menekankan kualifikasi: ${topMissing}. Integrasikan kata kunci ini ke ringkasan atau bullet point pengalaman Anda jika Anda memang menguasainya.`,
      example: `Contoh: "Mengembangkan arsitektur backend menggunakan ${missingKeywords[0] || "TypeScript"} yang meningkatkan performa sistem sebesar 35%."`,
    });
  }

  if (metricsCount < 3) {
    recommendations.push({
      type: "impact",
      title: "Kuantifikasi Dampak dengan Angka",
      advice: "Sistem ATS dan recruiter memprioritaskan pencapaian terukur daripada daftar tugas pasif.",
      example: "Ubah: 'Bertanggung jawab atas efisiensi query DB' -> Menjadi: 'Mengoptimasi query PostgreSQL hingga memotong latency p99 sebesar 40%'.",
    });
  }

  if (formattingScore < 80) {
    recommendations.push({
      type: "format",
      title: "Gunakan Judul Bagian Standar",
      advice: "Gunakan judul umum yang mudah dipahami parser ATS: 'Work Experience', 'Education', 'Skills', 'Projects'. Hindari judul kreatif seperti 'Where I've Been' atau 'My Superpowers'.",
    });
  }

  let summary = "";
  if (overallScore >= 80) {
    summary = "Luar biasa! CV memiliki kompatibilitas ATS yang kuat dengan kata kunci yang sangat relevan.";
  } else if (overallScore >= 60) {
    summary = "Cukup baik, namun masih ada celah kata kunci penting dan metrik yang perlu dioptimalkan untuk lolos screening teratas.";
  } else {
    summary = "CV berisiko gugur di screening awal ATS karena kurangnya kecocokan kata kunci dan format yang belum optimal.";
  }

  return {
    overallScore,
    matchScore,
    formattingScore,
    contactScore,
    contentScore,
    summary,
    stats: {
      wordCount,
      charCount: cleanText.length,
      estimatedPages,
    },
    checks,
    matchedKeywords: matchedKeywords.slice(0, 15),
    missingKeywords: missingKeywords.slice(0, 15),
    actionVerbCount,
    metricsCount,
    recommendations,
  };
}
