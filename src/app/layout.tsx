import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/config/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  keywords: [
    "ATS resume checker",
    "ATS resume builder",
    "scan CV ATS",
    "buat CV ATS gratis",
    "format resume standar",
    "neo brutalism resume",
    "Cloudflare ATS",
  ],
  authors: [{ name: "Yusuf" }],
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FFF000] text-black">
        {children}
      </body>
    </html>
  );
}
