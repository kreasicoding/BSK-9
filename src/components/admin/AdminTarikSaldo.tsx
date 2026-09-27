import React, { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle2, UserCheck, DollarSign, Wallet } from 'lucide-react';
import { api } from '../../services/api';
import { Transaction, User } from '../../types';

interface AdminTarikSaldoProps {
  adminUser: User;
  nasabahList: User[];
  onWithdrawSuccess: (newTx: Transaction, newSaldo: number, idNasabah: string) => void;
}

export const AdminTarikSaldo: React.FC<AdminTarikSaldoProps> = ({
  adminUser,
  nasabahList,
  onWithdrawSuccess,
}) => {
  const [selectedNasabahId, setSelectedNasabahId] = useState<string>('');
  const [searchNasabah, setSearchNasabah] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const filteredNasabah = nasabahList.filter(
    (n) =>
      n.nama.toLowerCase().includes(searchNasabah.toLowerCase()) ||
      n.id.toLowerCase().includes(searchNasabah.toLowerCase()) ||
      n.noWa.includes(searchNasabah)
  );

  const activeNasabah = nasabahList.find((n) => n.id === selectedNasabahId);
  const amountNum = parseInt(amountStr.replace(/[^0-9]/g, ''), 10) || 0;
  const isInsufficient = activeNasabah ? amountNum > activeNasabah.saldo : false;

  const handleSelectQuickAmount = (val: number) => {
    if (activeNasabah && val > activeNasabah.saldo) {
      setAmountStr(String(activeNasabah.saldo));
    } else {
      setAmountStr(String(val));
    }
  };

  const handleWithdrawAll = () => {
    if (activeNasabah) {
      setAmountStr(String(activeNasabah.saldo));
    }
  };

  const handleSubmitWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabahId || !activeNasabah) {
      setFeedback({ type: 'error', message: 'Silakan pilih nasabah yang akan menarik saldo.' });
      return;
    }
    if (amountNum <= 0) {
      setFeedback({ type: 'error', message: 'Nominal penarikan harus lebih dari Rp 0.' });
      return;
    }
    if (amountNum > activeNasabah.saldo) {
      setFeedback({
        type: 'error',
        message: `Saldo tidak mencukupi! Maksimal penarikan: Rp ${activeNasabah.saldo.toLocaleString('id-ID')}`,
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await api.withdrawBalance({
        idNasabah: selectedNasabahId,
        jumlah: amountNum,
        dicatatOleh: adminUser.nama,
        keterangan: keterangan.trim() || `Penarikan tunai tabungan warga: ${activeNasabah.nama}`,
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: res.message || `Penarikan Rp ${amountNum.toLocaleString('id-ID')} berhasil dicatat.`,
        });

        const newTx: Transaction = {
          id: res.txId || `WD-${Date.now()}`,
          tanggal: new Date().toISOString(),
          idNasabah: selectedNasabahId,
          namaNasabah: activeNasabah.nama,
          jenis: 'Tarik Saldo Tunai',
          beratKg: 0,
          subtotal: -amountNum,
          dicatatOleh: adminUser.nama,
          keterangan: keterangan.trim() || 'Penarikan tunai tabungan nasabah',
        };

        const newCalculatedSaldo = activeNasabah.saldo - amountNum;
        onWithdrawSuccess(newTx, res.newSaldo ?? newCalculatedSaldo, selectedNasabahId);

        setAmountStr('');
        setKeterangan('');
      } else {
        setFeedback({ type: 'error', message: res.message || 'Gagal memproses penarikan saldo.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan sistem saat menghubungi backend.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-md">
            Pencairan Kas
          </span>
          <span className="text-xs text-slate-500 font-medium">Buku Tabungan Nasabah</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 leading-tight mt-1">Form Tarik Saldo Tabungan</h2>
        <p className="text-xs text-slate-500">Pencatatan uang tunai yang diserahkan kepada warga/nasabah</p>
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

      <form onSubmit={handleSubmitWithdraw} className="space-y-4">
        {/* Pilih Nasabah */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            1. Pilih Nasabah
          </label>

          <input
            type="text"
            value={searchNasabah}
            onChange={(e) => setSearchNasabah(e.target.value)}
            placeholder="Cari nama nasabah atau no. WA..."
            className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
          />

          <select
            value={selectedNasabahId}
            onChange={(e) => {
              setSelectedNasabahId(e.target.value);
              setAmountStr('');
            }}
            className="w-full py-3 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            required
          >
            <option value="">-- Pilih Nasabah --</option>
            {filteredNasabah.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nama} · ({n.id}) · Saldo: Rp {n.saldo.toLocaleString('id-ID')}
              </option>
            ))}
          </select>

          {/* Active Balance Card */}
          {activeNasabah && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#1B5E20] text-white flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5 text-[#81C784]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{activeNasabah.nama}</h4>
                  <p className="text-[11px] text-slate-600">ID: {activeNasabah.id}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold block">Saldo Tabungan Tersedia:</span>
                <span className="text-sm font-black text-[#1B5E20] tabular-nums">
                  Rp {activeNasabah.saldo.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Nominal Penarikan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            2. Nominal Penarikan Tunai
          </label>

          <div className="relative">
            <span className="absolute left-3.5 top-3.5 text-sm font-bold text-slate-400">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={amountStr ? Number(amountStr).toLocaleString('id-ID') : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setAmountStr(raw);
              }}
              placeholder="0"
              className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-lg font-black text-slate-900 tabular-nums focus:outline-none focus:ring-2 ${
                isInsufficient
                  ? 'border-rose-300 bg-rose-50 text-rose-900 focus:ring-rose-500'
                  : 'border-slate-300 bg-slate-50 focus:ring-[#1B5E20]'
              }`}
              required
            />
          </div>

          {/* Warning Saldo Kurang */}
          {isInsufficient && activeNasabah && (
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Nominal melebihi saldo nasabah (Rp {activeNasabah.saldo.toLocaleString('id-ID')})
              </span>
            </p>
          )}

          {/* Quick Amount Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 block">Pilihan Cepat Nominal:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[20000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectQuickAmount(amt)}
                  className="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors text-center cursor-pointer"
                >
                  Rp {amt.toLocaleString('id-ID')}
                </button>
              ))}
              <button
                type="button"
                onClick={handleWithdrawAll}
                disabled={!activeNasabah || activeNasabah.saldo <= 0}
                className="py-2 px-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-900 transition-colors text-center disabled:opacity-40 cursor-pointer"
              >
                Semua Saldo
              </button>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Keperluan / Catatan Penarikan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Pencairan uang belanja bulanan warga"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            />
          </div>
        </div>

        {/* Summary Card & Confirm */}
        {activeNasabah && amountNum > 0 && (
          <div className="bg-[#F8FAF9] p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Saldo Awal:</span>
              <span className="font-bold tabular-nums">Rp {activeNasabah.saldo.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-bold">
              <span>Uang Ditarik:</span>
              <span className="tabular-nums">-Rp {amountNum.toLocaleString('id-ID')}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-black text-sm">
              <span>Sisa Saldo Setelah Tarik:</span>
              <span className="text-[#1B5E20] tabular-nums">
                Rp {Math.max(0, activeNasabah.saldo - amountNum).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedNasabahId || amountNum <= 0 || isInsufficient}
          className="w-full py-4 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Memproses Penarikan Saldo...</span>
            </div>
          ) : (
            <>
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Konfirmasi & Catat Penarikan Tunai</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
