import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SCRIPT_URL, STORAGE_KEYS, getActiveScriptUrl, isUsingLiveScript } from '../../config';
import { api } from '../../services/api';

export const AdminIntegrasiGAS: React.FC = () => {
  const currentUrl = getActiveScriptUrl();
  const [customUrl, setCustomUrl] = useState(
    localStorage.getItem(STORAGE_KEYS.CUSTOM_SCRIPT_URL) || (currentUrl === SCRIPT_URL ? '' : currentUrl)
  );
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const isLive = isUsingLiveScript();

  const handleSaveUrl = () => {
    if (customUrl.trim() === '') {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_SCRIPT_URL);
    } else {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_SCRIPT_URL, customUrl.trim());
    }
    window.location.reload();
  };

  const handleTestConnection = async () => {
    const urlToTest = customUrl.trim() || currentUrl;
    setIsTesting(true);
    setTestResult(null);

    const res = await api.testConnection(urlToTest);
    setTestResult(res);
    setIsTesting(false);
  };

  const handleCopyCodeGs = async () => {
    try {
      const res = await fetch('/Code.gs');
      let text = '';
      if (res.ok) {
        text = await res.text();
      } else {
        // Fallback jika file publik belum dimuat
        text = `// Silakan salin isi file Code.gs dari repositori Anda`;
      }
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    } catch {
      alert('Gagal menyalin otomatis. Silakan buka file Code.gs secara manual.');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-20">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-white bg-[#1B5E20] px-2.5 py-0.5 rounded-md">
            Arsitektur Backend
          </span>
          <span className="text-xs text-slate-500 font-medium">Google Apps Script & Sheets</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 leading-tight mt-1">
          Koneksi Database Google Sheets
        </h2>
        <p className="text-xs text-slate-500">
          Kelola endpoint URL Apps Script Anda tanpa perlu modifikasi kode ulang
        </p>
      </div>

      {/* Current Connection Status Box */}
      <div
        className={`p-5 rounded-3xl border space-y-3 ${
          isLive
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : 'bg-amber-50/70 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-3 h-3 rounded-full ${
                isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <h3 className="text-sm font-bold">
              {isLive ? 'Terhubung ke Google Apps Script Live' : 'Mode Demo / Simulasi Lokal Aktif'}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold bg-white/60 px-2 py-0.5 rounded-lg border border-black/5">
            {isLive ? 'GAS_LIVE' : 'LOCAL_DEMO'}
          </span>
        </div>

        <p className="text-xs leading-relaxed opacity-90">
          {isLive
            ? 'Semua pencatatan timbangan sampah, tarikan saldo, dan data nasabah langsung tersimpan secara realtime di Google Spreadsheet Anda.'
            : 'Saat ini aplikasi berjalan menggunakan database lokal peramban. Masukkan URL Web App Google Apps Script Anda di bawah ini untuk menghubungkan spreadsheet asli.'}
        </p>
      </div>

      {/* Input Form SCRIPT_URL */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Pengaturan URL Web App (SCRIPT_URL)
        </label>

        <div>
          <div className="relative">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full py-3 px-3 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Konstanta bawaan di <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">src/config.ts</code>: <span className="font-mono text-slate-700">{SCRIPT_URL}</span>
          </p>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Menguji...' : 'Uji Koneksi (Ping)'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveUrl}
            className="py-2.5 px-4 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Simpan & Terapkan URL</span>
          </button>
        </div>
      </div>

      {/* 1-Click Code.gs Copy Section */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Salin File Backend Code.gs</h3>
            <p className="text-xs text-slate-500">
              Kode backend Google Apps Script siap tempel di Editor Apps Script Anda
            </p>
          </div>
          <button
            onClick={handleCopyCodeGs}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Tersalin!' : 'Salin Code.gs'}</span>
          </button>
        </div>

        <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-52 border border-slate-800">
          <pre>{`/**
 * BACKEND GOOGLE APPS SCRIPT - BANK SAMPAH KENANGA 9
 * Endpoint: doPost(e)
 * Actions: login, getTransactions, addDeposit, withdrawBalance, getWasteCatalog, getNasabahList
 */
function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  // Logika login, transaksi, update saldo otomatis
  ...
}`}</pre>
        </div>
      </div>

      {/* Step by step deployment guide */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Panduan 4 Langkah Pemasangan Google Sheets:
        </h3>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              1
            </span>
            <p>
              Buka <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-[#1B5E20] font-bold underline inline-flex items-center gap-0.5">Google Sheets <ExternalLink className="w-3 h-3 inline" /></a> baru, beri judul <strong>"Database Bank Sampah Kenanga 9"</strong>.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              2
            </span>
            <p>
              Klik menu <strong>Extensions (Ekstensi) &gt; Apps Script</strong>. Hapus kode default dan tempel seluruh isi <strong>Code.gs</strong>.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              3
            </span>
            <p>
              Pilih fungsi <strong>initSetup</strong> pada dropdown di Apps Script, lalu klik <strong>Run (Jalankan)</strong>. Ketiga sheet (<em>Nasabah</em>, <em>Katalog_Sampah</em>, <em>Transaksi</em>) akan otomatis dibuat beserta contoh datanya!
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              4
            </span>
            <p>
              Klik tombol biru <strong>Deploy (Terapkan) &gt; New deployment</strong>. Pilih type <strong>Web App</strong>, atur <strong>Who has access: Anyone</strong>. Salin URL akhiran <code>/exec</code> ke kolom di atas. Selesai!
            </p>
          </div>
        </div>
      </div>

      {/* Netlify Deploy Guide */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Siap Deploy ke Netlify (100% Free Stack)</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Proyek ini sudah dilengkapi file konfigurasi <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded">netlify.toml</code> dan <code className="bg-slate-800 text-emerald-300 px-1 py-0.5 rounded">public/_redirects</code>. Cukup push ke GitHub lalu hubungkan repository Anda di dashboard Netlify!
        </p>
      </div>
    </div>
  );
};
