import { sanitizeText } from "@/lib/security";

export interface AiEnhanceRequest {
  mode: "bullet" | "summary" | "keyword-suggestion";
  text: string;
  role?: string;
  company?: string;
  skills?: string;
  language?: "id" | "en";
}

/**
 * Access Cloudflare Workers AI binding safely across runtimes.
 */
async function getAiBinding(): Promise<{ ai: any; source: string }> {
  try {
    if ((globalThis as any).__CF_ENV__?.AI) {
      return { ai: (globalThis as any).__CF_ENV__.AI, source: "cf-env" };
    }
  } catch {
    // ignore
  }

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext();
    const env = ctx?.env as any;
    if (env?.AI) {
      return { ai: env.AI, source: "opennextjs-context" };
    }
  } catch {
    // ignore
  }

  try {
    const cf = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cf?.env?.AI) {
      return { ai: cf.env.AI, source: "global-cf-context" };
    }
  } catch {
    // ignore
  }

  try {
    if ((globalThis as any).AI) {
      return { ai: (globalThis as any).AI, source: "global-ai" };
    }
  } catch {
    // ignore
  }

  return { ai: null, source: "none" };
}

/**
 * Clean informal conversational prefixes and stems from user text.
 */
function cleanInformalPrefixes(raw: string, isEn: boolean): string {
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
 * Replace informal verb stems in Indonesian with elevated vocabulary.
 */
function elevateIndonesianStems(text: string): string {
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
 * Bold existing numbers and percentages in user text to highlight metrics in preview.
 */
function highlightNumbersWithBold(text: string): string {
  // Bold percentage like 25% or 99.8% if not already wrapped
  let result = text.replace(/(?<!\*)\b(\d+(?:\.\d+)?%)(?!\*)/g, "**$1**");
  // Bold currency numbers like Rp 5 Miliar or $100K
  result = result.replace(/(?<!\*)\b(Rp\s*[\d,.]+(?:\s*(?:Juta|Miliar|Ribu))?|\$\d+(?:,\d+)*(?:K|M|B)?)(?!\*)/gi, "**$1**");
  // Bold quantities with units like 150+ karyawan, 20+ fitur
  result = result.replace(/(?<!\*)\b(\d+\+?\s+(?:karyawan|staf|klien|proyek|user|pengguna|transaksi|dokumen|berkas|fitur|cabang|orang))(?!\*)/gi, "**$1**");
  return result;
}

/**
 * Advanced Dynamic Heuristic Rewrite Engine (High-impact ATS formulation).
 */
function dynamicHeuristicRewrite(req: AiEnhanceRequest): string {
  const isEn = req.language === "en";
  const rawText = sanitizeText(req.text);
  const role = req.role?.trim() || "";
  const company = req.company?.trim() || "";
  const skills = req.skills?.trim() || "";

  // 1. BULLET POINT ENHANCEMENT
  if (req.mode === "bullet") {
    if (!rawText) {
      const companyContext = company ? `di ${company}` : "perusahaan";
      if (isEn) {
        return role
          ? `Managed end-to-end deliverables as **${role}**, enhancing operational efficiency by **20%** through standardized workflows.`
          : `Coordinated cross-functional deliverables, improving process turnaround time by **25%** with standardized SOPs.`;
      }
      return role
        ? `Mengelola dan mengoordinasikan tanggung jawab sebagai **${role}** ${companyContext}, meningkatkan efisiensi proses kerja hingga **25%**.`
        : `Mengoordinasikan alur operasional kerja secara terstruktur, memastikan pencapaian target tepat waktu dengan tingkat akurasi **100%**.`;
    }

    if (isEn) {
      let cleaned = cleanInformalPrefixes(rawText, true);
      cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);

      const startsWithAction = /^(spearheaded|managed|developed|orchestrated|executed|optimized|implemented|designed|accelerated|engineered|coordinated)\b/i.test(cleaned);
      const highlighted = highlightNumbersWithBold(cleaned);

      if (startsWithAction) {
        return highlighted.charAt(0).toUpperCase() + highlighted.slice(1);
      }

      // Dynamic rotation between 3 impact metrics
      const hash = rawText.length % 3;
      if (hash === 0) {
        return `Successfully orchestrated ${highlighted}, optimizing deliverable quality and boosting team throughput by **20%**.`;
      } else if (hash === 1) {
        return `Spearheaded ${highlighted}, ensuring **100%** procedural compliance and consistent on-time project completion.`;
      } else {
        return `Managed and executed ${highlighted}, standardizing workflows and achieving high stakeholder satisfaction.`;
      }
    }

    // Indonesian: Clean and elevate
    let cleaned = cleanInformalPrefixes(rawText, false);
    cleaned = elevateIndonesianStems(cleaned);
    cleaned = highlightNumbersWithBold(cleaned);

    const lower = cleaned.toLowerCase();
    let actionVerb = "Mengelola";
    let contextualDomain = cleaned;

    // Detect domain to pick strong action verb using proper word boundaries
    if (/\b(jual|jualan|sales|toko|kasir|ritel|retail|omzet|produk)\b/i.test(cleaned) || /\bpos\b/i.test(cleaned)) {
      actionVerb = "Mengoptimalkan aktivitas transaksi dan penjualan";
    } else if (/\b(lapor|laporan|pajak|keuangan|fiskal|kas|invoice|rekening|pembukuan)\b/i.test(cleaned)) {
      actionVerb = "Menyusun dan merekonsiliasi administrasi";
    } else if (/\b(web|aplikasi|fitur|frontend|backend|software|database|coding|bug|sistem)\b/i.test(cleaned) || /\bapi\b/i.test(cleaned)) {
      actionVerb = "Mengembangkan dan mengimplementasikan";
    } else if (/\b(pelanggan|customer|klien|komplain|service|konsumen)\b/i.test(cleaned)) {
      actionVerb = "Mengoordinasikan komunikasi pelayanan dan resolusi";
    } else if (/\b(konten|desain|marketing|iklan|sosial|poster|canva|video|branding|instagram|tiktok)\b/i.test(cleaned)) {
      actionVerb = "Merancang dan mengeksekusi materi kreatif";
    } else if (/\b(stok|gudang|logistik|inventaris|distribusi|pengiriman|armada)\b/i.test(cleaned)) {
      actionVerb = "Mengontrol dan mengoordinasikan tata kelola";
    } else if (/\b(rekrut|rekrutmen|payroll|absensi|karyawan|personalia)\b/i.test(cleaned) || /\bhr\b/i.test(cleaned) || /\bhrd\b/i.test(cleaned)) {
      actionVerb = "Mengelola administrasi kepersonaliaan dan";
    } else {
      actionVerb = "Mengoordinasikan dan mengeksekusi";
    }

    // Dynamic rotation between 3 distinct ATS impact suffixes based on string characteristics
    const variant = (rawText.length + (role.length || 0)) % 3;
    let impactSuffix = "dengan tingkat akurasi **100%** serta kepatuhan penuh terhadap SOP perusahaan.";
    if (variant === 1) {
      impactSuffix = "guna mempercepat efisiensi alur operasional kerja hingga **25%**.";
    } else if (variant === 2) {
      impactSuffix = "untuk memastikan ketercapaian target divisi secara konsisten dengan standar mutu tinggi.";
    }

    const trimmedCleaned = cleaned.replace(/[.,;:\s]+$/, "");

    // If cleaned already begins with a professional action verb, don't duplicate actionVerb
    const startsWithActiveVerb = /^(mengembangkan|merancang|memimpin|mengoptimalkan|mengoordinasikan|menyusun|mengelola|merekonsiliasi|mengontrol|meningkatkan|mengevaluasi|mengoperasikan|memasarkan|memproduksi)\b/i.test(trimmedCleaned);
    if (startsWithActiveVerb) {
      const needsImpact = !/(%|\b100%|\bsop\b|\bzero error\b|target)/i.test(trimmedCleaned);
      const finalSentence = needsImpact ? `${trimmedCleaned}, ${impactSuffix}` : trimmedCleaned;
      return `${finalSentence.charAt(0).toUpperCase() + finalSentence.slice(1)}`.replace(/\s+/g, " ").trim();
    }

    const trimmedDomain = contextualDomain.replace(/[.,;:\s]+$/, "");
    return `${actionVerb} ${trimmedDomain}, ${impactSuffix}`.replace(/\s+/g, " ").trim();
  }

  // 2. SUMMARY (SHORT BIO) ENHANCEMENT
  if (req.mode === "summary") {
    const targetRole = role || (isEn ? "Dedicated Professional" : "Tenaga Profesional");
    const skillsText = skills ? (isEn ? `Skilled in ${skills}. ` : `Menguasai ${skills} untuk mendukung efisiensi divisi. `) : "";

    if (rawText && rawText.length > 10) {
      let cleanedDraft = cleanInformalPrefixes(rawText, isEn);
      cleanedDraft = cleanedDraft
        .replace(/^(punya\s+pengalaman|memiliki\s+pengalaman|pengalaman\s+selama)\s+/i, "")
        .replace(/[.!?]+$/, "")
        .trim();
      cleanedDraft = highlightNumbersWithBold(cleanedDraft);

      const connector = cleanedDraft.toLowerCase().startsWith("pengalaman")
        ? "dengan"
        : "dengan rekam jejak dalam";

      return isEn
        ? `Results-oriented **${targetRole}** with strong background in ${cleanedDraft}. ${skillsText}Recognized for structured problem-solving, high accountability, and consistently driving high-impact operational deliverables.`
        : `Profesional **${targetRole}** berdedikasi ${connector} ${cleanedDraft}. ${skillsText}Memiliki komitmen tinggi terhadap standardisasi mutu kerja, pemecahan masalah secara terstruktur, dan siap memberikan kontribusi nyata bagi akselerasi perusahaan.`;
    }

    return isEn
      ? `Goal-driven **${targetRole}** with proven experience in streamlining core operational workflows and collaborative team execution. ${skillsText}Committed to precision, continuous optimization, and delivering measurable milestones.`
      : `Profesional **${targetRole}** berintegritas tinggi dengan rekam jejak dalam tata kelola operasional dan koordinasi lintas fungsi. ${skillsText}Berkomitmen menghadirkan kinerja terukur, efisiensi alur kerja berstandar tinggi, serta nilai tambah bagi kemajuan perusahaan.`;
  }

  // 3. KEYWORD SUGGESTION
  const cleanKeywords = highlightNumbersWithBold(rawText);
  return isEn
    ? `- Incorporated ${cleanKeywords || "core domain competencies"} to optimize deliverables, enhancing turnaround time by **20%**.\n- Standardized workflows utilizing industry best practices, achieving a **100%** procedural compliance record.`
    : `- Menerapkan kompetensi ${cleanKeywords || "keahlian spesifik"} dalam alur kerja harian, meningkatkan efisiensi proses hingga **20%**.\n- Menyelesaikan target tanggung jawab secara terstruktur dengan tingkat akurasi **100%** sesuai standar mutu industri.`;
}

/**
 * Enhance resume content using Cloudflare Workers AI with intelligent dynamic fallback.
 */
export async function enhanceResumeContent(req: AiEnhanceRequest): Promise<string> {
  const isEn = req.language === "en";
  const rawText = sanitizeText(req.text);

  const { ai } = await getAiBinding();

  // If Workers AI binding is not reachable in current execution context, use dynamic NLP engine
  if (!ai) {
    return dynamicHeuristicRewrite(req);
  }

  let systemPrompt = "";
  let userPrompt = "";

  if (req.mode === "bullet") {
    systemPrompt = isEn
      ? `You are an expert executive ATS resume editor. Your task is to REFINE AND ELEVATE the user's resume bullet point into a single high-impact bullet using the Google X-Y-Z formula (Accomplished [X] as measured by [Y], by doing [Z]).
CRITICAL RULES:
1. Retain the candidate's authentic tasks, tools, and domain from their draft.
2. Begin with a strong active verb (e.g., Spearheaded, Engineered, Optimized, Coordinated, Managed, Orchestrated).
3. Embed realistic measurable metrics or compliance standards. Bold key metrics using markdown (e.g. **25%**, **100%**, **SOP**).
4. Length: 18-28 words. Punchy, executive tone.
5. Output ONLY the single polished sentence without quotes, leading dashes/bullets (- or •), or explanations.

FEW-SHOT EXAMPLES:
- User Draft: "helped cashiers count money and serve store customers"
  Polished: "Operated POS cashier systems and served **80+** daily customer transactions, maintaining **100%** cash reconciliation accuracy and zero discrepancy."
- User Draft: "made website frontend with react and nextjs"
  Polished: "Engineered scalable responsive frontend interfaces using **React** and **Next.js**, reducing page load times by **35%**."`
      : `Kamu adalah konsultan HRD eksekutif dan pakar penulisan CV ATS. Tugasmu adalah MENYEMPURNAKAN kalimat pengalaman kerja yang telah ditulis pengguna menjadi 1 kalimat poin prestasi kerja yang berbobot (rumus Google X-Y-Z: Action Verb + Konteks + Hasil Terukur).
ATURAN KETAT:
1. Pertahankan fakta pekerjaan, tugas, dan konteks asli dari draf pengguna (jangan mengarang posisi lain).
2. Awali kalimat dengan kata kerja aksi aktif kuat (cth: Mengembangkan, Mengoptimalkan, Memimpin, Merancang, Mengelola, Merekonsiliasi, Mengoordinasikan).
3. Sisipkan hasil terukur atau standar SOP yang realistis. Tebalkan angka/persentase penting dengan markdown (cth: **25%**, **100%**, **SOP**).
4. Panjang kalimat: 18-28 kata yang mengalir natural, padat, dan profesional.
5. HANYA kembalikan 1 kalimat hasil revisi tanpa tanda kutip, tanpa simbol dash (-/•), dan tanpa kalimat pengantar.

CONTOH POLASAN:
- Draf: "bantu ngurus surat masuk keluar dan arsip dokumen"
  Hasil: "Mengelola sistem pengarsipan berkas serta administrasi persuratan masuk dan keluar hingga **150+** dokumen per bulan dengan akurasi **100%**."
- Draf: "bikin konten tiktok dan ig buat jualan"
  Hasil: "Merancang dan memproduksi **15+** materi konten kreatif mingguan di TikTok dan Instagram, meningkatkan engagement pelanggan sebesar **35%**."
- Draf: "layani pembeli di kasir dan hitung uang"
  Hasil: "Mengoperasikan sistem POS kasir dan melayani lebih dari **75+** transaksi harian dengan tingkat presisi rekonsiliasi kas **100%**."`;

    userPrompt = `Posisi Pekerjaan: ${req.role || "Staf Profesional"}\nPerusahaan: ${req.company || "Perusahaan"}\nDraf asli pengguna: "${rawText || "Melakukan koordinasi operasional harian"}"\n\nSempurnakan kalimat draf di atas menjadi poin CV standar ATS:`;
  } else if (req.mode === "summary") {
    systemPrompt = isEn
      ? `You are an executive resume writer. Your task is to REFINE AND POLISH the user's personal summary into a compelling, 3-sentence professional ATS summary paragraph.
CRITICAL RULES:
1. Seamlessly integrate the user's background, core skills, and target position.
2. Bold target position and key skills or metrics (e.g. **Frontend Engineer**, **3+ years**).
3. NEVER use first-person pronouns ('I', 'My', 'Me', 'We').
4. Output ONLY the clean summary paragraph without headings, quotes, or notes.`
      : `Kamu adalah konsultan resume eksekutif spesialis ATS. Tugasmu adalah MENYEMPURNAKAN draf ringkasan diri pengguna menjadi 1 paragraf Ringkasan Profesional ATS yang elegan dan meyakinkan (3 kalimat).
ATURAN KETAT:
1. Kembangkan dari draf asli yang ditulis pengguna, integrasikan dengan posisi target dan keahlian utama.
2. Tebalkan posisi target dan keahlian kunci menggunakan markdown (cth: **Human Resources Specialist**, **3 tahun**).
3. JANGAN gunakan kata ganti orang pertama seperti 'Saya' atau 'Aku'.
4. HANYA kembalikan 1 paragraf ringkasan tanpa judul, tanpa tanda kutip, dan tanpa penjelasan.`;

    userPrompt = `Posisi Target: ${req.role || "Profesional"}\nKeahlian Utama: ${req.skills || "Kompetensi relevan"}\nDraf asli pengguna: "${rawText || "Memiliki rekam jejak kerja yang konsisten"}"\n\nSempurnakan menjadi ringkasan profesional ATS:`;
  } else {
    systemPrompt = isEn
      ? "You are an ATS resume specialist. Craft 2 realistic resume bullet points incorporating these target job keywords naturally for the candidate's role. Bold key terms using markdown (**...**). Return ONLY the 2 bullets, each on a new line starting with a dash (-)."
      : "Kamu adalah spesialis resume ATS. Buat 2 contoh kalimat poin pengalaman CV standar ATS yang menyisipkan kata kunci lowongan berikut secara natural. Tebalkan kata kunci menggunakan markdown (**...**). HANYA keluarkan 2 baris poin, masing-masing diawali tanda dash (-).";

    userPrompt = `Posisi: ${req.role || "Profesional"}\nKata kunci yang harus disisipkan: ${rawText}`;
  }

  try {
    const aiResponse = (await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.3,
    })) as { response?: string };

    const raw = aiResponse?.response?.trim() || "";
    if (!raw) return dynamicHeuristicRewrite(req);

    // Clean any unwanted wrapping quotes or prefixes
    const cleaned = raw
      .replace(/^["'`]/, "")
      .replace(/["'`]$/, "")
      .replace(/^[-•*]\s*/, "")
      .trim();

    return cleaned || dynamicHeuristicRewrite(req);
  } catch (err) {
    console.error("[AiService] Cloudflare Workers AI error, using fallback:", err);
    return dynamicHeuristicRewrite(req);
  }
}
