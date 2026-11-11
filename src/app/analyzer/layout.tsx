import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cek Skor ATS & Analisis Kata Kunci CV Gratis",
  description:
    "Pindai CV Anda secara instan dan periksa kecocokan kata kunci dengan lowongan kerja impian. Dapatkan skor ATS dan rekomendasi konkret untuk lolos screening HRD.",
  alternates: {
    canonical: "/analyzer",
  },
};

export default function AnalyzerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
