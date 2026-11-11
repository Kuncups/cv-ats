import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserResumes,
  saveUserResume,
  deleteUserResume,
  getResumeById,
  renameUserResume,
  syncUserToDb,
} from "@/lib/resume-store";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  if (session?.user?.email) {
    syncUserToDb({
      id: userId,
      name: session.user.name,
      email: session.user.email,
      avatarUrl: session.user.image,
    }).catch(() => {});
  }

  const { searchParams } = new URL(req.url);
  const resumeId = searchParams.get("id");

  try {
    if (resumeId) {
      const resume = await getResumeById(resumeId, userId);
      if (!resume) {
        return NextResponse.json({ error: "Draf CV tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: resume });
    }

    const resumes = await getUserResumes(userId);
    return NextResponse.json({ success: true, data: resumes });
  } catch (err) {
    console.error("[API/resumes] GET Error:", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar draf CV." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 300 * 1024) {
    return NextResponse.json(
      { error: "Ukuran data resume melebihi batas (maks. 300KB)." },
      { status: 413 }
    );
  }

  try {
    const body = (await req.json()) as {
      title?: string;
      content?: any;
      id?: string;
    };
    const { title, content, id } = body;

    if (!content || typeof content !== "object") {
      return NextResponse.json({ error: "Data resume tidak valid." }, { status: 400 });
    }

    const contentStr = JSON.stringify(content);
    if (contentStr.length > 300 * 1024) {
      return NextResponse.json(
        { error: "Ukuran konten resume melebihi batas (maks. 300KB)." },
        { status: 413 }
      );
    }

    const saved = await saveUserResume(userId, title || "Draf CV", content, id);

    return NextResponse.json({ success: true, data: saved });
  } catch (err) {
    console.error("[API/resumes] POST Error:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan resume ke cloud." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const resumeId = searchParams.get("id");

  if (!resumeId) {
    return NextResponse.json({ error: "Parameter ID draf diperlukan." }, { status: 400 });
  }

  try {
    const deleted = await deleteUserResume(resumeId, userId);
    return NextResponse.json({ success: deleted });
  } catch (err) {
    console.error("[API/resumes] DELETE Error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus draf CV." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id || session?.user?.email;
  if (!userId) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { id?: string; title?: string };
    const { id, title } = body;

    if (!id || !title?.trim()) {
      return NextResponse.json(
        { error: "ID dan nama baru draf wajib diisi." },
        { status: 400 }
      );
    }

    const renamed = await renameUserResume(id, userId, title.trim());
    return NextResponse.json({ success: renamed });
  } catch (err) {
    console.error("[API/resumes] PATCH Error:", err);
    return NextResponse.json(
      { error: "Gagal mengganti nama draf CV." },
      { status: 500 }
    );
  }
}
