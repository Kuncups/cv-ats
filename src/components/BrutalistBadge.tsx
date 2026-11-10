import React from "react";

export function BrutalistStar({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0L14.59 7.41L22 4.59L19.18 12L24 14.59L16.59 17.41L19.41 24L12 21.18L4.59 24L7.41 16.59L0 14.59L4.82 12L2 4.59L9.41 7.41L12 0Z" />
    </svg>
  );
}

export function DoubleArrow({ className = "w-10 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={className}
    >
      <line x1="0" y1="8" x2="30" y2="8" />
      <line x1="0" y1="16" x2="30" y2="16" />
      <polyline points="22,2 32,12 22,22" />
    </svg>
  );
}

export function Pill({
  children,
  variant = "white",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "white" | "black" | "yellow";
  className?: string;
}) {
  const styles = {
    white: "bg-white text-black border-black shadow-[2px_2px_0px_#000]",
    black: "bg-black text-white border-black shadow-[2px_2px_0px_#fff]",
    yellow: "bg-[#FFF000] text-black border-black shadow-[2px_2px_0px_#000]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 text-xs font-bold uppercase tracking-wider ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
