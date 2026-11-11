import { NextRequest, NextResponse } from "next/server";
import { sanitizeText } from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit";
import { getBulletSuggestions, SentenceSuggestion } from "@/lib/sentence-suggestions";

async function getAiBinding(): Promise<any> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx?.env as any;
    if (env?.AI) {
      return env.AI;
    }
  } catch (e) {
    // ignore
  }

  try {
    const cf = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cf?.env?.AI) {
      return cf.env.AI;
    }
  } catch (e) {
    // ignore
  }

  try {
    if ((globalThis as any).__CF_ENV__?.AI) {
      return (globalThis as any).__CF_ENV__.AI;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`ai_${clientIp}`, 20, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Batas permintaan saran AI tercapai. Mohon tunggu ${rateLimit.resetSec} detik sebelum mencoba lagi.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSec),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = (await req.json()) as {
      text?: string;
      role?: string;
      company?: string;
      language?: "id" | "en";
    };

    const text = sanitizeText(body.text || "").trim();
    const role = sanitizeText(body.role || "").trim();
    const company = sanitizeText(body.company || "").trim();
    const language = body.language === "en" ? "en" : "id";
    const isEn = language === "en";

    const ai = await getAiBinding();

    if (!ai) {
      const fallbackSuggestions = getBulletSuggestions({
        text,
        role,
        company,
        language,
      });
      return NextResponse.json({ success: true, data: fallbackSuggestions, source: "engine" });
    }

    const systemPrompt = isEn
      ? `You are an elite executive ATS resume editor.
Analyze the candidate's authentic draft work experience bullet, role, and company.
Dynamically generate exactly 3 UNIQUE, HIGH-IMPACT ATS resume bullet point suggestions (Google X-Y-Z formula: Action Verb + Context + Measurable Result).

STRICT INSTRUCTIONS:
1. NO CANNED OR GENERIC TEMPLATES. Dynamically adapt to their specific domain, duties, and tools.
2. NEVER use first-person pronouns ('I', 'my', 'me', 'we'). Always start directly with an active past/present verb (e.g. Spearheaded, Engineered, Coordinated, Managed, Optimized).
3. 3 distinct angles:
   - Angle 1 (category: "efisiensi"): Efficiency, precision, turnaround time, or error reduction.
   - Angle 2 (category: "skala"): Scale, volume, throughput, or budget.
   - Angle 3 (category: "lugas"): Direct, crisp executive delivery complying with SOPs.
4. Bold key metrics or tools with markdown (**...**), e.g. **25%**, **100%**, **SOP**.
5. Length: 18-26 words per sentence.
6. Output ONLY a valid JSON array of 3 objects with keys: "id" (string), "category" ("efisiensi"|"skala"|"lugas"), "title" (string), "sentence" (string), "reason" (string). No text outside the JSON array.`
      : `Kamu adalah konsultan eksekutif resume ATS.
Tugasmu adalah menganalisis draf asli pengalaman kerja pengguna, jabatan, dan perusahaannya, lalu menghasilkan 3 PILIHAN SARAN KALIMAT ATS DINAMIS (Rumus Google X-Y-Z: Action Verb Kuat + Konteks Pekerjaan + Hasil Terukur).

ATURAN KETAT:
1. JANGAN GUNAKAN TEMPLATE STATIS ATAU KATA KAKU. Pahami betul konteks pekerjaan, alat/tools, atau tanggung jawab spesifik yang ditulis pengguna.
2. DILARANG KERAS menggunakan kata ganti orang pertama ("saya", "aku", "kami"). Selalu awali kalimat langsung dengan kata kerja aksi aktif (cth: Mengembangkan, Mengoordinasikan, Menyusun, Mengaudit, Merealisasikan).
3. Buat tepat 3 sudut pandang yang berbeda dan bervariasi:
   - Varian 1 (category: "efisiensi"): Fokus pada efisiensi waktu, otomatisasi, akurasi data, atau penurunan selisih/eror.
   - Varian 2 (category: "skala"): Fokus pada volume transaksi, jumlah berkas/klien, atau skala tanggung jawab (misal **100+** berkas, **500+** SKU, dll).
   - Varian 3 (category: "lugas"): Kalimat tegas, ringkas, profesional, dan patuh pada SOP standar industri.
4. Tebalkan angka metrik, persentase, atau tools penting dengan markdown (cth: **25%**, **100%**, **SOP**, **150+**).
5. Panjang kalimat: 18 - 26 kata yang mengalir alami dan berbobot.
6. HANYA keluarkan format JSON murni berupa array 3 objek dengan struktur kunci:
   [
     { "id": "1", "category": "efisiensi", "title": "1. Berbasis Efisiensi & Akurasi", "sentence": "...", "reason": "..." },
     { "id": "2", "category": "skala", "title": "2. Berbasis Dampak Kinerja & Volume", "sentence": "...", "reason": "..." },
     { "id": "3", "category": "lugas", "title": "3. Kalimat Lugas & Terstruktur", "sentence": "...", "reason": "..." }
   ]
Tanpa kalimat pengantar, tanpa penjelasan di luar JSON.`;

    const userPrompt = isEn
      ? `Role: ${role || "Specialist"}\nCompany: ${company || "Company"}\nUser Draft: "${text || "Handled daily divisional operations"}"`
      : `Posisi: ${role || "Staf Profesional"}\nPerusahaan: ${company || "Perusahaan"}\nDraf Pengguna: "${text || "Melakukan tugas operasional harian"}"`;

    const aiRes = (await ai.run("@cf/meta/llama-3.2-3b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.4,
    })) as any;

    let parsed: SentenceSuggestion[] | null = null;

    if (Array.isArray(aiRes?.response)) {
      parsed = aiRes.response;
    } else if (Array.isArray(aiRes)) {
      parsed = aiRes;
    } else {
      let rawText = "";
      if (typeof aiRes === "string") {
        rawText = aiRes;
      } else if (typeof aiRes?.response === "string") {
        rawText = aiRes.response;
      } else {
        rawText = JSON.stringify(aiRes);
      }

      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          // ignore
        }
      }
    }

    if (Array.isArray(parsed) && parsed.length >= 3) {
      const formatted = parsed.slice(0, 3).map((item, idx) => {
        let s = (item.sentence || "").trim();
        s = s.replace(/^(saya|aku|kami)\s+/i, "");
        s = s.replace(/^(i\s+was|i\s+have|i)\s+/i, "");
        s = s.replace(/\b(saya|aku)\s+/gi, "");
        s = s.charAt(0).toUpperCase() + s.slice(1);
        s = s.replace(/(?<!\*)\b(\d+(?:\.\d+)?%)(?!\*)/g, "**$1**");

        return {
          id: String(item.id || idx + 1),
          category: (item.category || (idx === 0 ? "efisiensi" : idx === 1 ? "skala" : "lugas")) as any,
          title: item.title || (isEn ? `Option ${idx + 1}` : `Variasi ${idx + 1}`),
          sentence: s,
          reason: item.reason || (isEn ? "Tailored for ATS screening." : "Disusun sesuai standar ATS."),
        };
      });
      return NextResponse.json({ success: true, data: formatted, source: "ai" });
    }

    const fallback = getBulletSuggestions({ text, role, company, language });
    return NextResponse.json({ success: true, data: fallback, source: "fallback" });
  } catch (err: any) {
    console.error("[API/ai/suggest] Error:", err);
    // Never fail hard - return fallback suggestions
    const fallback = getBulletSuggestions({ text: "", language: "id" });
    return NextResponse.json({
      success: true,
      data: fallback,
      source: "safe-fallback",
    });
  }
}
