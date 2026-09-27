import React from 'react';
import { LogOut, Wifi, HelpCircle, Layers, ZoomIn, ZoomOut } from 'lucide-react';
import { User } from '../types';
import { isUsingLiveScript } from '../config';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onOpenConfig?: () => void;
  largeFont: boolean;
  onToggleFont: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onOpenConfig,
  largeFont,
  onToggleFont,
}) => {
  const isLive = isUsingLiveScript();

  return (
    <header className="sticky top-0 z-30 bg-[#1B5E20] text-white shadow-md border-b border-[#2E7D32]">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0 border border-white/20">
            <Layers className="w-5 h-5 text-[#81C784]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-white leading-tight truncate">
              Bank Sampah Kenanga 9
            </h1>
            <p className="text-[11px] text-[#A5D6A7] font-medium leading-none truncate">
              RW 09 Kenanga · Bersih Berkah Berdaya
            </p>
          </div>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Elderly-friendly font toggle */}
          <button
            onClick={onToggleFont}
            title={largeFont ? 'Kembalikan ukuran huruf normal' : 'Perbesar huruf untuk kenyamanan baca'}
            className="h-9 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 text-xs text-[#E8F5E9] font-medium border border-white/10"
            aria-label="Ubah ukuran huruf"
          >
            {largeFont ? <ZoomOut className="w-4 h-4 text-[#C8E6C9]" /> : <ZoomIn className="w-4 h-4 text-[#C8E6C9]" />}
            <span className="hidden sm:inline">{largeFont ? 'Huruf Normal' : 'Huruf Besar'}</span>
          </button>

          {/* Connection Status Indicator */}
          {onOpenConfig && (
            <button
              onClick={onOpenConfig}
              title={isLive ? 'Terhubung ke Google Apps Script Live' : 'Mode Simulasi / Demo Lokal. Klik untuk hubungkan Google Sheets.'}
              className={`h-9 px-2.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold border ${
                isLive
                  ? 'bg-[#2E7D32] hover:bg-[#388E3C] text-emerald-100 border-emerald-400/30'
                  : 'bg-amber-600/90 hover:bg-amber-600 text-amber-100 border-amber-400/30'
              }`}
            >
              <Wifi className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-300' : 'text-amber-200'}`} />
              <span className="hidden xs:inline">{isLive ? 'Sheets Live' : 'Mode Demo'}</span>
            </button>
          )}

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-1 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                  {user.nama.split(' ')[0]}
                </div>
                <div className="text-[10px] text-[#C8E6C9] uppercase tracking-wide">
                  {user.role === 'admin' ? 'Pengurus' : 'Nasabah'}
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Keluar dari akun"
                className="h-9 w-9 rounded-lg bg-red-600/80 hover:bg-red-600 transition-colors flex items-center justify-center text-white border border-red-500/30 active:scale-95"
                aria-label="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
