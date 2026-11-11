import React from "react";
import { parseRichTextTokens } from "@/lib/rich-text-utils";

/**
 * Renders bold (**), italic (*), and underline (<u>) markdown/HTML spans safely.
 */
export function RichText({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  if (!content) return null;
  const tokens = parseRichTextTokens(content);

  return (
    <span className={className}>
      {tokens.map((token, idx) => {
        let el: React.ReactNode = token.text;
        if (token.underline) el = <u key={`u-${idx}`} className="underline decoration-1 underline-offset-2">{el}</u>;
        if (token.italic) el = <em key={`i-${idx}`} className="italic">{el}</em>;
        if (token.bold) el = <strong key={`b-${idx}`} className="font-bold text-black">{el}</strong>;
        return <React.Fragment key={idx}>{el}</React.Fragment>;
      })}
    </span>
  );
}

/**
 * Toggles rich formatting (Bold, Italic, Underline, Bullet) on a text selection
 * removing existing wrappers if already applied (toggle off) or adding them (toggle on).
 */
export function toggleRichFormat(
  currentValue: string,
  start: number,
  end: number,
  format: "bold" | "italic" | "underline" | "bullet"
): { newValue: string; newStart: number; newEnd: number } {
  const selStart = start;
  const selEnd = end;
  const selected = currentValue.substring(selStart, selEnd);

  // Bullet toggle
  if (format === "bullet") {
    if (!selected) {
      const prefix = "\n• ";
      const newValue = currentValue.substring(0, start) + prefix + currentValue.substring(end);
      return { newValue, newStart: start + prefix.length, newEnd: start + prefix.length };
    }
    const lines = selected.split("\n");
    const allBulleted = lines.every((l) => l.trim().startsWith("• ") || l.trim().startsWith("- "));
    const transformed = lines
      .map((l) =>
        allBulleted ? l.replace(/^(\s*)[•-]\s*/, "$1") : (l.startsWith("• ") ? l : `• ${l}`)
      )
      .join("\n");
    const newValue = currentValue.substring(0, selStart) + transformed + currentValue.substring(selEnd);
    return { newValue, newStart: selStart, newEnd: selStart + transformed.length };
  }

  // Underline toggle
  if (format === "underline") {
    const hasTagInside = /<u\b[^>]*>/i.test(selected) && /<\/u>/i.test(selected);
    const isBounded =
      selStart >= 3 &&
      selEnd <= currentValue.length - 4 &&
      currentValue.substring(selStart - 3, selStart).toLowerCase() === "<u>" &&
      currentValue.substring(selEnd, selEnd + 4).toLowerCase() === "</u>";

    if (hasTagInside) {
      const stripped = selected.replace(/<\/?u>/gi, "");
      const newValue = currentValue.substring(0, selStart) + stripped + currentValue.substring(selEnd);
      return { newValue, newStart: selStart, newEnd: selStart + stripped.length };
    }
    if (isBounded) {
      const newValue = currentValue.substring(0, selStart - 3) + selected + currentValue.substring(selEnd + 4);
      return { newValue, newStart: selStart - 3, newEnd: selStart - 3 + selected.length };
    }

    const textToWrap = selected || "garis bawah";
    const wrapped = `<u>${textToWrap}</u>`;
    const newValue = currentValue.substring(0, selStart) + wrapped + currentValue.substring(selEnd);
    return { newValue, newStart: selStart + 3, newEnd: selStart + 3 + textToWrap.length };
  }

  // Bold toggle
  if (format === "bold") {
    const isBounded =
      selStart >= 2 &&
      selEnd <= currentValue.length - 2 &&
      currentValue.substring(selStart - 2, selStart) === "**" &&
      currentValue.substring(selEnd, selEnd + 2) === "**";

    if (isBounded) {
      const newValue = currentValue.substring(0, selStart - 2) + selected + currentValue.substring(selEnd + 2);
      return { newValue, newStart: selStart - 2, newEnd: selStart - 2 + selected.length };
    }

    if (selected.startsWith("***") && selected.endsWith("***") && selected.length >= 6) {
      const inner = selected.slice(3, -3);
      const unwrapped = `*${inner}*`;
      const newValue = currentValue.substring(0, selStart) + unwrapped + currentValue.substring(selEnd);
      return { newValue, newStart: selStart, newEnd: selStart + unwrapped.length };
    }

    if (selected.startsWith("**") && selected.endsWith("**") && selected.length >= 4) {
      const inner = selected.slice(2, -2);
      const newValue = currentValue.substring(0, selStart) + inner + currentValue.substring(selEnd);
      return { newValue, newStart: selStart, newEnd: selStart + inner.length };
    }

    const textToWrap = selected || "teks tebal";
    const wrapped = `**${textToWrap}**`;
    const newValue = currentValue.substring(0, selStart) + wrapped + currentValue.substring(selEnd);
    return { newValue, newStart: selStart + 2, newEnd: selStart + 2 + textToWrap.length };
  }

  // Italic toggle
  if (format === "italic") {
    const beforeIsStar = selStart >= 1 && currentValue[selStart - 1] === "*";
    const before2IsStar = selStart >= 2 && currentValue[selStart - 2] === "*";
    const afterIsStar = selEnd < currentValue.length && currentValue[selEnd] === "*";
    const after2IsStar = selEnd + 1 < currentValue.length && currentValue[selEnd + 1] === "*";
    const isBounded = beforeIsStar && !before2IsStar && afterIsStar && !after2IsStar;

    if (isBounded) {
      const newValue = currentValue.substring(0, selStart - 1) + selected + currentValue.substring(selEnd + 1);
      return { newValue, newStart: selStart - 1, newEnd: selStart - 1 + selected.length };
    }

    if (selected.startsWith("***") && selected.endsWith("***") && selected.length >= 6) {
      const inner = selected.slice(3, -3);
      const unwrapped = `**${inner}**`;
      const newValue = currentValue.substring(0, selStart) + unwrapped + currentValue.substring(selEnd);
      return { newValue, newStart: selStart, newEnd: selStart + unwrapped.length };
    }

    if (
      selected.startsWith("*") &&
      !selected.startsWith("**") &&
      selected.endsWith("*") &&
      !selected.endsWith("**") &&
      selected.length >= 2
    ) {
      const inner = selected.slice(1, -1);
      const newValue = currentValue.substring(0, selStart) + inner + currentValue.substring(selEnd);
      return { newValue, newStart: selStart, newEnd: selStart + inner.length };
    }

    const textToWrap = selected || "teks miring";
    const wrapped = `*${textToWrap}*`;
    const newValue = currentValue.substring(0, selStart) + wrapped + currentValue.substring(selEnd);
    return { newValue, newStart: selStart + 1, newEnd: selStart + 1 + textToWrap.length };
  }

  return { newValue: currentValue, newStart: start, newEnd: end };
}

export function getActiveFormatting(
  value: string,
  start: number,
  end: number
): { bold: boolean; italic: boolean; underline: boolean } {
  if (!value) return { bold: false, italic: false, underline: false };

  const selected = value.substring(start, end);
  const before = value.substring(0, start);

  const underlineOpenCount = (before.match(/<u>/gi) || []).length;
  const underlineCloseCount = (before.match(/<\/u>/gi) || []).length;
  const isInsideUnderline = underlineOpenCount > underlineCloseCount;
  const hasUnderline = /<u\b[^>]*>/i.test(selected) || isInsideUnderline;

  const cleanBefore = before.replace(/<u>.*?<\/u>/gi, "");
  const starsBefore = (cleanBefore.match(/\*\*/g) || []).length;
  const isInsideBold = starsBefore % 2 === 1;
  const hasBold = selected.includes("**") || isInsideBold;

  const singleStarsBefore = (cleanBefore.replace(/\*\*/g, "").match(/\*/g) || []).length;
  const isInsideItalic = singleStarsBefore % 2 === 1;
  const hasItalic = selected.replace(/\*\*/g, "").includes("*") || isInsideItalic;

  return { bold: hasBold, italic: hasItalic, underline: hasUnderline };
}

/**
 * Applies or toggles Bold (**), Italic (*), Underline (<u>), or Bullet (•) on current selection.
 */
export function applyRichFormat(
  inputEl: HTMLInputElement | HTMLTextAreaElement | null,
  format: "bold" | "italic" | "underline" | "bullet",
  currentValue: string,
  onChange: (newValue: string) => void
) {
  const start = inputEl?.selectionStart ?? currentValue.length;
  const end = inputEl?.selectionEnd ?? currentValue.length;

  const result = toggleRichFormat(currentValue, start, end, format);
  onChange(result.newValue);

  if (inputEl) {
    requestAnimationFrame(() => {
      inputEl.focus();
      inputEl.setSelectionRange(result.newStart, result.newEnd);
    });
  }
}

/**
 * Brutalist Rich Text Toolbar with B, I, U, and Bullet buttons
 */
export function RichTextToolbar({
  inputRef,
  value,
  onChange,
  showBullet = true,
}: {
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  value: string;
  onChange: (val: string) => void;
  showBullet?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 bg-zinc-100 p-1 border border-black text-xs font-mono select-none">
      <span className="text-[10px] font-bold text-zinc-500 mr-1 px-1">FORMAT:</span>
      <button
        type="button"
        title="Tebal / Bold (Ctrl+B)"
        onClick={() => applyRichFormat(inputRef.current, "bold", value, onChange)}
        className="w-6 h-6 flex items-center justify-center font-bold font-serif bg-white border border-black hover:bg-blue-100 text-xs transition-colors"
      >
        B
      </button>
      <button
        type="button"
        title="Miring / Italic (Ctrl+I)"
        onClick={() => applyRichFormat(inputRef.current, "italic", value, onChange)}
        className="w-6 h-6 flex items-center justify-center italic font-serif bg-white border border-black hover:bg-blue-100 text-xs transition-colors"
      >
        I
      </button>
      <button
        type="button"
        title="Garis Bawah / Underline (Ctrl+U)"
        onClick={() => applyRichFormat(inputRef.current, "underline", value, onChange)}
        className="w-6 h-6 flex items-center justify-center underline font-serif bg-white border border-black hover:bg-blue-100 text-xs transition-colors"
      >
        U
      </button>
      {showBullet && (
        <button
          type="button"
          title="Tambah Poin Bullet"
          onClick={() => applyRichFormat(inputRef.current, "bullet", value, onChange)}
          className="px-1.5 h-6 flex items-center justify-center bg-white border border-black hover:bg-blue-100 text-[11px] font-mono transition-colors"
        >
          • List
        </button>
      )}
    </div>
  );
}

/**
 * Single-line text input with inline B, I, U buttons and shortcut handlers
 */
export function RichInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [activeFormat, setActiveFormat] = React.useState({ bold: false, italic: false, underline: false });

  const updateFormatState = () => {
    if (!inputRef.current) return;
    const { selectionStart, selectionEnd } = inputRef.current;
    setActiveFormat(getActiveFormatting(value, selectionStart ?? 0, selectionEnd ?? 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyRichFormat(inputRef.current, "bold", value, onChange);
      setTimeout(updateFormatState, 10);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyRichFormat(inputRef.current, "italic", value, onChange);
      setTimeout(updateFormatState, 10);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
      e.preventDefault();
      applyRichFormat(inputRef.current, "underline", value, onChange);
      setTimeout(updateFormatState, 10);
    }
  };

  return (
    <div className="relative flex-1 flex items-center">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          updateFormatState();
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={updateFormatState}
        onSelect={updateFormatState}
        onClick={updateFormatState}
        placeholder={placeholder}
        className={`w-full p-1.5 pr-18 border border-black text-xs font-sans focus:outline-none focus:ring-1 focus:ring-black ${className}`}
      />
      <div className="absolute right-1 flex items-center gap-0.5 bg-zinc-100 border border-black/40 px-1 py-0.5 select-none">
        <button
          type="button"
          tabIndex={-1}
          title="Tebal / Bold (Ctrl+B)"
          onClick={() => {
            applyRichFormat(inputRef.current, "bold", value, onChange);
            setTimeout(updateFormatState, 10);
          }}
          className={`w-4 h-4 text-[10px] font-bold font-serif text-center leading-4 cursor-pointer transition-colors ${
            activeFormat.bold ? "bg-[#1D4ED8] text-white font-black" : "hover:bg-blue-100"
          }`}
        >
          B
        </button>
        <button
          type="button"
          tabIndex={-1}
          title="Miring / Italic (Ctrl+I)"
          onClick={() => {
            applyRichFormat(inputRef.current, "italic", value, onChange);
            setTimeout(updateFormatState, 10);
          }}
          className={`w-4 h-4 text-[10px] italic font-serif text-center leading-4 cursor-pointer transition-colors ${
            activeFormat.italic ? "bg-[#1D4ED8] text-white font-black" : "hover:bg-blue-100"
          }`}
        >
          I
        </button>
        <button
          type="button"
          tabIndex={-1}
          title="Garis Bawah (Ctrl+U)"
          onClick={() => {
            applyRichFormat(inputRef.current, "underline", value, onChange);
            setTimeout(updateFormatState, 10);
          }}
          className={`w-4 h-4 text-[10px] underline font-serif text-center leading-4 cursor-pointer transition-colors ${
            activeFormat.underline ? "bg-[#1D4ED8] text-white font-black" : "hover:bg-blue-100"
          }`}
        >
          U
        </button>
      </div>
    </div>
  );
}

/**
 * Multi-line textarea with formatting toolbar and shortcut handlers
 */
export function RichTextarea({
  value,
  onChange,
  placeholder,
  rows = 5,
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeFormat, setActiveFormat] = React.useState({ bold: false, italic: false, underline: false });

  const updateFormatState = () => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd } = textareaRef.current;
    setActiveFormat(getActiveFormatting(value, selectionStart ?? 0, selectionEnd ?? 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyRichFormat(textareaRef.current, "bold", value, onChange);
      setTimeout(updateFormatState, 10);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyRichFormat(textareaRef.current, "italic", value, onChange);
      setTimeout(updateFormatState, 10);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
      e.preventDefault();
      applyRichFormat(textareaRef.current, "underline", value, onChange);
      setTimeout(updateFormatState, 10);
    }
  };

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between bg-zinc-100 p-1.5 border-2 border-black border-b-0 text-xs font-mono select-none">
        <span className="text-[10px] font-bold text-zinc-600">FORMATTING:</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            tabIndex={-1}
            title="Tebal / Bold (Ctrl+B)"
            onClick={() => {
              applyRichFormat(textareaRef.current, "bold", value, onChange);
              setTimeout(updateFormatState, 10);
            }}
            className={`px-2 py-0.5 border border-black font-bold font-serif text-xs transition-colors cursor-pointer ${
              activeFormat.bold ? "bg-[#1D4ED8] text-white shadow-[1px_1px_0px_#000]" : "bg-white hover:bg-blue-100"
            }`}
          >
            B
          </button>
          <button
            type="button"
            tabIndex={-1}
            title="Miring / Italic (Ctrl+I)"
            onClick={() => {
              applyRichFormat(textareaRef.current, "italic", value, onChange);
              setTimeout(updateFormatState, 10);
            }}
            className={`px-2 py-0.5 border border-black italic font-serif text-xs transition-colors cursor-pointer ${
              activeFormat.italic ? "bg-[#1D4ED8] text-white shadow-[1px_1px_0px_#000]" : "bg-white hover:bg-blue-100"
            }`}
          >
            I
          </button>
          <button
            type="button"
            tabIndex={-1}
            title="Garis Bawah / Underline (Ctrl+U)"
            onClick={() => {
              applyRichFormat(textareaRef.current, "underline", value, onChange);
              setTimeout(updateFormatState, 10);
            }}
            className={`px-2 py-0.5 border border-black underline font-serif text-xs transition-colors cursor-pointer ${
              activeFormat.underline ? "bg-[#1D4ED8] text-white shadow-[1px_1px_0px_#000]" : "bg-white hover:bg-blue-100"
            }`}
          >
            U
          </button>
          <button
            type="button"
            tabIndex={-1}
            title="Tambah Poin Bullet"
            onClick={() => {
              applyRichFormat(textareaRef.current, "bullet", value, onChange);
              setTimeout(updateFormatState, 10);
            }}
            className="px-2 py-0.5 bg-white border border-black hover:bg-blue-100 text-[11px] font-mono transition-colors cursor-pointer"
          >
            • Bullet
          </button>
        </div>
      </div>
      <textarea
        ref={textareaRef}
        rows={rows}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          updateFormatState();
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={updateFormatState}
        onSelect={updateFormatState}
        onClick={updateFormatState}
        placeholder={placeholder}
        className={`w-full p-3 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-black leading-relaxed ${className}`}
      />
    </div>
  );
}
