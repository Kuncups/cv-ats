"use client";

import React, { useState, useRef, useEffect } from "react";
import { format, parse, isValid, setMonth, setYear } from "date-fns";
import { id as idLocale, enUS as enLocale } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, X } from "lucide-react";

interface MonthYearPickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  canBePresent?: boolean;
  language?: "id" | "en";
  className?: string;
}

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Pilih Bulan & Tahun",
  canBePresent = false,
  language = "id",
  className = "",
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"months" | "calendar">("months");
  const popoverRef = useRef<HTMLDivElement>(null);
  const locale = language === "en" ? enLocale : idLocale;

  // Parse existing value or fallback to today
  const parseCurrentDate = (valStr: string): Date => {
    if (!valStr || /sekarang|present/i.test(valStr)) {
      return new Date();
    }
    // Try "MMM yyyy"
    const parsedMmm = parse(valStr.trim(), "MMM yyyy", new Date(), { locale });
    if (isValid(parsedMmm)) return parsedMmm;

    // Try "yyyy"
    const parsedYyyy = parse(valStr.trim(), "yyyy", new Date(), { locale });
    if (isValid(parsedYyyy)) return parsedYyyy;

    // Try standard date string
    const fallback = new Date(valStr);
    return isValid(fallback) ? fallback : new Date();
  };

  const currentDate = parseCurrentDate(value);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const d = setMonth(new Date(), i);
    return format(d, "MMM", { locale });
  });

  const fullMonthNames = Array.from({ length: 12 }, (_, i) => {
    const d = setMonth(new Date(), i);
    return format(d, "MMMM", { locale });
  });

  const isPresentSelected = /sekarang|present/i.test(value);

  const handleSelectMonth = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    const date = setMonth(setYear(new Date(), selectedYear), monthIndex);
    const formatted = format(date, "MMM yyyy", { locale });
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectDay = (day: Date | undefined) => {
    if (!day) return;
    const formatted = format(day, "MMM yyyy", { locale });
    onChange(formatted);
    setIsOpen(false);
  };

  const handleSelectYearOnly = (year: number) => {
    onChange(String(year));
    setIsOpen(false);
  };

  const handleSelectPresent = () => {
    onChange(language === "en" ? "Present" : "Sekarang");
    setIsOpen(false);
  };

  const years = Array.from({ length: 55 }, (_, i) => new Date().getFullYear() + 2 - i);

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          readOnly
          onClick={() => {
            const parsed = parseCurrentDate(value);
            setSelectedYear(parsed.getFullYear());
            setSelectedMonth(parsed.getMonth());
            setIsOpen(!isOpen);
          }}
          placeholder={placeholder}
          className="w-full p-1.5 pr-8 border border-black text-xs font-sans focus:outline-none focus:ring-1 focus:ring-black bg-white cursor-pointer select-none hover:bg-zinc-50"
        />
        <button
          type="button"
          onClick={() => {
            const parsed = parseCurrentDate(value);
            setSelectedYear(parsed.getFullYear());
            setSelectedMonth(parsed.getMonth());
            setIsOpen(!isOpen);
          }}
          title={language === "en" ? "Open calendar" : "Buka kalender"}
          className={`absolute right-1 p-1 hover:bg-[#FFF000] border border-black/40 text-black transition-colors cursor-pointer ${
            isOpen ? "bg-[#FFF000]" : "bg-zinc-100"
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 w-[280px] bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-3 text-xs font-sans">
          {/* Header controls: Switch mode & close */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/20">
            <span className="font-mono font-bold text-[11px] uppercase tracking-wide">
              {language === "en" ? "Select Month & Year" : "Pilih Bulan & Tahun"}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "months" ? "calendar" : "months")}
                className="px-1.5 py-0.5 border border-black text-[10px] font-mono hover:bg-[#FFF000] cursor-pointer"
                title={viewMode === "months" ? "Mode Kalender Lengkap" : "Mode Grid Bulan"}
              >
                {viewMode === "months" ? "Kalender 📅" : "Grid Bulan ⊞"}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-0.5 hover:bg-zinc-200 text-black cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Present / Sekarang Button (for end dates) */}
          {canBePresent && (
            <button
              type="button"
              onClick={handleSelectPresent}
              className={`w-full mb-2 py-1 px-2 border border-black font-mono text-[11px] font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isPresentSelected
                  ? "bg-[#FFF000] text-black shadow-[1px_1px_0px_#000]"
                  : "bg-zinc-100 hover:bg-[#FFF000]"
              }`}
            >
              <Check className="w-3 h-3" />
              <span>
                {language === "en" ? "Currently Working Here (Present)" : "Sekarang / Masih Bekerja Di Sini"}
              </span>
            </button>
          )}

          {viewMode === "months" ? (
            /* Month & Year Grid Mode */
            <div className="space-y-2">
              {/* Year Navigation Bar */}
              <div className="flex items-center justify-between bg-zinc-100 border border-black p-1">
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="p-1 hover:bg-[#FFF000] border border-black/30 cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent font-mono font-bold text-xs text-center focus:outline-none cursor-pointer"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setSelectedYear((y) => y + 1)}
                  className="p-1 hover:bg-[#FFF000] border border-black/30 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Quick Select Year Only Button */}
              <button
                type="button"
                onClick={() => handleSelectYearOnly(selectedYear)}
                className="w-full py-1 bg-zinc-50 hover:bg-[#FFF000] border border-black text-[11px] font-mono font-bold text-center cursor-pointer transition-colors"
              >
                {language === "en" ? `✓ Set Year Only (${selectedYear})` : `✓ Pilih Hanya Tahun (${selectedYear})`}
              </button>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {monthNames.map((mName, mIdx) => {
                  const isSelected =
                    !isPresentSelected &&
                    currentDate.getFullYear() === selectedYear &&
                    currentDate.getMonth() === mIdx;
                  return (
                    <button
                      key={mIdx}
                      type="button"
                      onClick={() => handleSelectMonth(mIdx)}
                      className={`py-1.5 border border-black font-mono text-xs font-bold text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#FFF000] text-black shadow-[2px_2px_0px_#000]"
                          : "bg-white hover:bg-zinc-100"
                      }`}
                      title={fullMonthNames[mIdx]}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* DayPicker Calendar Mode */
            <div className="flex justify-center [&_.rdp]:m-0 [&_.rdp-caption_label]:font-mono [&_.rdp-caption_label]:text-xs [&_.rdp-day]:text-xs [&_.rdp-head_cell]:text-[10px] [&_.rdp-head_cell]:font-mono">
              <DayPicker
                mode="single"
                selected={currentDate}
                onSelect={handleSelectDay}
                locale={locale}
              />
            </div>
          )}

          {/* Quick Clear Button */}
          <div className="pt-2 mt-2 border-t border-black/20 flex justify-between items-center text-[10px] font-mono">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="text-red-600 hover:underline cursor-pointer"
            >
              {language === "en" ? "Clear" : "Hapus"}
            </button>
            <span className="text-zinc-500">
              ATS: {language === "en" ? "MMM YYYY" : "Bln Thn"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
