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
 * Intelligent Indonesian/English NLP fallback that respects user's draft content.
 */
function heuristicFallback(req: AiEnhanceRequest): string {
  const isEn = req.language === "en";
  const rawText = sanitizeText(req.text);

  if (req.mode === "bullet") {
    if (!rawText) {
      const defaultRole = req.role ? `sebagai ${req.role}` : "dalam tim";
      return isEn
        ? "Coordinated end-to-end deliverables, improving process efficiency by 20% through standardized workflows."
        : `Mengoordinasikan alur operasional kerja ${defaultRole} secara terstruktur guna memastikan target tercapai dengan akurasi tinggi.`;
    }

    if (isEn) {
      // Strip weak English filler prefixes iteratively
      let cleaned = rawText;
      const fillerRegexEn = /^(i\s+was\s+responsible\s+for|i\s+was|responsible\s+for|my\s+role\s+was\s+to|i\s+helped\s+to|helped\s+with|assisted\s+in|worked\s+on|did|handled|my\s+job\s+was\s+to|i)\s+/i;
      while (fillerRegexEn.test(cleaned)) {
        cleaned = cleaned.replace(fillerRegexEn, "").trim();
      }
      cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);

      const startsWithAction = /^(spearheaded|managed|developed|orchestrated|executed|optimized|implemented|designed|accelerated)\b/i.test(cleaned);
      if (startsWithAction) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }

      return `Successfully managed ${cleaned}, contributing to optimized workflows and measurable team output.`;
    }

    // Indonesian: Strip informal / weak filler prefixes iteratively
    let cleaned = rawText;
    const fillerRegexId = /^(saya|aku|tugas\s+saya|tugas\s+kami|pekerjaan\s+saya|tanggung\s+jawab\s+saya|bertanggung\s+jawab\s+(atas|untuk)?|ikut|membantu|bantu|ngurus|mengurus|bikin|membuat|mengerjakan|handle|menangani|melakukan|jaga|menjaga|pernah)\s+/i;
    while (fillerRegexId.test(cleaned)) {
      cleaned = cleaned.replace(fillerRegexId, "").trim();
    }

    cleaned = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);

    // Identify domain keyword for contextual verb
    const lower = cleaned.toLowerCase();
    let actionVerb = "Mengelola";
    let impactSuffix = "secara konsisten guna meningkatkan efisiensi dan kualitas kerja tim.";

    if (lower.includes("jual") || lower.includes("sales") || lower.includes("toko") || lower.includes("kasir") || lower.includes("produk")) {
      actionVerb = "Mengoptimalkan aktivitas";
      impactSuffix = "dengan melayani transaksi secara akurat dan meningkatkan kepuasan pelanggan.";
    } else if (lower.includes("lapor") || lower.includes("pajak") || lower.includes("keuangan") || lower.includes("data") || lower.includes("admin") || lower.includes("stok")) {
      actionVerb = "Menyusun dan mengelola administrasi";
      impactSuffix = "dengan tingkat akurasi tinggi serta memastikan kepatuhan prosedur operasional.";
    } else if (lower.includes("web") || lower.includes("sistem") || lower.includes("aplikasi") || lower.includes("fitur") || lower.includes("code")) {
      actionVerb = "Mengembangkan dan mengimplementasikan";
      impactSuffix = "untuk memastikan keandalan sistem dan pengalaman pengguna yang optimal.";
    } else if (lower.includes("pelanggan") || lower.includes("customer") || lower.includes("komplain") || lower.includes("klien")) {
      actionVerb = "Mengoordinasikan komunikasi dan pelayanan";
      impactSuffix = "guna menjaga hubungan baik serta mempercepat penyelesaian kendala klien.";
    } else if (lower.includes("konten") || lower.includes("desain") || lower.includes("marketing") || lower.includes("iklan") || lower.includes("sosial")) {
      actionVerb = "Merancang dan mengeksekusi strategi";
      impactSuffix = "yang berhasil meningkatkan engagement dan visibilitas brand secara terukur.";
    }

    return `${actionVerb} ${cleaned} ${impactSuffix}`.replace(/\s+/g, " ").trim();
  }

  if (req.mode === "summary") {
    const role = req.role || (isEn ? "Dedicated Professional" : "Tenaga Profesional");
    const skills = req.skills ? (isEn ? `skilled in ${req.skills}` : `dengan keahlian pada ${req.skills}`) : "";

    if (rawText && rawText.length > 10) {
      // Polish user's existing draft
      let cleanedDraft = rawText;
      const fillerRegexSummary = /^(halo|perkenalkan|nama\s+saya|saya\s+adalah|saya\s+merupakan|saya\s+punya\s+pengalaman|saya\s+memiliki\s+pengalaman|punya\s+pengalaman|memiliki\s+pengalaman|saya|aku|i\s+have\s+experience\s+in|i\s+am|my\s+name\s+is)\s+/i;
      while (fillerRegexSummary.test(cleanedDraft)) {
        cleanedDraft = cleanedDraft.replace(fillerRegexSummary, "").trim();
      }
      cleanedDraft = cleanedDraft.replace(/[.!?]+$/, "").trim();

      const connector = cleanedDraft.toLowerCase().startsWith("pengalaman")
        ? "dengan"
        : "dengan rekam jejak dalam";

      return isEn
        ? `Results-oriented ${role} with strong background in ${cleanedDraft}. ${skills ? `Demonstrates strong command of ${req.skills}. ` : ""}Recognized for high attention to detail, proactive problem-solving, and driving sustainable business value.`
        : `Profesional ${role} berdedikasi ${connector} ${cleanedDraft}. ${skills ? `Menguasai ${req.skills} secara mendalam untuk mendukung efisiensi operasional. ` : ""}Memiliki komitmen tinggi terhadap kualitas kerja, pemecahan masalah secara terstruktur, dan siap memberikan kontribusi nyata bagi kemajuan perusahaan.`;
    }

    return isEn
      ? `Goal-driven ${role} ${skills}. Experienced in streamlining operational processes, collaborative team execution, and delivering measurable milestones. Committed to excellence and driving strategic growth.`
      : `Profesional ${role} berintegritas tinggi ${skills}. Berpengalaman dalam pengelolaan operasional, standardisasi alur kerja, dan kolaborasi lintas fungsi. Berkomitmen untuk menghadirkan kinerja terukur serta nilai tambah bagi kemajuan perusahaan.`;
  }

  // keyword-suggestion
  return isEn
    ? `- Incorporated ${rawText || "target technical competencies"} to optimize deliverable quality and project turnaround.\n- Executed strategic initiatives ensuring high compliance and measurable operational impact.`
    : `- Menerapkan kompetensi ${rawText || "keahlian terkait"} dalam alur kerja harian guna meningkatkan akurasi dan produktivitas tim.\n- Menyelesaikan target tanggung jawab dengan ketelitian tinggi dan kepatuhan standar industri.`;
}

/**
 * Enhance resume content using Cloudflare Workers AI with fallback.
 */
export async function enhanceResumeContent(req: AiEnhanceRequest): Promise<string> {
  const isEn = req.language === "en";
  const rawText = sanitizeText(req.text);

  const { ai } = await getAiBinding();

  if (!ai) {
    return heuristicFallback(req);
  }

  let systemPrompt = "";
  let userPrompt = "";

  if (req.mode === "bullet") {
    systemPrompt = isEn
      ? "You are an expert executive resume editor and ATS specialist. Your task is to REFINE AND ELEVATE the user's draft bullet point into a single, high-impact resume achievement following the Google X-Y-Z formula (Action Verb + Context/Method + Measurable Impact). CRITICAL RULES: 1) Preserve the user's authentic facts and tasks (do not invent unrelated jobs). 2) Replace weak/informal verbs (e.g. 'helped', 'worked on') with strong active verbs (e.g. 'Managed', 'Engineered', 'Optimized', 'Spearheaded'). 3) Keep it 18-28 words, realistic, natural, and punchy. 4) Output ONLY the single refined sentence without quotes, bullet dashes (- or •), or intro/outro explanations."
      : "Kamu adalah editor resume profesional dan konsultan HRD spesialis ATS. Tugasmu adalah MENYEMPURNAKAN kalimat pengalaman kerja yang telah ditulis pengguna menjadi 1 kalimat poin prestasi kerja yang berbobot (rumus Google X-Y-Z: Action Verb + Konteks + Hasil Terukur). ATURAN KETAT: 1) Pertahankan fakta dan bidang pekerjaan asli yang diinput pengguna. 2) Ganti kata pasif/informal (seperti 'bantu', 'membantu', 'mengurus', 'jaga', 'bikin') dengan kata kerja aksi aktif profesional (cth: 'Mengelola', 'Mengembangkan', 'Mengoordinasikan', 'Mengoptimalkan', 'Memimpin', 'Menyusun'). 3) Buat 18-28 kata yang padat, mengalir natural, tanpa kata lebay atau angka mengada-ada. 4) HANYA kembalikan 1 kalimat hasil revisi tanpa tanda kutip, tanpa awalan dash (- atau •), dan tanpa kata pengantar.";

    userPrompt = `Posisi Pekerjaan: ${req.role || "Staf"}\nPerusahaan: ${req.company || "Perusahaan"}\nDraf asli pengguna: "${rawText || "Melakukan tugas operasional harian"}"\n\nSempurnakan kalimat draf di atas menjadi poin CV standar ATS:`;
  } else if (req.mode === "summary") {
    systemPrompt = isEn
      ? "You are an executive resume editor. Your task is to REFINE AND POLISH the user's draft personal summary into a compelling, 3-4 sentence professional ATS summary paragraph. CRITICAL RULES: 1) Incorporate the user's existing draft, skills, and target role into a coherent narrative. 2) Highlight value proposition, domain expertise, and operational reliability. 3) NEVER use first-person pronouns ('I', 'My', 'Me'). 4) Output ONLY the clean summary paragraph without headings, quotes, or notes."
      : "Kamu adalah konsultan resume eksekutif. Tugasmu adalah MENYEMPURNAKAN draf profil diri yang ditulis pengguna menjadi 1 paragraf Ringkasan Profesional ATS yang elegan dan meyakinkan (3-4 kalimat). ATURAN KETAT: 1) Kembangkan dari draf asli, keahlian, dan posisi yang diisi pengguna agar tetap otentik. 2) Soroti keahlian utama, pendekatan kerja, dan nilai tambah bagi perusahaan. 3) JANGAN gunakan kata ganti orang pertama seperti 'Saya' atau 'Aku'. 4) HANYA kembalikan 1 paragraf ringkasan tanpa judul, tanpa tanda kutip, dan tanpa penjelasan.";

    userPrompt = `Posisi Target: ${req.role || "Profesional"}\nKeahlian Utama: ${req.skills || "Keahlian relevan"}\nDraf asli pengguna: "${rawText || "Memiliki pengalaman dan dedikasi di bidang ini"}"\n\nSempurnakan menjadi ringkasan profesional ATS:`;
  } else {
    systemPrompt = isEn
      ? "You are an ATS resume specialist. Craft 2 realistic resume bullet points incorporating these target job keywords naturally for the candidate's role. Return ONLY the 2 bullets, each on a new line starting with a dash (-)."
      : "Kamu adalah spesialis resume ATS. Buat 2 contoh kalimat poin pengalaman CV standar ATS yang menyisipkan kata kunci lowongan berikut secara natural dan realistis. HANYA keluarkan 2 baris poin, masing-masing diawali tanda dash (-).";

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
    if (!raw) return heuristicFallback(req);

    // Clean any unwanted wrapping quotes or prefixes
    const cleaned = raw
      .replace(/^["'`]/, "")
      .replace(/["'`]$/, "")
      .replace(/^[-•*]\s*/, "")
      .trim();

    return cleaned || heuristicFallback(req);
  } catch (err) {
    console.error("[AiService] Cloudflare Workers AI error, using fallback:", err);
    return heuristicFallback(req);
  }
}
