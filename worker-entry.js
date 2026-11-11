import openNextWorker from "./.open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    globalThis.__CF_ENV__ = env;
    return openNextWorker.fetch(request, env, ctx);
  },
};

export * from "./.open-next/worker.js";
