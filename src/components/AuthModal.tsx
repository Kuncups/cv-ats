"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { BrutalistStar, Pill } from "./BrutalistBadge";
import { X, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signIn("google", { callbackUrl: window.location.href });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk dengan Google.");
      setGoogleLoading(false);
    }
  };

  const handleInstantSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Masukkan alamat email Anda.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        name: name || email.split("@")[0],
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F8F9FA] border-3 sm:border-4 border-black shadow-[5px_5px_0px_#000] sm:shadow-[10px_10px_0px_#000] max-w-md w-full p-4 sm:p-8 relative animate-in zoom-in-95 duration-150 ease-out max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-black text-white border-2 border-black flex items-center justify-center hover:bg-[#1D4ED8] transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <Pill variant="blue">AKSES CLOUD CV</Pill>
            <BrutalistStar className="w-4 h-4 text-[#1D4ED8]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-black">
            Simpan & Kelola Multi-Draf CV
          </h2>
          <p className="font-mono text-xs text-black/80 leading-relaxed">
            Masuk dengan Google untuk menyimpan otomatis banyak draf CV Anda di cloud, akses dari perangkat mana pun, dan unduh PDF gratis.
          </p>
        </div>

        {/* Google Primary Button */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={googleLoading || loading}
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-zinc-100 text-black border-3 border-black font-black py-3 px-4 text-xs font-mono uppercase flex items-center justify-center gap-3 shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? "MENGHUBUNGKAN..." : "MASUK DENGAN GOOGLE"}</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-black/30"></div>
            <span className="flex-shrink mx-2 text-[10px] font-mono text-black/60 uppercase font-bold">
              ATAU MASUK DENGAN EMAIL
            </span>
            <div className="flex-grow border-t border-black/30"></div>
          </div>

          {/* Email Quick Form */}
          <form onSubmit={handleInstantSignIn} className="space-y-3 bg-white p-3.5 border-2 border-black shadow-[3px_3px_0px_#000]">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full p-2 border border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">
                Nama Lengkap (Opsional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full p-2 border border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            {error && (
              <div className="p-2 bg-red-100 border border-red-600 text-red-900 text-xs font-mono">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full brutal-btn bg-[#1D4ED8] text-white hover:bg-[#2563EB] font-black py-2.5 text-xs font-mono uppercase flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              {loading ? (
                <span>MEMPROSES...</span>
              ) : (
                <span>MASUK DENGAN EMAIL</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t-2 border-black/20 flex items-center justify-between text-[11px] font-mono text-black/70">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span>Tanpa Password • Tanpa Biaya</span>
          </div>
          <span>Draf tersimpan di cloud</span>
        </div>
      </div>
    </div>
  );
}
