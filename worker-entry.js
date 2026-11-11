import openNextWorker from "./.open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    globalThis.__CF_ENV__ = env;
    if (env) {
      if (typeof process !== "undefined" && process.env) {
        if (env.AUTH_SECRET && !process.env.AUTH_SECRET) process.env.AUTH_SECRET = env.AUTH_SECRET;
        if (env.NEXTAUTH_SECRET && !process.env.NEXTAUTH_SECRET) process.env.NEXTAUTH_SECRET = env.NEXTAUTH_SECRET;
        if (env.AUTH_TRUST_HOST && !process.env.AUTH_TRUST_HOST) process.env.AUTH_TRUST_HOST = env.AUTH_TRUST_HOST;
        if (env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = env.NEXTAUTH_URL;
        if (env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID) process.env.GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
        if (env.GOOGLE_CLIENT_SECRET && !process.env.GOOGLE_CLIENT_SECRET) process.env.GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
        if (env.DB) process.env.DB = env.DB;
      }
    }
    return openNextWorker.fetch(request, env, ctx);
  },
};

export * from "./.open-next/worker.js";
