import { ArrowUpRight, Search, ShieldCheck } from "lucide-react";
import { Pill } from "@/components/BrutalistBadge";

interface JobPortal {
  name: string;
  logo: string;
  description: string;
  url: string;
}

const JOB_PORTALS: JobPortal[] = [
  {
    name: "Jobstreet",
    logo: "/logos/jobstreet.png",
    description: "Portal lowongan terbesar di Indonesia dengan filter gaji, lokasi, dan tingkat pengalaman.",
    url: "https://www.jobstreet.co.id/",
  },
  {
    name: "LinkedIn Jobs",
    logo: "/logos/linkedin.svg",
    description: "Cocok untuk posisi profesional dan multinasional; bisa langsung terhubung ke rekruter.",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    name: "Glints",
    logo: "/logos/glints.png",
    description: "Banyak lowongan startup, tech, dan remote untuk kandidat muda hingga senior.",
    url: "https://glints.com/id/opportunities/jobs/explore",
  },
  {
    name: "Kalibrr",
    logo: "/logos/kalibrr.png",
    description: "Fokus pada perusahaan ternama dengan proses seleksi terstruktur dan profil kandidat.",
    url: "https://www.kalibrr.com/home/te",
  },
  {
    name: "Indeed",
    logo: "/logos/indeed.svg",
    description: "Agregator lowongan global yang menampilkan estimasi gaji dan ulasan perusahaan.",
    url: "https://id.indeed.com/",
  },
  {
    name: "KitaLulus",
    logo: "/logos/kitalulus.svg",
    description: "Banyak lowongan entry-level, retail, operasional, dan administrasi di seluruh Indonesia.",
    url: "https://www.kitalulus.com/",
  },
  {
    name: "Dealls",
    logo: "/logos/dealls.png",
    description: "Lowongan startup dan tech dengan informasi gaji transparan serta proses rekrutmen cepat.",
    url: "https://dealls.com/",
  },
  {
    name: "TopKarir",
    logo: "/logos/topkarir.png",
    description: "Portal karier lokal dengan banyak lowongan BUMN, perbankan, dan perusahaan swasta.",
    url: "https://www.topkarir.com/",
  },
];

export function JobPortalSection() {
  return (
    <section id="portal-kerja" className="py-12 sm:py-16 px-3 sm:px-6 lg:px-8 bg-black text-white">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b-2 border-white/20">
          <div>
            <Pill variant="blue" className="mb-2">
              LANGKAH SELANJUTNYA
            </Pill>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-none">
              CV Sudah Rapi?<br className="hidden sm:block" /> Saatnya Cari Lowongan.
            </h2>
            <p className="font-mono text-sm sm:text-base text-white/70 mt-3 max-w-2xl">
              Sebarkan CV yang sudah lolos standar ATS ke portal kerja terpercaya berikut. Bandingkan beberapa portal sekaligus agar peluang dipanggil wawancara makin besar.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border border-white/25 bg-white/5 shrink-0">
            <Search className="w-4 h-4 text-[#93C5FD]" />
            <span className="font-mono text-[10px] sm:text-[11px] uppercase text-white/80">
              Rekomendasi portal kerja terpercaya
            </span>
          </div>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {JOB_PORTALS.map((portal) => (
            <a
              key={portal.name}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between gap-3 p-4 bg-white text-black border-2 border-black shadow-[4px_4px_0px_#fff] hover:shadow-[6px_6px_0px_#1D4ED8] hover:-translate-y-0.5 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  {/* Official logo */}
                  <span className="h-11 flex items-center">
                    <img
                      src={portal.logo}
                      alt={`Logo ${portal.name}`}
                      loading="lazy"
                      decoding="async"
                      className="max-h-11 max-w-[150px] w-auto h-auto object-contain object-left"
                    />
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-black/40 group-hover:text-[#1D4ED8] transition-colors shrink-0" />
                </div>

                <p className="font-sans text-[11px] leading-relaxed text-zinc-600">
                  {portal.description}
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase text-[#1D4ED8] pt-2 border-t border-black/10">
                Cari Lowongan
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>

        {/* Disclaimer + Back to Builder */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
          <div className="flex items-start gap-2 max-w-2xl">
            <ShieldCheck className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] sm:text-[11px] text-white/50 leading-relaxed">
              Tips aman: kirim CV dalam format PDF ke portal resmi, hindari berbagi NIK atau rekening bank sebelum proses resmi. Draft CV tidak berafiliasi dengan portal di atas dan tidak menerima komisi dari pelamar.
            </p>
          </div>

          <a
            href="/builder"
            className="brutal-btn bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-black px-6 py-3 text-xs font-mono uppercase inline-flex items-center gap-2 shadow-[3px_3px_0px_#fff] shrink-0"
          >
            <span>PERBAIKI CV DULU</span>
          </a>
        </div>
      </div>
    </section>
  );
}
