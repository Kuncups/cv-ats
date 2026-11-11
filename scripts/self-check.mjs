import assert from "node:assert";
import { validatePdfBuffer, sanitizeText } from "../src/lib/security.ts";
import { checkRateLimit } from "../src/lib/rate-limit.ts";
import { analyzeCvText, analyzeCvPdf } from "../src/lib/ats-scanner.ts";
import { generateResumePdfBlob } from "../src/lib/pdf-generator.ts";

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

  // 4b. Scanned / Low Word Count Guard Check
  const scannedAnalysis = analyzeCvText("CV Scan image only", "Frontend Developer React");
  assert.ok(
    scannedAnalysis.recommendations.some((r) => r.title.includes("Scan / Gambar")),
    "Scanned/empty text must trigger scan recommendation"
  );

  // 5. PDF Generator & ATS Parser Validation
  const sampleData = {
    personal: {
      fullName: "Budi Santoso",
      jobTitle: "Senior Frontend Engineer",
      email: "budi@example.com",
      phone: "+62 812-3456-7890",
      location: "Jakarta, Indonesia",
      linkedin: "linkedin.com/in/budisantoso",
      github: "github.com/budisantoso",
    },
    summary: "Senior Frontend Engineer dengan 5+ tahun pengalaman membangun sistem web skalabel dengan React dan TypeScript.",
    experience: [
      {
        id: "exp-1",
        role: "Lead Frontend Engineer",
        company: "PT Teknologi Indonesia",
        location: "Jakarta",
        startDate: "2022",
        endDate: "Sekarang",
        bullets: [
          "Memimpin perancangan arsitektur Next.js untuk platform e-commerce dengan 500k pengguna aktif bulanan.",
          "Meningkatkan skor performa Core Web Vitals dari 62 menjadi 95 melalui optimasi gambar dan code-splitting.",
        ],
      },
    ],
    skills: {
      technical: "React, Next.js, TypeScript, JavaScript, Tailwind CSS",
      tools: "Git, Docker, CI/CD, Figma",
      soft: "Agile Scrum, Leadership, Code Review",
    },
    education: [
      {
        id: "edu-1",
        institution: "Institut Teknologi Bandung",
        degree: "Sarjana Teknik Informatika",
        year: "2018 - 2022",
        location: "Bandung",
        details: "IPK: 3.82 / 4.00",
      },
    ],
    projects: [
      {
        id: "proj-1",
        name: "Enterprise Design System",
        techStack: "React, TypeScript, Storybook",
        description: "Membangun 40+ komponen UI reusable dengan cakupan testing 90%.",
        link: "github.com/budisantoso/design-system",
      },
    ],
  };

  const pdfBlob = await generateResumePdfBlob(sampleData);
  const pdfBuffer = await pdfBlob.arrayBuffer();
  const pdfValidation = await validatePdfBuffer(pdfBuffer, "application/pdf");
  assert.strictEqual(pdfValidation.valid, true, "Generated PDF must pass binary magic bytes check");

  const pdfAnalysis = await analyzeCvPdf(pdfBuffer, "Looking for a Senior Frontend Engineer with React, Next.js, and TypeScript.");
  assert.ok(pdfAnalysis.overallScore >= 75, "Generated PDF must score >= 75 in ATS scanner");
  assert.ok(pdfAnalysis.matchedKeywords.includes("react"), "Generated PDF must yield matched keywords");

  // 6. Dynamic Resume Multi-Page Pagination Validation
  const { paginateResume } = await import("../src/lib/resume-paginator.ts");
  const { DEFAULT_SAMPLE_RESUME } = await import("../src/data/resume-presets.ts");
  const singlePage = paginateResume(DEFAULT_SAMPLE_RESUME);
  assert.strictEqual(singlePage.length, 1, "Short CV must be 1 page");
  assert.strictEqual(singlePage[0].pageNumber, 1);
  assert.strictEqual(singlePage[0].hasHeader, true);

  // Multi-page CV test
  const heavyCv = {
    ...DEFAULT_SAMPLE_RESUME,
    experience: [
      { id: "e1", role: "R1", company: "C1", location: "", startDate: "2020", endDate: "2022", isCurrent: false, bullets: ["B1", "B2", "B3"] },
      { id: "e2", role: "R2", company: "C2", location: "", startDate: "2018", endDate: "2020", isCurrent: false, bullets: ["B1", "B2"] },
      { id: "e3", role: "R3", company: "C3", location: "", startDate: "2016", endDate: "2018", isCurrent: false, bullets: ["B1", "B2"] },
      { id: "e4", role: "R4", company: "C4", location: "", startDate: "2014", endDate: "2016", isCurrent: false, bullets: ["B1", "B2"] },
    ],
    projects: [
      { id: "p1", name: "P1", description: "D1", techStack: "", link: "" },
      { id: "p2", name: "P2", description: "D2", techStack: "", link: "" },
      { id: "p3", name: "P3", description: "D3", techStack: "", link: "" },
    ],
  };
  const multiPage = paginateResume(heavyCv);
  assert.ok(multiPage.length >= 2, "Long CV must be paginated into 2 or more sheets");
  assert.strictEqual(multiPage[1].pageNumber, 2);
  assert.strictEqual(multiPage[1].hasHeader, false, "Subsequent pages should use continuation header");

  // 8. Rich Text Tokens & Date Localization Check
  const {
    parseRichTextTokens,
    stripRichText,
    formatLocalizedDate,
    formatLocalizedDateRange,
  } = await import("../src/lib/rich-text-utils.ts");

  const formattedStr = "Menaikkan efisiensi **35%** dan *mengurangi* biaya <u>operasional</u>.";
  const tokens = parseRichTextTokens(formattedStr);
  assert.ok(tokens.some((t) => t.text === "35%" && t.bold === true));
  assert.ok(tokens.some((t) => t.text === "mengurangi" && t.italic === true));
  assert.ok(tokens.some((t) => t.text === "operasional" && t.underline === true));

  // Nested combinations test (***<u>...</u>***)
  const nestedStr = "***<u>Memimpin operasional HR & General Affair untuk 150+ karyawan</u>***";
  const nestedTokens = parseRichTextTokens(nestedStr);
  assert.strictEqual(nestedTokens.length, 1);
  assert.strictEqual(nestedTokens[0].text, "Memimpin operasional HR & General Affair untuk 150+ karyawan");
  assert.strictEqual(nestedTokens[0].bold, true);
  assert.strictEqual(nestedTokens[0].italic, true);
  assert.strictEqual(nestedTokens[0].underline, true);

  const strippedNested = stripRichText(nestedStr);
  assert.strictEqual(strippedNested, "Memimpin operasional HR & General Affair untuk 150+ karyawan");

  // Toggle formatting tests
  const { toggleRichFormat } = await import("../src/components/RichText.tsx");
  const t1 = toggleRichFormat("teks", 0, 4, "bold");
  assert.strictEqual(t1.newValue, "**teks**");
  const t2 = toggleRichFormat(t1.newValue, 0, t1.newValue.length, "bold");
  assert.strictEqual(t2.newValue, "teks"); // Toggled off!

  const tU = toggleRichFormat("***<u>teks</u>***", 0, 15, "underline");
  assert.strictEqual(tU.newValue, "***teks***"); // Underline removed without breaking bold/italic!

  const tB = toggleRichFormat("***teks***", 0, 10, "bold");
  assert.strictEqual(tB.newValue, "*teks*"); // Bold removed, italic preserved!

  const stripped = stripRichText(formattedStr);
  assert.strictEqual(stripped, "Menaikkan efisiensi 35% dan mengurangi biaya operasional.");

  // Test date localization
  assert.strictEqual(formatLocalizedDate("Jan 2022 - Sekarang", "en"), "Jan 2022 - Present");
  assert.strictEqual(formatLocalizedDate("May 2020", "id"), "Mei 2020");
  assert.strictEqual(
    formatLocalizedDateRange("Jan 2020", "Sekarang", "en"),
    "Jan 2020 - Present"
  );
  assert.strictEqual(
    formatLocalizedDateRange("Agu 2019", "Des 2021", "en"),
    "Aug 2019 - Dec 2021"
  );

  // 9. PDF Generation with Rich Text
  const richResume = {
    ...DEFAULT_SAMPLE_RESUME,
    summary: "Berpengalaman mengelola anggaran **Rp 5 Miliar** dan tim *15 orang*.",
    experience: [
      {
        id: "e1",
        role: "Head of Marketing",
        company: "PT Maju Bersama",
        location: "Jakarta",
        startDate: "Jan 2020",
        endDate: "Sekarang",
        isCurrent: true,
        bullets: [
          "Mencapai target pertumbuhan **150% YoY**.",
          "Memimpin kampanye *brand awareness* di <u>3 kota besar</u>.",
        ],
      },
    ],
  };
  const richPdfBlob = await generateResumePdfBlob(richResume);
  assert.ok(richPdfBlob instanceof Blob);
  assert.ok(richPdfBlob.size > 2000, "Rich text PDF should generate valid vector bytes");

  // 10. Sentence Suggestions Engine Validation
  const { getBulletSuggestions } = await import("../src/lib/sentence-suggestions.ts");
  const suggestions = getBulletSuggestions({
    text: "bantu bikin laporan keuangan harian dan cek stok barang di gudang",
    role: "Staff Administrasi & Gudang",
    company: "PT Logistik Sentosa",
    language: "id",
  });
  assert.strictEqual(suggestions.length, 3, "Must return exactly 3 distinct suggestion variations");
  assert.ok(suggestions.some((s) => s.category === "efisiensi"));
  assert.ok(suggestions.some((s) => s.category === "skala"));
  assert.ok(suggestions.some((s) => s.category === "lugas"));
  assert.ok(suggestions[0].sentence.includes("laporan keuangan"), "Must preserve user's domain/task");
  assert.ok(!suggestions[0].sentence.includes("bantu bikin"), "Must strip informal conversational starter");
  assert.ok(suggestions[0].sentence.includes("**"), "Must format metrics with markdown bold");

  // Empty draft starter test
  const emptyStarters = getBulletSuggestions({
    text: "",
    role: "Accountant",
    language: "en",
  });
  assert.strictEqual(emptyStarters.length, 3);
  assert.ok(emptyStarters[0].sentence.includes("Accountant"));

  console.log("✓ All self-checks passed successfully!");
}

runSelfChecks().catch((err) => {
  console.error("Self-check failed:", err);
  process.exit(1);
});
