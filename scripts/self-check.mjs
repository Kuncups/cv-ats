import assert from "node:assert";
import { validatePdfBuffer, sanitizeText } from "../src/lib/security.ts";
import { checkRateLimit } from "../src/lib/rate-limit.ts";
import { analyzeCvText } from "../src/lib/ats-scanner.ts";

async function runSelfChecks() {
  console.log("Running ATS Platform self-checks...");

  // 1. Text Sanitization Check
  const dirty = "Hello \u0000World!\u0007   ";
  const clean = sanitizeText(dirty);
  assert.strictEqual(clean, "Hello World!", "Sanitizer must strip control characters and trim");

  // 2. Binary Magic Bytes PDF Security Check
  // Valid PDF magic bytes: %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  const validResult = await validatePdfBuffer(validPdfHeader.buffer, "application/pdf");
  assert.strictEqual(validResult.valid, true, "Valid %PDF- buffer must pass");

  // Fake PDF (HTML / Executable renamed to .pdf)
  const fakePdfHeader = new Uint8Array([0x3c, 0x21, 0x44, 0x4f, 0x43, 0x54, 0x59, 0x50]); // <!DOCTYP
  const fakeResult = await validatePdfBuffer(fakePdfHeader.buffer, "application/pdf");
  assert.strictEqual(fakeResult.valid, false, "Disguised non-PDF buffer must fail magic bytes check");
  assert.match(fakeResult.error, /Header file tidak valid/i, "Error message must cite invalid header");

  // 3. Rate Limit Sliding Window Check
  const testIp = `test-ip-${Date.now()}`;
  for (let i = 0; i < 10; i++) {
    const res = checkRateLimit(testIp, 10, 60);
    assert.strictEqual(res.success, true, `Request ${i + 1} must succeed within limit`);
  }
  const blocked = checkRateLimit(testIp, 10, 60);
  assert.strictEqual(blocked.success, false, "Request 11 must be rate-limited");
  assert.strictEqual(blocked.remaining, 0, "Remaining tokens must be 0");

  // 4. Direct Text ATS Analysis Check
  const sampleCvText = `
    JOHN DOE
    Frontend Developer
    john@example.com | +62 812-0000-0000 | linkedin.com/in/johndoe
    PROFESSIONAL SUMMARY
    Experienced Frontend Engineer with 4 years building web apps.
    WORK EXPERIENCE
    Software Engineer - PT Digital
    - Spearheaded frontend architecture using React, Next.js and TypeScript.
    - Optimized page load by 35% across 200k monthly users.
    TECHNICAL & CORE SKILLS
    React, Next.js, TypeScript, Tailwind CSS
    EDUCATION
    Universitas Komputer - Teknik Informatika
  `;
  const sampleJd = "Looking for a Frontend Developer with React, Next.js, and TypeScript experience.";
  const analysis = analyzeCvText(sampleCvText, sampleJd);
  assert.ok(analysis.overallScore >= 70, "Realistic CV must score >= 70");
  assert.ok(analysis.matchedKeywords.includes("react"), "React must be matched");
  assert.ok(analysis.matchedKeywords.includes("typescript"), "TypeScript must be matched");

  console.log("✓ All self-checks passed successfully!");
}

runSelfChecks().catch((err) => {
  console.error("Self-check failed:", err);
  process.exit(1);
});
