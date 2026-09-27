import React, { useState } from 'react';
import { Filter, Download, Search, FileText, ChevronRight, Scale, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../../types';

interface AdminRekapitulasiProps {
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export const AdminRekapitulasi: React.FC<AdminRekapitulasiProps> = ({
  transactions,
  onSelectTransaction,
  onRefresh,
  loading = false,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentMonth));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [search, setSearch] = useState<string>('');

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

  // Filtering
  const filtered = transactions.filter((tx) => {
    const d = new Date(tx.tanggal);
    if (selectedMonth && d.getMonth() + 1 !== Number(selectedMonth)) return false;
    if (selectedYear && d.getFullYear() !== Number(selectedYear)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = tx.namaNasabah && tx.namaNasabah.toLowerCase().includes(q);
      const matchId = tx.idNasabah.toLowerCase().includes(q);
      const matchJenis = tx.jenis.toLowerCase().includes(q);
      const matchTxId = tx.id.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchJenis && !matchTxId) return false;
    }

    return true;
  });

  // Aggregations
  const totalDepositRp = filtered
    .filter((t) => t.subtotal > 0)
    .reduce((acc, curr) => acc + curr.subtotal, 0);

  const totalWithdrawnRp = filtered
    .filter((t) => t.subtotal < 0)
    .reduce((acc, curr) => acc + Math.abs(curr.subtotal), 0);

  const totalWeightKg = filtered
    .filter((t) => t.subtotal > 0 && t.beratKg > 0)
    .reduce((acc, curr) => acc + curr.beratKg, 0);

  // Category breakdown for deposits
  const categoryStats: Record<string, { weight: number; rupiah: number }> = {};
  filtered
    .filter((t) => t.subtotal > 0 && t.beratKg > 0)
    .forEach((t) => {
      if (!categoryStats[t.jenis]) {
        categoryStats[t.jenis] = { weight: 0, rupiah: 0 };
      }
      categoryStats[t.jenis].weight += t.beratKg;
      categoryStats[t.jenis].rupiah += t.subtotal;
    });

  const sortedCategories = Object.entries(categoryStats).sort(
    (a, b) => b[1].weight - a[1].weight
  );

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID_Transaksi', 'Tanggal', 'ID_Nasabah', 'Nama_Nasabah', 'Jenis_Sampah', 'Berat_Kg', 'Subtotal_Rp', 'Petugas'];
    const rows = filtered.map((t) => [
      t.id,
      new Date(t.tanggal).toLocaleString('id-ID'),
      t.idNasabah,
      `"${(t.namaNasabah || '').replace(/"/g, '""')}"`,
      `"${t.jenis.replace(/"/g, '""')}"`,
      t.beratKg,
      t.subtotal,
      `"${t.dicatatOleh.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Bank_Sampah_Kenanga_9_${selectedMonth || 'Semua'}_${selectedYear || 'Semua'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white bg-[#1B5E20] px-2.5 py-0.5 rounded-md">
              Laporan Warga
            </span>
            <span className="text-xs text-slate-500 font-medium">Buku Kas & Logistik</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 leading-tight mt-1">Rekapitulasi Transaksi</h2>
          <p className="text-xs text-slate-500">Laporan bulanan/tahunan volume sampah dan perputaran kas warga</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-xs font-bold text-slate-700 shadow-sm transition-all"
          title="Unduh file Excel / CSV"
        >
          <Download className="w-3.5 h-3.5 text-[#1B5E20]" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Pilih Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Pilih Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            >
              {years.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-1">Cari Data</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama nasabah / jenis sampah..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Total Sampah Masuk
          </span>
          <div className="text-xl font-black text-[#1B5E20] tabular-nums mt-0.5">
            {totalWeightKg.toLocaleString('id-ID')} <span className="text-xs font-semibold">Kg</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Nilai Tabungan Warga
          </span>
          <div className="text-xl font-black text-emerald-700 tabular-nums mt-0.5">
            Rp {totalDepositRp.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Total Penarikan Kas
          </span>
          <div className="text-xl font-black text-amber-700 tabular-nums mt-0.5">
            Rp {totalWithdrawnRp.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Jumlah Transaksi
          </span>
          <div className="text-xl font-black text-slate-800 tabular-nums mt-0.5">
            {filtered.length} <span className="text-xs font-semibold">Data</span>
          </div>
        </div>
      </div>

      {/* Breakdown per Jenis Sampah */}
      {sortedCategories.length > 0 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Distribusi Jenis Sampah Terkumpul
          </h3>
          <div className="space-y-2">
            {sortedCategories.map(([catName, stats]) => {
              const percentage = totalWeightKg > 0 ? (stats.weight / totalWeightKg) * 100 : 0;
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{catName}</span>
                    <span className="font-bold text-[#1B5E20] tabular-nums">
                      {stats.weight.toLocaleString('id-ID')} Kg ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#1B5E20] rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider px-1">
          Rincian Transaksi ({filtered.length})
        </h3>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-1">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada data transaksi</p>
            <p className="text-xs text-slate-500">Coba atur filter bulan atau pencarian nama nasabah.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {filtered.map((tx) => {
              const isDeposit = tx.subtotal >= 0 && tx.jenis !== 'Tarik Saldo Tunai';
              const dateStr = new Date(tx.tanggal).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDeposit ? 'bg-emerald-100 text-[#1B5E20]' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isDeposit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-[#1B5E20] transition-colors">
                        {tx.namaNasabah || tx.idNasabah} · <span className="font-normal text-slate-600">{tx.jenis}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {dateStr} {isDeposit && `· ${tx.beratKg} Kg`} · Petugas: {tx.dicatatOleh.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div
                        className={`text-xs font-extrabold tabular-nums ${
                          isDeposit ? 'text-[#1B5E20]' : 'text-slate-800'
                        }`}
                      >
                        {isDeposit ? '+' : '-'} Rp {Math.abs(tx.subtotal).toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Nota ›</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
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
