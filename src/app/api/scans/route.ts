import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserScans, saveScanRecord } from "@/lib/resume-store";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || session?.user?.email;
  if (!userId) {
    return NextResponse.json({ scans: [] });
  }

  try {
    const scans = await getUserScans(userId, 8);
    return NextResponse.json({ success: true, data: scans });
  } catch (err) {
    console.error("[API/scans] GET Error:", err);
    return NextResponse.json({ error: "Gagal memuat riwayat scan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as any;
    const { targetJobTitle, score, matchedKeywords, missingKeywords } = body;

    const saved = await saveScanRecord(
      userId,
      targetJobTitle || "Posisi Target",
      score || 0,
      matchedKeywords || [],
      missingKeywords || []
    );

    return NextResponse.json({ success: true, data: saved });
  } catch (err) {
    console.error("[API/scans] POST Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan riwayat scan" }, { status: 500 });
  }
}
