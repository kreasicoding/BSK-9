import React, { useState } from 'react';
import { X, CheckCircle, Share2, Copy, Printer, Check } from 'lucide-react';
import { Transaction } from '../types';

interface DigitalReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({ transaction, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const isDeposit = transaction.subtotal >= 0 && transaction.jenis !== 'Tarik Saldo Tunai';
  const formattedDate = new Date(transaction.tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = new Date(transaction.tanggal).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const generateReceiptText = () => {
    return `*BUKTI TRANSAKSI DIGITAL*
*BANK SAMPAH KENANGA 9*
RW 09 Kenanga · Bersih Berkah Berdaya
-----------------------------------
No. Nota: ${transaction.id}
Waktu   : ${formattedDate}, ${formattedTime} WIB
Nasabah : ${transaction.namaNasabah || transaction.idNasabah} (${transaction.idNasabah})
Jenis   : ${transaction.jenis}
${isDeposit ? `Berat   : ${transaction.beratKg.toLocaleString('id-ID')} Kg\n` : ''}Total   : Rp ${Math.abs(transaction.subtotal).toLocaleString('id-ID')} (${isDeposit ? 'Masuk Tabungan' : 'Penarikan Tunai'})
Petugas : ${transaction.dicatatOleh}
${transaction.keterangan ? `Catatan : ${transaction.keterangan}\n` : ''}-----------------------------------
Terima kasih telah memilah sampah demi lingkungan yang asri & berkah! 🌱`;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateReceiptText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      alert('Gagal menyalin teks secara otomatis.');
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateReceiptText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Pattern Header */}
        <div className="bg-[#1B5E20] text-white p-5 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            aria-label="Tutup nota"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-2 text-[#81C784] border border-white/20">
            <CheckCircle className="w-7 h-7 text-[#A5D6A7]" />
          </div>

          <h3 className="text-lg font-bold tracking-tight">Nota Transaksi Digital</h3>
          <p className="text-xs text-[#C8E6C9] font-medium">Bank Sampah Kenanga 9</p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Header Metadata */}
          <div className="bg-[#F8FAF9] p-3.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">No. Bukti / ID:</span>
              <span className="font-mono font-bold text-slate-800 tabular-nums">{transaction.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Waktu Transaksi:</span>
              <span className="font-medium text-slate-800">
                {formattedDate} · {formattedTime} WIB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Nama Nasabah:</span>
              <span className="font-semibold text-slate-900">
                {transaction.namaNasabah || transaction.idNasabah}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ID Nasabah:</span>
              <span className="font-mono font-medium text-slate-700">{transaction.idNasabah}</span>
            </div>
          </div>

          {/* Transaction Detail Card */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between pb-2 border-b border-dashed border-slate-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rincian</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  isDeposit ? 'bg-emerald-100 text-[#1B5E20]' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isDeposit ? 'Setoran Sampah' : 'Penarikan Saldo'}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-800">{transaction.jenis}</p>
                {isDeposit && (
                  <p className="text-xs text-slate-500">
                    Berat Bersih: <span className="font-semibold text-slate-700">{transaction.beratKg.toLocaleString('id-ID')} Kg</span>
                  </p>
                )}
                {transaction.keterangan && (
                  <p className="text-xs text-slate-400 italic mt-0.5">{transaction.keterangan}</p>
                )}
              </div>
              <div className="text-right">
                <span className={`text-base font-extrabold tabular-nums ${isDeposit ? 'text-[#1B5E20]' : 'text-slate-900'}`}>
                  {isDeposit ? '+' : '-'} Rp {Math.abs(transaction.subtotal).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-600">Total Nilai</span>
              <span className="text-lg font-black text-[#1B5E20] tabular-nums">
                Rp {Math.abs(transaction.subtotal).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Footer note & Petugas */}
          <div className="text-center pt-1 text-xs text-slate-500 space-y-1">
            <p>
              Dicatat oleh: <strong className="text-slate-700 font-semibold">{transaction.dicatatOleh}</strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Simpan bukti ini sebagai konfirmasi resmi Bank Sampah Kenanga 9.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-[#F8FAF9] border-t border-slate-200 grid grid-cols-2 gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WhatsApp</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
