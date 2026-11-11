import { ResumeData } from "@/types/resume";
import { getDb } from "@/db";
import { resumes } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface StoredResumeRecord {
  id: string;
  userId: string;
  title: string;
  content: ResumeData;
  createdAt: string;
  updatedAt: string;
}

// In-memory fallback store when D1 binding is not yet attached
const fallbackStore = new Map<string, StoredResumeRecord>();

function getD1Binding(): D1Database | undefined {
  if (typeof process !== "undefined" && (process.env as any).DB) {
    return (process.env as any).DB as D1Database;
  }
  return undefined;
}

export async function saveUserResume(
  userId: string,
  title: string,
  content: ResumeData,
  resumeId?: string
): Promise<StoredResumeRecord> {
  const id = resumeId || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const nowIso = now.toISOString();
  const finalTitle = title || content.personal.jobTitle || "Resume Tanpa Judul";

  const db = getDb(getD1Binding());
  if (db) {
    try {
      const existing = await db.select().from(resumes).where(eq(resumes.id, id)).get();
      if (existing) {
        await db
          .update(resumes)
          .set({
            title: finalTitle,
            contentJson: JSON.stringify(content),
            updatedAt: now,
          })
          .where(eq(resumes.id, id));
        return {
          id,
          userId,
          title: finalTitle,
          content,
          createdAt: existing.createdAt.toISOString(),
          updatedAt: nowIso,
        };
      } else {
        await db.insert(resumes).values({
          id,
          userId,
          title: finalTitle,
          contentJson: JSON.stringify(content),
          createdAt: now,
          updatedAt: now,
        });
        return {
          id,
          userId,
          title: finalTitle,
          content,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
      }
    } catch (e) {
      console.warn("[resume-store] D1 save failed, falling back to local store:", e);
    }
  }

  const record: StoredResumeRecord = {
    id,
    userId,
    title: finalTitle,
    content,
    createdAt: fallbackStore.get(id)?.createdAt || nowIso,
    updatedAt: nowIso,
  };

  fallbackStore.set(id, record);
  return record;
}
