import React, { useState } from 'react';
import { Layers, Lock, Phone, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';
import { isUsingLiveScript } from '../config';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onOpenConfig: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onOpenConfig }) => {
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isLive = isUsingLiveScript();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan Nomor WhatsApp atau ID Nasabah Anda.');
      return;
    }
    if (!pin.trim()) {
      setErrorMessage('Silakan masukkan PIN 6 digit Anda.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login(identifier.trim(), pin.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Login gagal. Periksa kembali No. WA/ID dan PIN.');
      }
    } catch {
      setErrorMessage('Terjadi kendala saat menghubungi server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoId: string, demoPin: string) => {
    setIdentifier(demoId);
    setPin(demoPin);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col justify-between p-4 sm:p-6 text-[#212529]">
      <div className="max-w-md w-full mx-auto pt-6 pb-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-[#1B5E20] flex items-center justify-center text-white shadow-xl shadow-[#1B5E20]/20 mx-auto">
            <Layers className="w-9 h-9 text-[#81C784]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1B5E20] tracking-tight">
              Bank Sampah Kenanga 9
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              Tabungan Sampah Warga RW 09 Kenanga
            </p>
          </div>
        </div>

        {/* Status Mode Banner */}
        <div
          onClick={onOpenConfig}
          className={`cursor-pointer p-3 rounded-2xl border flex items-center justify-between text-xs font-medium transition-all ${
            isLive
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300/80 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>
              {isLive ? 'Terhubung ke Google Sheets Live' : 'Mode Demo Aktif (Klik untuk Pengaturan)'}
            </span>
          </div>
          <span className="text-[11px] underline font-bold">
            {isLive ? 'Cek Koneksi' : 'Setup Sheets'}
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-7 space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">Masuk Akun</h2>
            <p className="text-xs text-slate-500">
              Gunakan nomor WhatsApp terdaftar atau ID Nasabah Anda
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed animate-shake">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input WhatsApp / ID */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                No. WhatsApp atau ID Nasabah
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: 081298765432 atau NSB001"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:bg-white transition-all"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Input PIN */}
            <div>
              <label
                htmlFor="pin"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                PIN Keamanan (6 Digit)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  id="pin"
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-base tracking-widest font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:bg-white transition-all"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#1B5E20]/20 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </div>
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Selector */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Coba Cepat Akun Demo (1-Klik):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('081298765432', '112233')}
                className="p-2.5 text-left rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 transition-colors"
              >
                <div className="text-xs font-bold text-emerald-950">Warga / Nasabah</div>
                <div className="text-[11px] text-emerald-800">Ibu Siti Aminah (RT 09)</div>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo('081234567890', '123456')}
                className="p-2.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="text-xs font-bold text-slate-900">Pengurus / Admin</div>
                <div className="text-[11px] text-slate-600">Pak Bambang (Ketua RT 09)</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security / Info footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 text-center">
          <ShieldCheck className="w-4 h-4 text-[#4CAF50]" />
          <span>Autentikasi Aman Server-side Google Sheets & Apps Script</span>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 py-3">
        © 2026 Bank Sampah Kenanga 9 · RW 09 Kenanga
      </div>
    </div>
  );
};
