import React, { useState } from "react";
import { SentenceSuggestion } from "@/lib/sentence-suggestions";
import { RichText } from "@/components/RichText";
import { Check, Copy, Sparkles, X, Lightbulb } from "lucide-react";

interface SentenceSuggestionBoxProps {
  suggestions: SentenceSuggestion[];
  currentText: string;
  onApply: (sentence: string) => void;
  onClose: () => void;
  isEnglish?: boolean;
}

export function SentenceSuggestionBox({
  suggestions,
  currentText,
  onApply,
  onClose,
  isEnglish = false,
}: SentenceSuggestionBoxProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (id: string, sentence: string) => {
    try {
      await navigator.clipboard.writeText(sentence.replace(/\*\*/g, ""));
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="mt-2 p-3 bg-zinc-50 border-2 border-black shadow-[3px_3px_0px_#000] space-y-3 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black">
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-black uppercase">
          <Lightbulb className="w-3.5 h-3.5 text-[#1D4ED8]" />
          <span>
            {isEnglish
              ? "ATS Sentence Suggestions (Formula Google X-Y-Z)"
              : "Saran Perbaikan Kalimat ATS (Formula Google X-Y-Z)"}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-black/60 hover:text-black font-mono text-xs font-bold flex items-center gap-0.5 cursor-pointer px-1"
          title="Tutup saran"
        >
          <X className="w-3.5 h-3.5" />
          <span>{isEnglish ? "Close" : "Tutup"}</span>
        </button>
      </div>

      {/* Suggestion Cards */}
      <div className="space-y-2">
        {suggestions.map((item) => (
          <div
            key={item.id}
            className="p-2.5 bg-white border border-black shadow-[1px_1px_0px_#000] hover:border-[#1D4ED8] transition-colors space-y-1.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-zinc-100 border border-black/40 text-black">
                {item.title}
              </span>
              <span className="text-[10px] font-mono text-black/60 italic hidden sm:inline">
                {item.reason}
              </span>
            </div>

            <div className="text-xs font-sans text-black leading-relaxed">
              <RichText content={item.sentence} />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleCopy(item.id, item.sentence)}
                className="px-2 py-1 text-[10px] font-mono font-bold bg-white hover:bg-zinc-100 border border-black flex items-center gap-1 cursor-pointer"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3 h-3 text-green-600" />
                    <span>{isEnglish ? "Copied" : "Tersalin"}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-black/70" />
                    <span>{isEnglish ? "Copy" : "Salin"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onApply(item.sentence)}
                className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#1D4ED8] hover:bg-[#2563EB] text-white border border-black flex items-center gap-1 cursor-pointer shadow-[1px_1px_0px_#000]"
              >
                <Sparkles className="w-3 h-3" />
                <span>{isEnglish ? "Use This Sentence" : "Gunakan Kalimat Ini"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Helper */}
      <div className="text-[10px] font-mono text-black/60 flex items-center justify-between pt-1">
        <span>
          {isEnglish
            ? "Tip: Click 'Use This Sentence' to replace, or keep your own draft."
            : "Tips: Klik 'Gunakan Kalimat Ini' untuk menerapkan, atau tetap pakai tulisan asli Anda."}
        </span>
      </div>
    </div>
  );
}
