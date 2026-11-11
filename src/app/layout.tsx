import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE_CONFIG } from "@/config/site";
import { AuthSessionProvider } from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "cek skor cv",
    "ats resume checker gratis",
    "buat cv ats",
    "cv ats friendly indonesia",
    "format cv 1 kolom",
    "contoh cv standar hrd",
    "analisis kata kunci cv",
    "template resume ats gratis",
    "cara lolos screening cv",
    "draft cv",
    "resume builder indonesia",
    "rapikan cv",
    "lamar kerja",
  ],
  authors: [{ name: "Muhammad Yusuf", url: SITE_CONFIG.url }],
  creator: "Draft CV",
  publisher: "Draft CV",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#1D4ED8",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_CONFIG.url}/#website`,
      url: SITE_CONFIG.url,
      name: SITE_CONFIG.name,
      description: SITE_CONFIG.description,
      inLanguage: "id-ID",
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_CONFIG.url}/#webapp`,
      url: SITE_CONFIG.url,
      name: "Draft CV — ATS Resume Checker & Builder",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript",
      offers: {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "IDR",
      },
      featureList: [
        "Cek skor kesesuaian kata kunci CV dengan lowongan",
        "Pembuat CV 1-kolom standar resmi ATS",
        "Unduh PDF bersih dan rapi gratis tanpa watermark",
      ],
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-blueprint text-black">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
