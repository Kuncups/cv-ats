import { ResumeData } from "@/types/resume";
import { getDb } from "@/db";
import { resumes, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

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

async function getD1Binding(): Promise<D1Database | undefined> {
  try {
    if ((globalThis as any).__CF_ENV__?.DB) {
      return (globalThis as any).__CF_ENV__.DB as D1Database;
    }
  } catch {}

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if ((ctx?.env as any)?.DB) {
      return (ctx.env as any).DB as D1Database;
    }
  } catch {}

  try {
    const cf = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cf?.env?.DB) {
      return cf.env.DB as D1Database;
    }
  } catch {}

  if (typeof process !== "undefined" && (process.env as any).DB) {
    return (process.env as any).DB as D1Database;
  }

  return undefined;
}

export async function syncUserToDb(user: {
  id: string;
  name?: string | null;
  email: string;
  avatarUrl?: string | null;
}): Promise<void> {
  const d1 = await getD1Binding();
  const db = getDb(d1);
  if (!db) return;

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, user.email))
      .get();

    if (existing) {
      await db
        .update(users)
        .set({
          name: user.name || existing.name,
          avatarUrl: user.avatarUrl || existing.avatarUrl,
        })
        .where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({
        id: user.id,
        name: user.name || null,
        email: user.email,
        avatarUrl: user.avatarUrl || null,
        createdAt: new Date(),
      });
    }
  } catch (e) {
    console.warn("[resume-store] Failed to sync user to D1:", e);
  }
}

export async function getUserResumes(userId: string): Promise<StoredResumeRecord[]> {
  const d1 = await getD1Binding();
  const db = getDb(d1);

  if (db) {
    try {
      const records = await db
        .select()
        .from(resumes)
        .where(eq(resumes.userId, userId))
        .orderBy(desc(resumes.updatedAt));

      return records.map((r) => ({
        id: r.id,
        userId: r.userId || userId,
        title: r.title,
        content: JSON.parse(r.contentJson) as ResumeData,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    } catch (e) {
      console.warn("[resume-store] D1 list failed, fallback:", e);
    }
  }

  const list: StoredResumeRecord[] = [];
  for (const record of fallbackStore.values()) {
    if (record.userId === userId) {
      list.push(record);
    }
  }
  return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getResumeById(id: string, userId: string): Promise<StoredResumeRecord | null> {
  const d1 = await getD1Binding();
  const db = getDb(d1);

  if (db) {
    try {
      const record = await db
        .select()
        .from(resumes)
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
        .get();

      if (record) {
        return {
          id: record.id,
          userId: record.userId || userId,
          title: record.title,
          content: JSON.parse(record.contentJson) as ResumeData,
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        };
      }
    } catch (e) {
      console.warn("[resume-store] D1 getById failed, fallback:", e);
    }
  }

  const found = fallbackStore.get(id);
  if (found && found.userId === userId) {
    return found;
  }
  return null;
}

export async function deleteUserResume(id: string, userId: string): Promise<boolean> {
  const d1 = await getD1Binding();
  const db = getDb(d1);

  if (db) {
    try {
      await db
        .delete(resumes)
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
      return true;
    } catch (e) {
      console.warn("[resume-store] D1 delete failed:", e);
    }
  }

  const found = fallbackStore.get(id);
  if (found && found.userId === userId) {
    fallbackStore.delete(id);
    return true;
  }
  return false;
}

export async function renameUserResume(
  id: string,
  userId: string,
  newTitle: string
): Promise<boolean> {
  const title = newTitle.trim();
  if (!title) return false;

  const d1 = await getD1Binding();
  const db = getDb(d1);

  if (db) {
    try {
      await db
        .update(resumes)
        .set({ title, updatedAt: new Date() })
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId)));
      return true;
    } catch (e) {
      console.warn("[resume-store] D1 rename failed:", e);
    }
  }

  const found = fallbackStore.get(id);
  if (found && found.userId === userId) {
    found.title = title;
    found.updatedAt = new Date().toISOString();
    return true;
  }
  return false;
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
  const finalTitle = title?.trim() || content.personal.jobTitle || "Draf Resume";

  const d1 = await getD1Binding();
  const db = getDb(d1);

  if (db) {
    try {
      const existing = await db
        .select()
        .from(resumes)
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
        .get();

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
