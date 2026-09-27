import React, { useState } from 'react';
import { Eye, EyeOff, Scale, History, Tag, BookOpen, ChevronRight, Sparkles, MessageCircle, Wallet } from 'lucide-react';
import { Transaction, User } from '../../types';

interface NasabahDashboardProps {
  user: User;
  transactions: Transaction[];
  onNavigateTab: (tab: string) => void;
  onSelectTransaction: (tx: Transaction) => void;
}

export const NasabahDashboard: React.FC<NasabahDashboardProps> = ({
  user,
  transactions,
  onNavigateTab,
  onSelectTransaction,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  // Hitung total berat yang disetor oleh nasabah ini
  const myTransactions = transactions.filter((t) => t.idNasabah === user.id);
  const totalWeightKg = myTransactions
    .filter((t) => t.subtotal >= 0 && t.beratKg > 0)
    .reduce((acc, curr) => acc + curr.beratKg, 0);

  const totalDeposits = myTransactions.filter((t) => t.subtotal >= 0).length;

  const recentTransactions = myTransactions.slice(0, 3);

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      {/* Greeting Card */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Akun Warga RT 09
          </span>
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            Halo, {user.nama}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ID Nasabah: <span className="font-mono font-bold text-slate-700">{user.id}</span>
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center font-black text-lg border border-[#C8E6C9]">
          {user.nama.charAt(0)}
        </div>
      </div>

      {/* Main Saldo Card (Hijau Tua) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white rounded-3xl p-6 shadow-xl shadow-[#1B5E20]/20 border border-[#43A047]/30">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between text-[#C8E6C9]">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#81C784]" />
              <span className="text-xs font-semibold uppercase tracking-wider">Total Saldo Tabungan</span>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
              aria-label={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight tabular-nums">
              {showBalance ? `Rp ${user.saldo.toLocaleString('id-ID')}` : 'Rp ••••••••'}
            </div>
            <p className="text-xs text-[#A5D6A7] mt-1 font-medium">
              Siap ditarik kapan saja melalui pengurus bank sampah
            </p>
          </div>

          {/* Stats Bar */}
          <div className="pt-3 border-t border-white/15 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] text-[#C8E6C9] font-medium">Total Sampah Disetor</div>
              <div className="text-lg font-extrabold text-white tabular-nums flex items-baseline gap-1">
                <span>{totalWeightKg.toLocaleString('id-ID')}</span>
                <span className="text-xs font-semibold text-[#A5D6A7]">Kg</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-[#C8E6C9] font-medium">Total Kali Setor</div>
              <div className="text-lg font-extrabold text-white tabular-nums">
                {totalDeposits} <span className="text-xs font-semibold text-[#A5D6A7]">Transaksi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onNavigateTab('katalog')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#1B5E20] hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1B5E20] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 leading-tight">Katalog Harga</span>
          <span className="text-[10px] text-slate-400">Cek harga terkini</span>
        </button>

        <button
          onClick={() => onNavigateTab('riwayat')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#1B5E20] hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <History className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 leading-tight">Riwayat Setoran</span>
          <span className="text-[10px] text-slate-400">Nota & mutasi</span>
        </button>

        <button
          onClick={() => onNavigateTab('panduan')}
          className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#1B5E20] hover:shadow-md transition-all text-center flex flex-col items-center justify-center gap-1.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-800 leading-tight">Pilah Sampah</span>
          <span className="text-[10px] text-slate-400">Tips agar mahal</span>
        </button>
      </div>

      {/* Motivational Environmental Banner */}
      <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#1B5E20] text-white flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#A5D6A7]" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-[#1B5E20]">Sampah Terpilah Jadi Berkah!</p>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            Setiap 1 kg kardus dan botol plastik yang Anda setorkan mengurangi beban TPA dan menambah tabungan keluarga.
          </p>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Setoran Terakhir Saya</h3>
          <button
            onClick={() => onNavigateTab('riwayat')}
            className="text-xs font-bold text-[#1B5E20] hover:underline flex items-center gap-0.5"
          >
            <span>Lihat Semua</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada catatan setoran sampah. Ayo pilah sampah di rumah dan bawa ke pos penimbangan RW 09!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isDeposit = tx.subtotal >= 0 && tx.jenis !== 'Tarik Saldo Tunai';
              const dateStr = new Date(tx.tanggal).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDeposit ? 'bg-emerald-100 text-[#1B5E20]' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#1B5E20] transition-colors">
                        {tx.jenis}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {dateStr} {isDeposit && `· ${tx.beratKg} Kg`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-extrabold tabular-nums ${
                        isDeposit ? 'text-[#1B5E20]' : 'text-slate-800'
                      }`}
                    >
                      {isDeposit ? '+' : '-'} Rp {Math.abs(tx.subtotal).toLocaleString('id-ID')}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Buka Nota ›</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* WhatsApp Help CTA */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
        <p className="text-xs text-slate-600 font-medium">
          Ada kendala atau ingin menjadwalkan penjemputan sampah besar?
        </p>
        <a
          href="https://api.whatsapp.com/send?phone=6281234567890&text=Halo%20Pengurus%20Bank%20Sampah%20Kenanga%209,%20saya%20ingin%20bertanya"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Hubungi Pengurus via WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
