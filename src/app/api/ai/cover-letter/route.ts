import { NextRequest, NextResponse } from "next/server";
import { sanitizeText } from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit";
import { ResumeData } from "@/types/resume";

async function getAiBinding(): Promise<any> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if ((ctx?.env as any)?.AI) return (ctx.env as any).AI;
  } catch {}

  try {
    const cf = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cf?.env?.AI) return cf.env.AI;
  } catch {}

  try {
    if ((globalThis as any).__CF_ENV__?.AI) return (globalThis as any).__CF_ENV__.AI;
  } catch {}

  return null;
}

function generateFallbackCoverLetter(params: {
  fullName: string;
  email: string;
  phone: string;
  targetRole: string;
  companyName: string;
  jobDescription?: string;
  experienceSummary?: string;
  topSkills?: string;
  language: "id" | "en";
}): string {
  const isEn = params.language === "en";
  const today = new Date().toLocaleDateString(isEn ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const company = params.companyName || (isEn ? "Hiring Team" : "Tim Rekrutmen");
  const role = params.targetRole || (isEn ? "the advertised position" : "posisi yang dibuka");

  if (isEn) {
    return `${today}

Hiring Manager
${params.companyName || "Company Name"}

Subject: Application for ${role} - ${params.fullName}

Dear Hiring Team at ${company},

I am writing to express my strong enthusiasm for the ${role} opening at ${company}. With a solid track record in ${params.topSkills || "delivering high-impact projects"} and proven expertise in ${params.experienceSummary || "driving operational excellence"}, I am confident that my background aligns closely with the goals of your team.

Throughout my professional career, I have consistently focused on executing measurable outcomes and solving complex problems. My experience has equipped me with key competencies in ${params.topSkills || "strategic execution, collaboration, and modern technical workflows"}, which allow me to quickly adapt and add value from day one. I admire ${company}'s dedication to innovation and would be thrilled to contribute to your upcoming initiatives.

Enclosed is my resume providing further details regarding my background and achievements. I welcome the opportunity for an interview to discuss how my skill set and passion can support ${company}'s objectives.

Thank you very much for your time and consideration.

Sincerely,

${params.fullName}
${params.email} | ${params.phone}`;
  }

  return `${today}

Yth. HRD / Tim Rekrutmen
${params.companyName || "Perusahaan"}

Perihal: Lamaran Pekerjaan - ${role}

Dengan hormat,

Sehubungan dengan informasi lowongan pekerjaan untuk posisi ${role} di ${company}, saya bermaksud mengajukan diri untuk bergabung dengan tim Anda. Memiliki latar belakang profesional yang kuat di bidang ${params.topSkills || "pengembangan solusi dan eksekusi proyek"}, saya yakin dapat memberikan kontribusi nyata bagi pencapaian target ${company}.

Selama menempuh perjalanan karier profesional, saya terbiasa bekerja dengan pendekatan berbasis pencapaian terukur, efisiensi kerja, dan kolaborasi lintas fungsi. Berbekal keahlian dalam ${params.topSkills || "kompetensi teknis dan manajerial yang relevan"}, saya siap beradaptasi dengan cepat dan mengimplementasikan solusi terbaik guna mendukung pertumbuhan bisnis perusahaan.

Bersama surat ini, saya lampirkan draf CV resmi yang memuat rincian pengalaman kerja dan rekam jejak saya secara lengkap. Saya sangat menantikan kesempatan wawancara agar dapat menjelaskan lebih lanjut bagaimana kompetensi dan motivasi kerja saya selaras dengan kebutuhan ${company}.

Demikian surat lamaran ini saya sampaikan. Terima kasih atas perhatian dan kesempatan yang Bapak/Ibu berikan.

Hormat saya,

${params.fullName}
${params.email} | ${params.phone}`;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(`cl_${clientIp}`, 12, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Batas permintaan cover letter tercapai. Mohon tunggu ${rateLimit.resetSec} detik.`,
        },
        { status: 429 }
      );
    }

    const body = (await req.json()) as {
      resumeData?: ResumeData;
      companyName?: string;
      targetRole?: string;
      jobDescription?: string;
      language?: "id" | "en";
    };

    const resume = body.resumeData;
    const language = body.language === "en" ? "en" : "id";
    const isEn = language === "en";

    const fullName = sanitizeText(resume?.personal.fullName || "Candidate Name");
    const email = sanitizeText(resume?.personal.email || "");
    const phone = sanitizeText(resume?.personal.phone || "");
    const targetRole = sanitizeText(body.targetRole || resume?.personal.jobTitle || "Professional");
    const companyName = sanitizeText(body.companyName || "Target Company");
    const jobDescription = sanitizeText(body.jobDescription || "", 1500);

    const skills = [
      resume?.skills.technical,
      resume?.skills.tools,
    ]
      .filter(Boolean)
      .join(", ")
      .slice(0, 300);

    const recentExp = resume?.experience?.[0]
      ? `${resume.experience[0].role} di ${resume.experience[0].company}: ${resume.experience[0].bullets.filter(Boolean).slice(0, 2).join("; ")}`
      : "";

    const ai = await getAiBinding();

    if (!ai) {
      const fallback = generateFallbackCoverLetter({
        fullName,
        email,
        phone,
        targetRole,
        companyName,
        jobDescription,
        experienceSummary: recentExp,
        topSkills: skills,
        language,
      });
      return NextResponse.json({ success: true, data: fallback, source: "template" });
    }

    const systemPrompt = isEn
      ? `You are an executive career advisor and professional ATS cover letter writer.
Write a formal, highly compelling 3-4 paragraph cover letter for the candidate applying for the target job.
Highlight key achievements and concrete skills directly from their CV data.
DO NOT use placeholder brackets like [Company] or [Insert Date]. Fill all known information realistically.
Use clean, concise, impactful business writing.`
      : `Anda adalah penasihat karier profesional dan spesialis penulisan surat lamaran kerja (Cover Letter) standar HRD resmi.
Buat surat lamaran kerja 3-4 paragraf yang profesional, elegan, dan menarik bagi HRD untuk posisi sasaran.
Sorot pencapaian terukur dan keahlian dari data CV kandidat secara spesifik.
JANGAN gunakan tanda kurung placeholder seperti [Nama Perusahaan]. Gunakan informasi yang telah diberikan secara natural.`;

    const userPrompt = `Candidate: ${fullName}
Email: ${email}
Phone: ${phone}
Target Position: ${targetRole}
Company Name: ${companyName}
Target Job Requirements: ${jobDescription || "Standard job requirements for " + targetRole}
Key Skills: ${skills}
Recent Experience: ${recentExp}
Language: ${isEn ? "English" : "Bahasa Indonesia"}`;

    const response = await ai.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 700,
      temperature: 0.4,
    });

    const aiText = response?.response?.trim();
    if (aiText && aiText.length > 200) {
      return NextResponse.json({ success: true, data: aiText, source: "ai" });
    }

    const fallback = generateFallbackCoverLetter({
      fullName,
      email,
      phone,
      targetRole,
      companyName,
      jobDescription,
      experienceSummary: recentExp,
      topSkills: skills,
      language,
    });
    return NextResponse.json({ success: true, data: fallback, source: "template" });
  } catch (err) {
    console.error("[CoverLetter API] Error:", err);
    return NextResponse.json(
      { error: "Gagal membuat surat lamaran kerja." },
      { status: 500 }
    );
  }
}
