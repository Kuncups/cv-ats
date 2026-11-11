import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { enhanceResumeContent, AiEnhanceRequest } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const rateLimit = checkRateLimit(clientIp, 25, 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Batas penggunaan AI tercapai. Mohon tunggu ${rateLimit.resetSec} detik.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSec),
          },
        }
      );
    }

    const body = (await req.json()) as Partial<AiEnhanceRequest>;
    if (!body || !body.mode) {
      return NextResponse.json(
        { error: "Parameter mode AI diperlukan (bullet / summary / keyword-suggestion)." },
        { status: 400 }
      );
    }

    const result = await enhanceResumeContent({
      mode: body.mode,
      text: body.text || "",
      role: body.role || "",
      company: body.company || "",
      skills: body.skills || "",
      language: body.language || "id",
    });

    return NextResponse.json({
      success: true,
      data: { result },
    });
  } catch (err) {
    console.error("[API/ai/enhance] Error:", err);
    return NextResponse.json(
      { error: "Gagal memproses peningkatan AI. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
