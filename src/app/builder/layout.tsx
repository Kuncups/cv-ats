import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pembuat CV ATS Gratis — Format 1-Kolom Standar HRD",
  description:
    "Susun CV profesional standar resmi ATS 1-kolom dalam 5 menit. Fitur live preview A4, simpan otomatis, dan unduh PDF resmi tanpa watermark.",
  alternates: {
    canonical: "/builder",
  },
};

export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
