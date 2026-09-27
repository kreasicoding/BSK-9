import React, { useState } from 'react';
import { Filter, Scale, ChevronRight, FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction, User } from '../../types';

interface NasabahRiwayatProps {
  user: User;
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const NasabahRiwayat: React.FC<NasabahRiwayatProps> = ({
  user,
  transactions,
  onSelectTransaction,
  onRefresh,
  loading = false,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentMonth));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));

  const months = [
    { value: '', label: 'Semua Bulan' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
  ];

  const years = [
    { value: '', label: 'Semua Tahun' },
    { value: '2026', label: '2026' },
    { value: '2025', label: '2025' },
    { value: '2024', label: '2024' },
  ];

  // Filter transaksi nasabah aktif
  const myTransactions = transactions.filter((t) => t.idNasabah === user.id);

  const filteredTransactions = myTransactions.filter((t) => {
    const d = new Date(t.tanggal);
    if (selectedMonth && d.getMonth() + 1 !== Number(selectedMonth)) return false;
    if (selectedYear && d.getFullYear() !== Number(selectedYear)) return false;
    return true;
  });

  // Hitung agregasi untuk filter aktif
  const totalDepositRp = filteredTransactions
    .filter((t) => t.subtotal > 0)
    .reduce((acc, curr) => acc + curr.subtotal, 0);

  const totalWithdrawnRp = filteredTransactions
    .filter((t) => t.subtotal < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.subtotal), 0);

  const totalWeightKg = filteredTransactions
    .filter((t) => t.subtotal > 0 && t.beratKg > 0)
    .reduce((acc, curr) => acc + curr.beratKg, 0);

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 leading-tight">Riwayat Setoran</h2>
          <p className="text-xs text-slate-500">Daftar buku tabungan & nota digital Anda</p>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-xs font-bold text-[#1B5E20] bg-[#E8F5E9] hover:bg-[#C8E6C9] px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Memuat...' : 'Segarkan Data'}
          </button>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Filter className="w-3.5 h-3.5 text-[#1B5E20]" />
          <span>Filter Periode:</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            >
              {years.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Period Summary Metric */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#F8FAF9] p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium block">Sampah Disetor</span>
            <span className="text-xs font-black text-[#1B5E20] tabular-nums">
              {totalWeightKg.toLocaleString('id-ID')} Kg
            </span>
          </div>

          <div className="bg-[#F8FAF9] p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium block">Uang Tabungan</span>
            <span className="text-xs font-black text-emerald-700 tabular-nums">
              +Rp {totalDepositRp.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="bg-[#F8FAF9] p-2 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-500 font-medium block">Penarikan Tunai</span>
            <span className="text-xs font-black text-amber-700 tabular-nums">
              -Rp {totalWithdrawnRp.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
          Daftar Transaksi ({filteredTransactions.length})
        </h3>

        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-700">Tidak ada transaksi</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Tidak ditemukan catatan transaksi pada periode yang dipilih. Silakan ubah filter bulan atau tahun di atas.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {filteredTransactions.map((tx) => {
              const isDeposit = tx.subtotal >= 0 && tx.jenis !== 'Tarik Saldo Tunai';
              const dateObj = new Date(tx.tanggal);
              const formattedDate = dateObj.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isDeposit ? 'bg-emerald-100 text-[#1B5E20]' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#1B5E20] transition-colors">
                          {tx.jenis}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{formattedDate}</span>
                        {isDeposit && (
                          <>
                            <span>·</span>
                            <span className="font-semibold text-slate-700">{tx.beratKg} Kg</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div
                        className={`text-sm font-black tabular-nums ${
                          isDeposit ? 'text-[#1B5E20]' : 'text-slate-800'
                        }`}
                      >
                        {isDeposit ? '+' : '-'} Rp {Math.abs(tx.subtotal).toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Buka Nota</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
