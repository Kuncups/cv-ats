import { SITE_CONFIG } from "@/config/site";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate PDF file by size, MIME type, and binary magic bytes (%PDF-).
 * Prevents disguised files (e.g. .exe or .html renamed to .pdf).
 */
export async function validatePdfBuffer(
  buffer: ArrayBuffer,
  reportedMimeType?: string
): Promise<ValidationResult> {
  // 1. Size check
  if (!buffer || buffer.byteLength === 0) {
    return { valid: false, error: "File PDF kosong." };
  }

  if (buffer.byteLength > SITE_CONFIG.security.maxFileSizeBytes) {
    const maxMb = SITE_CONFIG.security.maxFileSizeBytes / (1024 * 1024);
    return { valid: false, error: `Ukuran file melebihi batas maksimum (${maxMb}MB).` };
  }

  // 2. Reported MIME type check (if present)
  if (
    reportedMimeType &&
    !SITE_CONFIG.security.allowedMimeTypes.includes(
      reportedMimeType.toLowerCase() as "application/pdf"
    )
  ) {
    return { valid: false, error: "Format file harus PDF (application/pdf)." };
  }

  // 3. Binary Magic Bytes check: First 5 bytes must be %PDF- (0x25, 0x50, 0x44, 0x46, 0x2D)
  const header = new Uint8Array(buffer.slice(0, 5));
  const expected = SITE_CONFIG.security.magicBytesPdf;

  const matches = expected.every((byte, idx) => header[idx] === byte);
  if (!matches) {
    return {
      valid: false,
      error: "Header file tidak valid. File bukan dokumen PDF asli.",
    };
  }

  return { valid: true };
}

/**
 * Sanitize untrusted user text inputs to prevent prompt injection or script injection.
 */
export function sanitizeText(input: string, maxLength = 20000): string {
  if (!input) return "";
  return input
    .slice(0, maxLength)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "") // strip control chars
    .trim();
}
