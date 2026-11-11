"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, UserCheck, LogOut, Menu, X } from "lucide-react";
import { BrutalistStar } from "./BrutalistBadge";
import { AuthModal } from "./AuthModal";
import { SITE_CONFIG } from "@/config/site";

export function Header() {
  const { data: session, status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="w-full bg-white border-b-3 border-black sticky top-0 z-50 no-print font-sans">
        {/* Main Navigation Bar */}
        <div className="w-full px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1D4ED8] text-white flex items-center justify-center font-sans font-black text-lg sm:text-xl border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
              [D]
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-sans font-black text-xl sm:text-2xl tracking-tighter uppercase text-black leading-none">
                  Draft CV
                </span>
                <BrutalistStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1D4ED8]" />
              </div>
              <span className="hidden sm:block text-[10px] font-mono font-bold tracking-wider text-black/70">
                BANTU RAPIKAN CV & TINGKATKAN PELUANG KERJA
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-sm font-bold">
            {SITE_CONFIG.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 text-black hover:bg-[#1D4ED8] hover:text-white border-2 border-transparent hover:border-black transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {status === "loading" ? (
              <div className="h-8 sm:h-9 w-20 sm:w-28 bg-zinc-100 border-2 border-black animate-pulse" />
            ) : session?.user ? (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white text-black font-bold px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] text-[11px] sm:text-xs font-mono">
                <UserCheck className="w-3.5 h-3.5 text-[#1D4ED8] shrink-0" />
                <span className="font-black uppercase max-w-[80px] xs:max-w-[110px] sm:max-w-[160px] truncate">
                  {session.user.name || session.user.email?.split("@")[0]}
                </span>
                <span className="text-black/30">|</span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-black/60 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1 font-bold"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">KELUAR</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#1D4ED8] hover:bg-[#2563EB] text-white font-black px-2.5 sm:px-4 py-1.5 sm:py-2 border-2 border-black shadow-[2px_2px_0px_#000] sm:shadow-[3px_3px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-[11px] sm:text-xs font-mono uppercase cursor-pointer shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">LOGIN / REGISTER</span>
                <span className="xs:hidden">MASUK</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              aria-label="Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t-2 border-black bg-white px-4 py-3 flex flex-col gap-1 font-mono text-xs font-bold animate-in slide-in-from-top-2 duration-150">
            {SITE_CONFIG.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-black hover:bg-[#1D4ED8] hover:text-white border-2 border-transparent hover:border-black transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </>
  );
}
