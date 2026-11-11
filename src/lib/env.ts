import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXTAUTH_SECRET: z.string().min(16).default("super-secret-roster-ats-development-key-32chars!"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  
  // Optional Cloudflare Workers AI / External AI API (fallback to heuristic engine if absent)
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Optional OAuth
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env;

export function getEnv(): Env {
  if (parsedEnv) return parsedEnv;

  const result = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GOOGLE_CLIENT_ID:
      process.env.GOOGLE_CLIENT_ID ||
      (globalThis as any)?.__CF_ENV__?.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:
      process.env.GOOGLE_CLIENT_SECRET ||
      (globalThis as any)?.__CF_ENV__?.GOOGLE_CLIENT_SECRET,
  });

  if (!result.success) {
    console.warn("⚠️ [Config] Environment validation warnings:", result.error.format());
    parsedEnv = envSchema.parse({
      NODE_ENV: "development",
      NEXTAUTH_SECRET: "super-secret-roster-ats-development-key-32chars!",
      NEXTAUTH_URL: "http://localhost:3000",
    });
  } else {
    parsedEnv = result.data;
  }

  return parsedEnv;
}
