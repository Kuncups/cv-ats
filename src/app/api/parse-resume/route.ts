import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import { validatePdfBuffer } from "@/lib/security";
import { parseResumeFromText } from "@/lib/resume-parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File resume (PDF) wajib diunggah." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const validation = await validatePdfBuffer(arrayBuffer, file.type);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "File PDF tidak valid." },
        { status: 400 }
      );
    }

    const { text } = await extractText(arrayBuffer);
    const extractedText = Array.isArray(text) ? text.join("\n") : text || "";

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        {
          error:
            "Teks tidak terbaca dari file PDF. Dokumen mungkin berupa gambar hasil scan foto atau terproteksi sandi.",
        },
        { status: 400 }
      );
    }

    const parsedData = parseResumeFromText(extractedText);

    return NextResponse.json({
      success: true,
      data: parsedData,
      rawCharCount: extractedText.length,
    });
  } catch (err) {
    console.error("[API/parse-resume] Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Gagal memproses dan mengekstrak dokumen PDF.",
      },
      { status: 500 }
    );
  }
}
