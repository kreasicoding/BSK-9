import React, { useState } from 'react';
import { Scale, Plus, Trash2, CheckCircle2, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { DepositItemInput, Transaction, User, WasteCategory } from '../../types';

interface AdminSetorCepatProps {
  adminUser: User;
  nasabahList: User[];
  catalog: WasteCategory[];
  onDepositSuccess: (newTx: Transaction, newSaldo: number, idNasabah: string) => void;
  onRefreshData?: () => void;
}

export const AdminSetorCepat: React.FC<AdminSetorCepatProps> = ({
  adminUser,
  nasabahList,
  catalog,
  onDepositSuccess,
}) => {
  const [selectedNasabahId, setSelectedNasabahId] = useState<string>('');
  const [searchNasabah, setSearchNasabah] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // List barang setoran
  const defaultCategory = catalog[0] || {
    id: 'SMP01',
    kategori: 'Kardus Bekas Kering',
    hargaPerKg: 2500,
  };

  const [items, setItems] = useState<DepositItemInput[]>([
    {
      kategoriId: defaultCategory.id,
      kategori: defaultCategory.kategori,
      beratKg: 1,
      hargaPerKg: defaultCategory.hargaPerKg,
      subtotal: defaultCategory.hargaPerKg * 1,
    },
  ]);

  // Nasabah filter
  const filteredNasabah = nasabahList.filter(
    (n) =>
      n.nama.toLowerCase().includes(searchNasabah.toLowerCase()) ||
      n.id.toLowerCase().includes(searchNasabah.toLowerCase()) ||
      n.noWa.includes(searchNasabah)
  );

  const activeNasabah = nasabahList.find((n) => n.id === selectedNasabahId);

  // Item management
  const handleItemCategoryChange = (index: number, catId: string) => {
    const selectedCat = catalog.find((c) => c.id === catId);
    if (!selectedCat) return;

    setItems((prev) => {
      const updated = [...prev];
      const berat = updated[index].beratKg;
      updated[index] = {
        kategoriId: selectedCat.id,
        kategori: selectedCat.kategori,
        beratKg: berat,
        hargaPerKg: selectedCat.hargaPerKg,
        subtotal: Math.round(berat * selectedCat.hargaPerKg),
      };
      return updated;
    });
  };

  const handleItemWeightChange = (index: number, weightVal: number) => {
    const safeWeight = isNaN(weightVal) || weightVal < 0 ? 0 : weightVal;
    setItems((prev) => {
      const updated = [...prev];
      const rate = updated[index].hargaPerKg;
      updated[index] = {
        ...updated[index],
        beratKg: safeWeight,
        subtotal: Math.round(safeWeight * rate),
      };
      return updated;
    });
  };

  const addWeightQuickly = (index: number, delta: number) => {
    setItems((prev) => {
      const updated = [...prev];
      const newWeight = Math.max(0.1, Number((updated[index].beratKg + delta).toFixed(2)));
      updated[index] = {
        ...updated[index],
        beratKg: newWeight,
        subtotal: Math.round(newWeight * updated[index].hargaPerKg),
      };
      return updated;
    });
  };

  const addItemRow = () => {
    const defaultCat = catalog[0] || { id: 'SMP01', kategori: 'Sampah', hargaPerKg: 2000 };
    setItems((prev) => [
      ...prev,
      {
        kategoriId: defaultCat.id,
        kategori: defaultCat.kategori,
        beratKg: 1,
        hargaPerKg: defaultCat.hargaPerKg,
        subtotal: defaultCat.hargaPerKg * 1,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotalRupiah = items.reduce((acc, curr) => acc + curr.subtotal, 0);
  const grandTotalBeratKg = items.reduce((acc, curr) => acc + curr.beratKg, 0);

  // Submit Handler
  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabahId) {
      setFeedback({ type: 'error', message: 'Silakan pilih nasabah/warga terlebih dahulu.' });
      return;
    }
    if (grandTotalBeratKg <= 0 || grandTotalRupiah <= 0) {
      setFeedback({ type: 'error', message: 'Berat sampah harus lebih besar dari 0 kg.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const depositPayload = {
        idNasabah: selectedNasabahId,
        items: items.map((it) => ({
          kategori: it.kategori,
          beratKg: it.beratKg,
          hargaPerKg: it.hargaPerKg,
          subtotal: it.subtotal,
        })),
        dicatatOleh: adminUser.nama,
        keterangan: keterangan.trim() || undefined,
      };

      const res = await api.addDeposit(depositPayload);

      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || 'Setoran berhasil dicatat ke saldo nasabah!',
        });

        const createdTx: Transaction = res.transactions && res.transactions[0]
          ? res.transactions[0]
          : {
              id: `TRX-${Date.now()}`,
              tanggal: new Date().toISOString(),
              idNasabah: selectedNasabahId,
              namaNasabah: activeNasabah?.nama || selectedNasabahId,
              jenis: items.map((i) => i.kategori).join(', '),
              beratKg: grandTotalBeratKg,
              subtotal: grandTotalRupiah,
              dicatatOleh: adminUser.nama,
              keterangan: keterangan,
            };

        const newCalculatedSaldo = (activeNasabah?.saldo || 0) + grandTotalRupiah;
        onDepositSuccess(createdTx, res.newSaldo || newCalculatedSaldo, selectedNasabahId);

        // Reset form items
        setItems([
          {
            kategoriId: defaultCategory.id,
            kategori: defaultCategory.kategori,
            beratKg: 1,
            hargaPerKg: defaultCategory.hargaPerKg,
            subtotal: defaultCategory.hargaPerKg * 1,
          },
        ]);
        setKeterangan('');
      } else {
        setFeedback({ type: 'error', message: res.message || 'Gagal menyimpan setoran.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan sistem saat menghubungi backend.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white bg-[#1B5E20] px-2.5 py-0.5 rounded-md">
            Portal Pengurus
          </span>
          <span className="text-xs text-slate-500 font-medium">Pos Penimbangan RW 09</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 leading-tight mt-1">Form Setor Cepat (Timbangan)</h2>
        <p className="text-xs text-slate-500">Pilih nasabah, masukkan timbangan, dan simpan saldo secara otomatis</p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-rose-50 text-rose-900 border border-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmitDeposit} className="space-y-4">
        {/* Step 1: Pilih Nasabah */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            1. Pilih Warga / Nasabah
          </label>

          {/* Quick Filter Search */}
          <input
            type="text"
            value={searchNasabah}
            onChange={(e) => setSearchNasabah(e.target.value)}
            placeholder="Cari nama nasabah atau no. WA..."
            className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
          />

          <select
            value={selectedNasabahId}
            onChange={(e) => setSelectedNasabahId(e.target.value)}
            className="w-full py-3 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            required
          >
            <option value="">-- Pilih Nasabah Terdaftar ({filteredNasabah.length}) --</option>
            {filteredNasabah.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nama} · ({n.id}) · Saldo: Rp {n.saldo.toLocaleString('id-ID')}
              </option>
            ))}
          </select>

          {/* Active Nasabah Preview Card */}
          {activeNasabah && (
            <div className="p-3.5 bg-[#E8F5E9] rounded-2xl border border-[#C8E6C9] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#1B5E20] text-white flex items-center justify-center font-bold text-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{activeNasabah.nama}</h4>
                  <p className="text-[11px] text-slate-600">
                    ID: {activeNasabah.id} · WA: {activeNasabah.noWa}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-semibold block">Saldo Saat Ini:</span>
                <span className="text-xs font-black text-[#1B5E20] tabular-nums">
                  Rp {activeNasabah.saldo.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Input Item Sampah & Berat Timbangan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Rincian Timbangan Sampah
            </label>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1B5E20] bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Baris</span>
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl border border-slate-200 bg-[#F8FAF9] space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {index + 1}
                    </span>
                    <span>Jenis Sampah</span>
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Hapus baris ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown Kategori */}
                <select
                  value={item.kategoriId}
                  onChange={(e) => handleItemCategoryChange(index, e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
                >
                  {catalog.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.kategori} · Rp {cat.hargaPerKg.toLocaleString('id-ID')}/Kg
                    </option>
                  ))}
                </select>

                {/* Berat Input + Quick Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Berat Timbangan (Kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.05"
                      value={item.beratKg}
                      onChange={(e) => handleItemWeightChange(index, parseFloat(e.target.value))}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B5E20] tabular-nums"
                      required
                    />
                    <div className="flex gap-1 mt-1.5">
                      {[0.5, 1, 5, 10].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => addWeightQuickly(index, d)}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700"
                        >
                          +{d}kg
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block">Subtotal</span>
                      <span className="text-sm font-black text-[#1B5E20] tabular-nums">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      @ Rp {item.hargaPerKg.toLocaleString('id-ID')} / Kg
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Keterangan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Catatan / Keterangan (Opsional)
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Kondisi kering, botol bersih tanpa tutup"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            />
          </div>
        </div>

        {/* Kalkulasi Ringkasan & Tombol Simpan */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-4 shadow-xl shadow-slate-900/10">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Total Berat Bersih</span>
              <span className="text-base font-extrabold text-white tabular-nums">
                {grandTotalBeratKg.toLocaleString('id-ID')} Kg
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Uang Ditambahkan ke Saldo</span>
              <span className="text-2xl font-black text-[#81C784] tabular-nums">
                +Rp {grandTotalRupiah.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {activeNasabah && (
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Estimasi Saldo Baru Warga:</span>
              <span className="font-bold text-white tabular-nums">
                Rp {((activeNasabah.saldo || 0) + grandTotalRupiah).toLocaleString('id-ID')}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !selectedNasabahId || grandTotalBeratKg <= 0}
            className="w-full py-4 px-4 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#1B5E20]/30 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menyimpan ke Google Sheets...</span>
              </div>
            ) : (
              <>
                <Scale className="w-5 h-5 text-[#81C784]" />
                <span>Simpan Setoran & Terbitkan Nota Digital</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
