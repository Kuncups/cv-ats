"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { BrutalistStar, DoubleArrow, Pill } from "./BrutalistBadge";
import { X, Lock, CheckCircle2, ArrowRight } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#F8F9FA] border-4 border-black shadow-[10px_10px_0px_#000] max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-150 ease-out">
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
            <Pill variant="blue">AKSES RESUME</Pill>
            <BrutalistStar className="w-4 h-4 text-[#1D4ED8]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-black">
            Simpan & Unduh CV Anda
          </h2>
          <p className="font-mono text-xs text-black/80 leading-relaxed">
            Semua data yang Anda ketik <strong>sudah tersimpan aman di browser Anda</strong>. Cukup masukkan email Anda untuk langsung mengunduh file PDF standar ATS ini secara gratis.
          </p>
        </div>

        {/* Email Quick Form */}
        <form onSubmit={handleInstantSignIn} className="space-y-3 bg-white p-4 border-3 border-black shadow-[4px_4px_0px_#000]">
          <div className="flex items-center justify-between pb-2 border-b border-black">
            <span className="font-mono font-bold text-xs uppercase tracking-wider text-black">
              [ MASUK CEPAT GRATIS ]
            </span>
            <span className="text-[10px] font-mono bg-[#1D4ED8] text-white px-1.5 py-0.5 border border-black font-bold shadow-[1px_1px_0px_#000]">
              1-KLIK
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">
              Alamat Email Anda
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
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
              className="w-full p-2 border-2 border-black text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
          </div>

          {error && (
            <div className="p-2 bg-red-100 border border-red-600 text-red-900 text-xs font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full brutal-btn bg-[#1D4ED8] text-white hover:bg-[#2563EB] font-black py-2.5 text-xs font-mono uppercase flex items-center justify-center gap-2 mt-2 shadow-[3px_3px_0px_#000]"
          >
            {loading ? (
              <span>MEMPROSES...</span>
            ) : (
              <>
                <span>MASUK & UNDUH PDF</span>
                <DoubleArrow className="w-5 h-3 text-current" />
              </>
            )}
          </button>
        </form>

        {/* Third Party OAuth Option (If needed) */}
        <div className="mt-4 pt-3 border-t-2 border-black/20 flex items-center justify-between text-[11px] font-mono text-black/70">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span>Tanpa Password • Tanpa Spam</span>
          </div>
          <span>Draft Anda tetap aman</span>
        </div>
      </div>
    </div>
  );
}
