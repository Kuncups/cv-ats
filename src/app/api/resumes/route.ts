import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveUserResume, getUserResumes } from "@/lib/resume-store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const userId = session.user.id || session.user.email!;
  const resumes = await getUserResumes(userId);

  return NextResponse.json({ success: true, data: resumes });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id && !session?.user?.email) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      title?: string;
      content?: any;
      id?: string;
    };
    const { title, content, id } = body;

    if (!content) {
      return NextResponse.json({ error: "Data resume tidak boleh kosong." }, { status: 400 });
    }

    const userId = session.user.id || session.user.email!;
    const saved = await saveUserResume(userId, title || "Draft CV", content, id);

    return NextResponse.json({ success: true, data: saved });
  } catch (err) {
    console.error("[API/resumes] Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan resume ke cloud." },
      { status: 500 }
    );
  }
}
