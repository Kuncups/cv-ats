import { sanitizeText } from "@/lib/security";

export interface AiEnhanceRequest {
  mode: "bullet" | "summary" | "keyword-suggestion";
  text: string;
  role?: string;
  company?: string;
  skills?: string;
  language?: "id" | "en";
}

async function getAiBinding(): Promise<any> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx && (ctx as any).env && (ctx as any).env.AI) {
      return (ctx as any).env.AI;
    }
  } catch {
    // Local / build environment fallback
  }
  return null;
}

/**
 * Heuristic polish fallback when Cloudflare AI binding is not reachable (e.g. offline dev).
 */
function heuristicFallback(req: AiEnhanceRequest): string {
  const isEn = req.language === "en";
  const clean = sanitizeText(req.text);

  if (req.mode === "bullet") {
    if (!clean) {
      return isEn
        ? "Managed end-to-end deliverables, improving process efficiency by 25% through standardized workflows."
        : "Mengelola alur operasional dan koordinasi tim, meningkatkan efisiensi proses hingga 25% melalui standardisasi SOP.";
    }

    // Capitalize and add impact if missing action verb
    const firstWord = clean.split(" ")[0].toLowerCase();
    const actionVerbsId = ["mengembangkan", "mengoptimalkan", "memimpin", "merancang", "meningkatkan", "mengelola"];
    const actionVerbsEn = ["spearheaded", "optimized", "managed", "developed", "increased", "orchestrated"];

    if (isEn) {
      if (actionVerbsEn.includes(firstWord)) return clean;
      return `Optimized ${clean.charAt(0).toLowerCase() + clean.slice(1)}, enhancing performance by 20%.`;
    } else {
      if (actionVerbsId.includes(firstWord)) return clean;
      return `Mengoptimalkan ${clean.charAt(0).toLowerCase() + clean.slice(1)} guna mempercepat efisiensi kerja tim.`;
    }
  }

  if (req.mode === "summary") {
    const role = req.role || (isEn ? "Professional Specialist" : "Tenaga Profesional");
    const skills = req.skills ? `dengan keahlian utama pada ${req.skills}` : "dengan rekam jejak terbukti";

    return isEn
      ? `Results-driven ${role} with proven expertise in driving operational excellence and scalable solutions. Skilled in ${req.skills || "cross-functional collaboration, strategic execution, and project leadership"}. Committed to delivering high-impact contributions and optimizing organizational growth.`
      : `Profesional ${role} berdedikasi tinggi ${skills}. Berpengalaman dalam pengelolaan operasional, standardisasi alur kerja, dan kolaborasi lintas tim. Berkomitmen untuk memberikan kontribusi nyata yang terukur serta mendorong efisiensi perusahaan.`;
  }

  // keyword-suggestion
  return isEn
    ? `- Applied ${clean || "core industry competencies"} to streamline cross-functional projects.\n- Accelerated delivery timelines while maintaining 98% accuracy.`
    : `- Menerapkan kompetensi ${clean || "teknis terkait"} untuk mengoptimalkan efisiensi alur kerja tim.\n- Menyelesaikan target operasional tepat waktu dengan tingkat akurasi 98%.`;
}

/**
 * Enhance resume content using Cloudflare Workers AI with fallback.
 */
export async function enhanceResumeContent(req: AiEnhanceRequest): Promise<string> {
  const isEn = req.language === "en";
  const ai = await getAiBinding();

  if (!ai) {
    return heuristicFallback(req);
  }

  let systemPrompt = "";
  let userPrompt = "";

  if (req.mode === "bullet") {
    systemPrompt = isEn
      ? "You are an expert ATS resume writer. Polish the user's resume bullet point into a single high-impact bullet following the Google X-Y-Z formula (Accomplished [X] as measured by [Y], by doing [Z]). Start with an active verb. Keep it 15-28 words, realistic, without placeholders like '[insert number]'. Output ONLY the single polished sentence, without quotation marks, bullet symbols (- or •), or explanatory intro/outro."
      : "Kamu adalah pakar penulisan CV ATS dan recruiter HRD. Ubah poin pengalaman kerja pengguna menjadi 1 kalimat poin prestasi kerja yang kuat, diawali kata kerja aksi aktif (cth: Mengembangkan, Mengoptimalkan, Memimpin, Merancang, Meningkatkan). Buat realistis, padat (15-28 kata), tanpa tanda kurung atau placeholder '[masukkan angka]'. HANYA keluarkan 1 kalimat hasil polesan tanpa tanda petik, tanda dash (-), atau kata pengantar.";

    userPrompt = `Posisi: ${req.role || "Staf"}\nPerusahaan: ${req.company || "Perusahaan"}\nPoin asli: "${sanitizeText(req.text)}"`;
  } else if (req.mode === "summary") {
    systemPrompt = isEn
      ? "You are an executive resume writer. Write a sharp, compelling 3-4 sentence professional summary paragraph for a resume. Highlight value proposition, domain expertise, and operational reliability. Do not use first-person pronouns ('I', 'My'). Output ONLY the summary paragraph without headings or quotes."
      : "Kamu adalah pakar HRD dan resume writer ATS. Tuliskan 1 paragraf ringkasan profesional (3-4 kalimat) yang padat, elegan, dan menarik perhatian rekruter. Jangan gunakan kata ganti orang pertama ('Saya', 'Aku'). HANYA keluarkan paragraf ringkasan tanpa judul atau tanda petik.";

    userPrompt = `Posisi Target: ${req.role || "Profesional"}\nKeahlian Utama: ${req.skills || "Umum"}\nCatatan tambahan: ${sanitizeText(req.text)}`;
  } else {
    systemPrompt = isEn
      ? "Generate 2 realistic ATS-friendly bullet points incorporating these target keywords for the candidate's position. Return ONLY the 2 bullets, each on a new line starting with a dash (-)."
      : "Buat 2 contoh kalimat poin pengalaman CV standar ATS yang menyisipkan kata kunci berikut secara natural. HANYA keluarkan 2 baris poin, masing-masing diawali tanda dash (-).";

    userPrompt = `Posisi: ${req.role || "Staf"}\nKata kunci yang harus ada: ${sanitizeText(req.text)}`;
  }

  try {
    const aiResponse = (await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 280,
      temperature: 0.35,
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
