import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { LoginScreen } from './components/LoginScreen';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';

// Nasabah views
import { NasabahDashboard } from './components/nasabah/NasabahDashboard';
import { NasabahRiwayat } from './components/nasabah/NasabahRiwayat';
import { NasabahKatalog } from './components/nasabah/NasabahKatalog';
import { NasabahPanduan } from './components/nasabah/NasabahPanduan';

// Admin views
import { AdminSetorCepat } from './components/admin/AdminSetorCepat';
import { AdminTarikSaldo } from './components/admin/AdminTarikSaldo';
import { AdminRekapitulasi } from './components/admin/AdminRekapitulasi';
import { AdminIntegrasiGAS } from './components/admin/AdminIntegrasiGAS';

import { api } from './services/api';
import { Transaction, User, WasteCategory } from './types';
import { STORAGE_KEYS } from './config';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [largeFont, setLargeFont] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.FONT_SIZE) === 'true';
  });

  const [activeTab, setActiveTab] = useState<string>('beranda');
  const [catalog, setCatalog] = useState<WasteCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nasabahList, setNasabahList] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal receipt
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);

  // Toggle font scaling for elderly users
  const handleToggleFont = () => {
    const nextVal = !largeFont;
    setLargeFont(nextVal);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, String(nextVal));
  };

  // Sync current user to localStorage
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    // Set default initial tab based on role
    setActiveTab(user.role === 'admin' ? 'setor' : 'beranda');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setActiveTab('beranda');
  };

  // Fetch catalog & transactions
  const loadAppData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      // 1. Ambil Katalog Harga
      const catalogRes = await api.getWasteCatalog();
      if (catalogRes.success && catalogRes.data) {
        setCatalog(catalogRes.data);
      }

      // 2. Ambil Transaksi (sesuai peran nasabah/admin)
      const txRes = await api.getTransactions({
        idNasabah: currentUser.id,
        role: currentUser.role,
      });
      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      }

      // 3. Jika admin, ambil daftar nasabah untuk timbangan & tarik saldo
      if (currentUser.role === 'admin') {
        const nasabahRes = await api.getNasabahList('admin');
        if (nasabahRes.success && nasabahRes.data) {
          setNasabahList(nasabahRes.data);
        }
      }
    } catch (e) {
      console.error('Error loading app data:', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadAppData();
    }
  }, [currentUser, loadAppData]);

  // Handler saat setoran sukses dicatat oleh admin
  const handleDepositSuccess = (newTx: Transaction, newSaldo: number, idNasabah: string) => {
    // Tambahkan transaksi baru ke state teratas
    setTransactions((prev) => [newTx, ...prev]);

    // Update saldo nasabah di list pengurus
    setNasabahList((prev) =>
      prev.map((n) => (n.id === idNasabah ? { ...n, saldo: newSaldo } : n))
    );

    // Buka otomatis Nota Digital untuk langsung diberikan / dibagikan ke nasabah
    setActiveReceiptTx(newTx);
  };

  // Handler saat penarikan saldo sukses dicatat oleh admin
  const handleWithdrawSuccess = (newTx: Transaction, newSaldo: number, idNasabah: string) => {
    setTransactions((prev) => [newTx, ...prev]);

    setNasabahList((prev) =>
      prev.map((n) => (n.id === idNasabah ? { ...n, saldo: newSaldo } : n))
    );

    setActiveReceiptTx(newTx);
  };

  // Jika belum login, tampilkan laman login
  if (!currentUser) {
    return (
      <div className={largeFont ? 'text-[17px]' : 'text-sm'}>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onOpenConfig={() => {
            // Login langsung sebagai admin untuk membuka config atau beri petunjuk
            alert(
              'Untuk mengonfigurasi URL Google Apps Script:\n1. Masuk sebagai Pengurus (gunakan tombol Masuk Cepat Pak RT)\n2. Buka tab "Database GAS" di navigasi bawah.'
            );
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-[#F8FAF9] flex flex-col justify-between ${
        largeFont ? 'text-[17px]' : 'text-sm'
      }`}
    >
      {/* Mobile-first frame container */}
      <div className="w-full max-w-lg mx-auto bg-[#F8FAF9] min-h-screen flex flex-col shadow-sm border-x border-slate-200/60 relative">
        {/* Header Bar */}
        <Header
          user={currentUser}
          onLogout={handleLogout}
          largeFont={largeFont}
          onToggleFont={handleToggleFont}
          onOpenConfig={() => {
            if (currentUser.role === 'admin') {
              setActiveTab('integrasi');
            } else {
              alert(
                'Pengaturan koneksi Google Sheets hanya dapat diakses oleh Pengurus/Admin.'
              );
            }
          }}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-5">
          {/* NASABAH TABS */}
          {currentUser.role === 'nasabah' && (
            <>
              {activeTab === 'beranda' && (
                <NasabahDashboard
                  user={currentUser}
                  transactions={transactions}
                  onNavigateTab={setActiveTab}
                  onSelectTransaction={setActiveReceiptTx}
                />
              )}

              {activeTab === 'riwayat' && (
                <NasabahRiwayat
                  user={currentUser}
                  transactions={transactions}
                  onSelectTransaction={setActiveReceiptTx}
                  onRefresh={loadAppData}
                  loading={loading}
                />
              )}

              {activeTab === 'katalog' && <NasabahKatalog catalog={catalog} />}

              {activeTab === 'panduan' && <NasabahPanduan />}
            </>
          )}

          {/* ADMIN TABS */}
          {currentUser.role === 'admin' && (
            <>
              {activeTab === 'setor' && (
                <AdminSetorCepat
                  adminUser={currentUser}
                  nasabahList={nasabahList}
                  catalog={catalog}
                  onDepositSuccess={handleDepositSuccess}
                  onRefreshData={loadAppData}
                />
              )}

              {activeTab === 'tarik' && (
                <AdminTarikSaldo
                  adminUser={currentUser}
                  nasabahList={nasabahList}
                  onWithdrawSuccess={handleWithdrawSuccess}
                />
              )}

              {activeTab === 'rekap' && (
                <AdminRekapitulasi
                  transactions={transactions}
                  onSelectTransaction={setActiveReceiptTx}
                  onRefresh={loadAppData}
                  loading={loading}
                />
              )}

              {activeTab === 'integrasi' && <AdminIntegrasiGAS />}
            </>
          )}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNavigation
          role={currentUser.role}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Digital Receipt Modal (Nota Digital) */}
        <DigitalReceiptModal
          transaction={activeReceiptTx}
          onClose={() => setActiveReceiptTx(null)}
        />
      </div>
    </div>
  );
}
