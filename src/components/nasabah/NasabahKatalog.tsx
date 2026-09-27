import React, { useState } from 'react';
import { Search, Calculator, CheckCircle2, Sparkles } from 'lucide-react';
import { WasteCategory } from '../../types';

interface NasabahKatalogProps {
  catalog: WasteCategory[];
}

export const NasabahKatalog: React.FC<NasabahKatalogProps> = ({ catalog }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  // Kalkulator state
  const [calcCategory, setCalcCategory] = useState<string>(catalog[0]?.id || '');
  const [calcWeight, setCalcWeight] = useState<string>('5');

  const categories = ['Semua', 'Plastik', 'Kertas', 'Logam', 'Kaca', 'Minyak', 'Lainnya'];

  const filteredCatalog = catalog.filter((item) => {
    const matchesSearch =
      item.kategori.toLowerCase().includes(search.toLowerCase()) ||
      (item.deskripsi && item.deskripsi.toLowerCase().includes(search.toLowerCase()));

    if (activeCategory === 'Semua') return matchesSearch;
    return matchesSearch && item.kelompok === activeCategory;
  });

  // Hitung hasil kalkulator
  const selectedItem = catalog.find((c) => c.id === calcCategory) || catalog[0];
  const weightNum = parseFloat(calcWeight) || 0;
  const estimatedEarning = selectedItem ? weightNum * selectedItem.hargaPerKg : 0;

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 leading-tight">Katalog Harga Beli Sampah</h2>
        <p className="text-xs text-slate-500">Harga resmi per kilogram yang diterima pengurus Bank Sampah Kenanga 9</p>
      </div>

      {/* Kalkulator Cuan Warga Card */}
      <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white p-5 rounded-3xl shadow-lg shadow-[#1B5E20]/15 space-y-4">
        <div className="flex items-center gap-2 text-[#C8E6C9]">
          <Calculator className="w-5 h-5 text-[#81C784]" />
          <h3 className="text-sm font-bold text-white tracking-wide">Kalkulator Cuan Sampah</h3>
        </div>

        <p className="text-xs text-[#A5D6A7] leading-relaxed">
          Hitung perkiraan uang yang Anda terima saat menyetor sampah hari ini:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-900">
          <div>
            <label className="block text-[11px] font-bold text-[#E8F5E9] mb-1">Pilih Jenis Sampah</label>
            <select
              value={calcCategory}
              onChange={(e) => setCalcCategory(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-white border-0 text-xs font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-[#81C784]"
            >
              {catalog.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.kategori} (Rp {item.hargaPerKg.toLocaleString('id-ID')}/Kg)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#E8F5E9] mb-1">Perkiraan Berat (Kg)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={calcWeight}
                onChange={(e) => setCalcWeight(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-white border-0 text-xs font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-[#81C784]"
                placeholder="Berat dalam Kg"
              />
              <div className="flex gap-1">
                {['1', '5', '10'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setCalcWeight(w)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                  >
                    {w}kg
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Calculation Result */}
        <div className="pt-3 border-t border-white/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#C8E6C9] block">Estimasi Tabungan Anda:</span>
            <span className="text-xl font-black text-white tabular-nums">
              Rp {Math.round(estimatedEarning).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#A5D6A7] font-semibold bg-white/10 px-3 py-1.5 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Langsung masuk saldo!</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jenis sampah (misal: botol, kardus, besi, minyak)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E20] shadow-sm"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#1B5E20] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredCatalog.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#1B5E20] transition-colors space-y-2"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.kelompok || 'Sampah Kering'}
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.kategori}</h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-[#1B5E20] tabular-nums">
                  Rp {item.hargaPerKg.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-slate-500 block font-medium">/ Kilogram</span>
              </div>
            </div>

            {item.deskripsi && (
              <p className="text-xs text-slate-500 bg-[#F8FAF9] p-2.5 rounded-xl border border-slate-100 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50] shrink-0 mt-0.5" />
                <span>{item.deskripsi}</span>
              </p>
            )}
          </div>
        ))}
      </div>

      {filteredCatalog.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-1">
          <p className="text-sm font-bold text-slate-700">Jenis sampah tidak ditemukan</p>
          <p className="text-xs text-slate-500">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      )}
    </div>
  );
};
