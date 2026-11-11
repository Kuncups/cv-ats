import React, { useState, useEffect, useCallback } from "react";
import { SentenceSuggestion, getBulletSuggestions } from "@/lib/sentence-suggestions";
import { RichText } from "@/components/RichText";
import { Check, Copy, Sparkles, X, Lightbulb, RefreshCw } from "lucide-react";

interface SentenceSuggestionBoxProps {
  currentText: string;
  role?: string;
  company?: string;
  language?: "id" | "en";
  initialSuggestions?: SentenceSuggestion[];
  onApply: (sentence: string) => void;
  onClose: () => void;
  isEnglish?: boolean;
}

export function SentenceSuggestionBox({
  currentText,
  role = "",
  company = "",
  language = "id",
  initialSuggestions,
  onApply,
  onClose,
  isEnglish = false,
}: SentenceSuggestionBoxProps) {
  const [suggestions, setSuggestions] = useState<SentenceSuggestion[]>(
    initialSuggestions && initialSuggestions.length > 0
      ? initialSuggestions
      : getBulletSuggestions({ text: currentText, role, company, language })
  );
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchDynamicSuggestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: currentText,
          role,
          company,
          language: isEnglish ? "en" : "id",
        }),
      });
      const json = (await res.json()) as { success?: boolean; data?: SentenceSuggestion[] };
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        setSuggestions(json.data);
      }
    } catch (err) {
      console.warn("Dynamic AI fetch failed, using local engine fallback:", err);
      setSuggestions(getBulletSuggestions({ text: currentText, role, company, language }));
    } finally {
      setIsLoading(false);
    }
  }, [currentText, role, company, isEnglish, language]);

  useEffect(() => {
    fetchDynamicSuggestions();
  }, [fetchDynamicSuggestions]);

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
              ? "ATS Sentence Suggestions"
              : "Saran Alternatif Kalimat ATS"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={fetchDynamicSuggestions}
            className="text-[11px] font-mono font-bold text-[#1D4ED8] hover:text-black flex items-center gap-1 cursor-pointer disabled:opacity-50"
            title="Generate variasi saran baru"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">
              {isEnglish ? "Regenerate" : "Variasi Baru"}
            </span>
          </button>
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
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="p-5 bg-white border border-black shadow-[1px_1px_0px_#000] flex flex-col items-center justify-center gap-2 text-center">
          <div className="w-5 h-5 border-2 border-black border-t-[#1D4ED8] rounded-full animate-spin" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-black">
            {isEnglish
              ? "Analyzing your context & generating 3 distinct options..."
              : "Sedang menganalisis konteks dan merancang 3 variasi kalimat..."}
          </span>
          <span className="font-mono text-[10px] text-black/60">
            {isEnglish
              ? "Tailored dynamically to your authentic duties without templates"
              : "Menyesuaikan tugas pekerjaan asli Anda secara dinamis tanpa template kaku"}
          </span>
        </div>
      ) : (
        /* Suggestion Cards */
        <div className="space-y-2">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="p-2.5 bg-white border border-black shadow-[1px_1px_0px_#000] hover:border-[#1D4ED8] transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-blue-50 border border-black/40 text-[#1D4ED8]">
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
      )}

      {/* Footer Helper */}
      <div className="text-[10px] font-mono text-black/60 flex items-center justify-between pt-1">
        <span>
          {isEnglish
            ? "Tip: Choose one option to replace, or keep your own draft."
            : "Tips: Pilih salah satu saran untuk mengganti, atau tetap pakai tulisan asli Anda."}
        </span>
      </div>
    </div>
  );
}
