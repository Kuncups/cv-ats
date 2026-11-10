import { ResumeData } from "@/app/builder/page";

export interface StoredResumeRecord {
  id: string;
  userId: string;
  title: string;
  content: ResumeData;
  createdAt: string;
  updatedAt: string;
}

// In-memory / local fallback store when D1 binding is not yet attached
const fallbackStore = new Map<string, StoredResumeRecord>();

export async function saveUserResume(
  userId: string,
  title: string,
  content: ResumeData,
  resumeId?: string
): Promise<StoredResumeRecord> {
  const id = resumeId || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const record: StoredResumeRecord = {
    id,
    userId,
    title: title || content.personal.jobTitle || "Resume Tanpa Judul",
    content,
    createdAt: fallbackStore.get(id)?.createdAt || now,
    updatedAt: now,
  };

  fallbackStore.set(id, record);
  return record;
}

export async function getUserResumes(userId: string): Promise<StoredResumeRecord[]> {
  const records = Array.from(fallbackStore.values()).filter((r) => r.userId === userId);
  return records.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getResumeById(id: string): Promise<StoredResumeRecord | null> {
  return fallbackStore.get(id) || null;
}
