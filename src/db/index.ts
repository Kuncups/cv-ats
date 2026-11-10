/// <reference types="@cloudflare/workers-types" />
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Get Drizzle DB instance from Cloudflare D1 binding or mock for local development.
 */
export function getDb(d1Binding?: D1Database) {
  if (d1Binding) {
    return drizzle(d1Binding, { schema });
  }

  // Graceful fallback for local development before D1 binding is initialized
  return null;
}
