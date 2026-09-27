import React from 'react';
import { CheckCircle, AlertTriangle, Calendar, MapPin, Sparkles } from 'lucide-react';

export const NasabahPanduan: React.FC = () => {
  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div>
        <h2 className="text-xl font-black text-slate-900 leading-tight">Panduan Pilah Sampah</h2>
        <p className="text-xs text-slate-500">Kiat agar sampah bernilai jual tinggi & mudah ditimbang</p>
      </div>

      {/* Schedule Banner */}
      <div className="bg-[#E8F5E9] border border-[#C8E6C9] p-4 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-[#1B5E20]">
          <Calendar className="w-5 h-5 text-[#2E7D32]" />
          <h3 className="text-sm font-bold">Jadwal Penimbangan Rutin Warga</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
          <div className="bg-white p-3 rounded-2xl border border-[#C8E6C9]">
            <p className="font-bold text-slate-900">🗓️ Setiap Hari Minggu (Pekan 1 & 3)</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Pukul 07.30 - 11.00 WIB</p>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-[#C8E6C9]">
            <p className="font-bold text-slate-900 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#1B5E20]" />
              <span>Pos Balai Warga RW 09 Kenanga</span>
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5">Depan Taman Kenanga Asri</p>
          </div>
        </div>
      </div>

      {/* 3 Golden Rules */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1B5E20]" />
          <span>3 Langkah Emas Memilah Sampah di Rumah</span>
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#1B5E20] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Bersihkan Sisa Minuman & Makanan</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Bilas botol plastik, gelas kemasan, atau kaleng dari sisa sirup/manis agar tidak mengundang semut dan bau busuk di rumah.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#1B5E20] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Keringkan & Pipihkan (Hemat Ruang)</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Injak atau pipihkan kardus dan botol plastik agar ringkas, hemat tempat penyimpanan, serta memudahkan saat dibawa ke pos timbang.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#1B5E20] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Pisahkan Berdasarkan Kategori</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Gunakan karung/kardus terpisah untuk kertas/buku, botol PET, logam/kaleng, dan minyak jelantah di botol tertutup.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Accepted vs Not Accepted */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Yang Diterima */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900">
            <CheckCircle className="w-5 h-5 text-[#2E7D32]" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Diterima Pengurus:</h4>
          </div>
          <ul className="text-xs text-emerald-950 space-y-1.5 list-disc pl-4 font-medium">
            <li>Kardus coklat, kotak susu tebal, buku bekas</li>
            <li>Botol plastik PET (Aqua, Le Minerale, Teh Pucuk)</li>
            <li>Gelas plastik bening (cup jus, kopi)</li>
            <li>Besi tua, paku, kawat, seng, kaleng susu</li>
            <li>Minyak goreng bekas (jelantah disaring)</li>
            <li>Botol kecap/sirup utuh tanpa retak</li>
          </ul>
        </div>

        {/* Yang Belum Diterima */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-900">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Belum Diterima:</h4>
          </div>
          <ul className="text-xs text-rose-950 space-y-1.5 list-disc pl-4 font-medium">
            <li>Sampah basah / sisa makanan dapur</li>
            <li>Plastik kresek hitam kotor / mika basah</li>
            <li>Styrofoam wadah makanan cepat saji</li>
            <li>Pecahan kaca / beling berbahaya</li>
            <li>Popok bayi (diapers) & tisu bekas pakai</li>
            <li>Limbah medis / jarum suntik</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
