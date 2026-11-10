import { NextRequest, NextResponse } from "next/server";
import { validatePdfBuffer, sanitizeText } from "@/lib/security";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyzeCvPdf, analyzeCvText } from "@/lib/ats-scanner";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting per IP
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Batas kuota tercapai. Mohon tunggu ${rateLimit.resetSec} detik sebelum mencoba lagi.`,
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

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const directText = formData.get("directText") as string | null;
    const rawJobDescription = formData.get("jobDescription") as string | null;

    if (!file && !directText) {
      return NextResponse.json(
        { error: "Unggah file resume (PDF) atau kirim teks CV." },
        { status: 400 }
      );
    }

    // 3. Sanitize Job Description
    const sanitizedJd = sanitizeText(
      rawJobDescription || "General Professional Position"
    );

    let result;

    if (directText) {
      // Direct text analysis (bridged from Builder)
      const sanitizedCvText = sanitizeText(directText, 50000);
      result = analyzeCvText(sanitizedCvText, sanitizedJd);
    } else if (file) {
      // PDF File validation & analysis
      const arrayBuffer = await file.arrayBuffer();
      const validation = await validatePdfBuffer(arrayBuffer, file.type);

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || "File PDF tidak valid." },
          { status: 400 }
        );
      }

      result = await analyzeCvPdf(arrayBuffer, sanitizedJd);
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 200,
        headers: {
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "X-RateLimit-Remaining": String(rateLimit.remaining),
        },
      }
    );
  } catch (err) {
    console.error("[API/analyze] Error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan sistem saat menganalisis dokumen.",
      },
      { status: 500 }
    );
  }
}
