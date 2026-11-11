export interface TextSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * Parses markdown/HTML inline tags (**bold**, *italic*, <u>underline</u>, <b>, <i>)
 * with full recursive nesting support (e.g. ***<u>text</u>*** -> bold + italic + underline).
 */
export function parseRichTextTokens(raw: string): TextSpan[] {
  if (!raw) return [];

  // Normalize common HTML aliases
  const normalized = raw
    .replace(/<strong\b[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b\b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em\b[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<i\b[^>]*>(.*?)<\/i>/gi, "*$1*");

  interface StyleState {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  }

  function parseRecursive(str: string, state: StyleState): TextSpan[] {
    const spans: TextSpan[] = [];
    let i = 0;
    let textBuffer = "";

    function flushBuffer() {
      if (textBuffer.length > 0) {
        spans.push({
          text: textBuffer,
          ...(state.bold ? { bold: true } : {}),
          ...(state.italic ? { italic: true } : {}),
          ...(state.underline ? { underline: true } : {}),
        });
        textBuffer = "";
      }
    }

    while (i < str.length) {
      // 1. Check for <u>...</u> (case-insensitive)
      if (str.slice(i, i + 3).toLowerCase() === "<u>") {
        const closeIdx = str.toLowerCase().indexOf("</u>", i + 3);
        if (closeIdx !== -1) {
          flushBuffer();
          const inner = str.slice(i + 3, closeIdx);
          spans.push(...parseRecursive(inner, { ...state, underline: true }));
          i = closeIdx + 4;
          continue;
        }
      }

      // 2. Check for ***...*** (bold + italic)
      if (str.startsWith("***", i)) {
        const closeIdx = str.indexOf("***", i + 3);
        if (closeIdx !== -1) {
          flushBuffer();
          const inner = str.slice(i + 3, closeIdx);
          spans.push(...parseRecursive(inner, { ...state, bold: true, italic: true }));
          i = closeIdx + 3;
          continue;
        }
      }

      // 3. Check for **...** (bold)
      if (str.startsWith("**", i)) {
        const closeIdx = str.indexOf("**", i + 2);
        if (closeIdx !== -1) {
          flushBuffer();
          const inner = str.slice(i + 2, closeIdx);
          spans.push(...parseRecursive(inner, { ...state, bold: true }));
          i = closeIdx + 2;
          continue;
        }
      }

      // 4. Check for *...* (italic) - ignore if part of **
      if (str[i] === "*" && !str.startsWith("**", i)) {
        let closeIdx = -1;
        for (let j = i + 1; j < str.length; j++) {
          if (str[j] === "*" && str[j - 1] !== "*" && str[j + 1] !== "*") {
            closeIdx = j;
            break;
          }
        }
        if (closeIdx !== -1) {
          flushBuffer();
          const inner = str.slice(i + 1, closeIdx);
          spans.push(...parseRecursive(inner, { ...state, italic: true }));
          i = closeIdx + 1;
          continue;
        }
      }

      // Regular character
      textBuffer += str[i];
      i++;
    }

    flushBuffer();
    return spans;
  }

  const rawSpans = parseRecursive(normalized, {
    bold: false,
    italic: false,
    underline: false,
  });

  // Merge consecutive spans with identical formatting
  const merged: TextSpan[] = [];
  for (const span of rawSpans) {
    if (!span.text) continue;
    const prev = merged[merged.length - 1];
    if (
      prev &&
      Boolean(prev.bold) === Boolean(span.bold) &&
      Boolean(prev.italic) === Boolean(span.italic) &&
      Boolean(prev.underline) === Boolean(span.underline)
    ) {
      prev.text += span.text;
    } else {
      merged.push({ ...span });
    }
  }

  return merged;
}

/**
 * Strips formatting tags recursively to return plain text for ATS scoring / search
 */
export function stripRichText(raw: string): string {
  if (!raw) return "";
  let clean = raw;
  let prev = "";
  while (clean !== prev) {
    prev = clean;
    clean = clean
      .replace(/<[^>]*>/g, "")
      .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1");
  }
  return clean;
}

/**
 * Localizes date strings for ID / EN contexts (e.g. "Sekarang" <-> "Present")
 */
export function formatLocalizedDate(dateStr: string, lang: "id" | "en"): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();

  if (lang === "en") {
    return trimmed
      .replace(/sekarang/gi, "Present")
      .replace(/\bJanuari\b/gi, "January")
      .replace(/\bFebruari\b/gi, "February")
      .replace(/\bMaret\b/gi, "March")
      .replace(/\bMei\b/gi, "May")
      .replace(/\bJuni\b/gi, "June")
      .replace(/\bJuli\b/gi, "July")
      .replace(/\bAgustus\b/gi, "August")
      .replace(/\bAgu\b/gi, "Aug")
      .replace(/\bOktober\b/gi, "October")
      .replace(/\bOkt\b/gi, "Oct")
      .replace(/\bDesember\b/gi, "December")
      .replace(/\bDes\b/gi, "Dec");
  }

  return trimmed
    .replace(/present/gi, "Sekarang")
    .replace(/\bJanuary\b/gi, "Januari")
    .replace(/\bFebruary\b/gi, "Februari")
    .replace(/\bMarch\b/gi, "Maret")
    .replace(/\bMay\b/gi, "Mei")
    .replace(/\bJune\b/gi, "Juni")
    .replace(/\bJuly\b/gi, "Juli")
    .replace(/\bAugust\b/gi, "Agustus")
    .replace(/\bAug\b/gi, "Agu")
    .replace(/\bOctober\b/gi, "Oktober")
    .replace(/\bOct\b/gi, "Okt")
    .replace(/\bDecember\b/gi, "Desember")
    .replace(/\bDec\b/gi, "Des");
}

export function formatLocalizedDateRange(
  startDate: string,
  endDate: string,
  lang: "id" | "en"
): string {
  const start = formatLocalizedDate(startDate, lang);
  const end = formatLocalizedDate(endDate, lang);
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
}
