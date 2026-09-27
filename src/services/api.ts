import { getActiveScriptUrl, isUsingLiveScript, STORAGE_KEYS } from '../config';
import { ApiResponse, Transaction, User, WasteCategory } from '../types';

// Data simulasi awal untuk pengujian lokal/demo sebelum user menghubungkan Google Apps Script
const INITIAL_DEMO_USERS: User[] = [
  {
    id: 'ADM001',
    nama: 'Pak Bambang (Ketua RT 09)',
    noWa: '081234567890',
    role: 'admin',
    saldo: 0,
  },
  {
    id: 'NSB001',
    nama: 'Ibu Siti Aminah (Warga RT 09)',
    noWa: '081298765432',
    role: 'nasabah',
    saldo: 45500,
  },
  {
    id: 'NSB002',
    nama: 'Bpk. Joko Supriyanto',
    noWa: '085712345678',
    role: 'nasabah',
    saldo: 78500,
  },
  {
    id: 'NSB003',
    nama: 'Ibu Sri Wahyuni',
    noWa: '087811223344',
    role: 'nasabah',
    saldo: 22000,
  },
  {
    id: 'NSB004',
    nama: 'Bpk. Ahmad Fauzi',
    noWa: '089699887766',
    role: 'nasabah',
    saldo: 115000,
  },
];

const INITIAL_DEMO_CATALOG: WasteCategory[] = [
  {
    id: 'SMP01',
    kategori: 'Kardus Bekas Kering',
    hargaPerKg: 2500,
    deskripsi: 'Kardus coklat bersih, tidak basah dan dipipihkan',
    kelompok: 'Kertas',
  },
  {
    id: 'SMP02',
    kategori: 'Botol Plastik PET Bening',
    hargaPerKg: 3500,
    deskripsi: 'Botol mineral bening bersih tanpa tutup & label',
    kelompok: 'Plastik',
  },
  {
    id: 'SMP03',
    kategori: 'Gelas Plastik Bersih (PP)',
    hargaPerKg: 2800,
    deskripsi: 'Cup minuman bening bersih tanpa sisa sedotan & plastik sealer',
    kelompok: 'Plastik',
  },
  {
    id: 'SMP04',
    kategori: 'Kertas HVS & Buku Bekas',
    hargaPerKg: 2000,
    deskripsi: 'Kertas dokumen, buku tulis, majalah bebas klip & stepler',
    kelompok: 'Kertas',
  },
  {
    id: 'SMP05',
    kategori: 'Besi Tua / Logam Campur',
    hargaPerKg: 4500,
    deskripsi: 'Besi plat, paku, kawat, engsel, potongan pagar',
    kelompok: 'Logam',
  },
  {
    id: 'SMP06',
    kategori: 'Kaleng Alumunium Minuman',
    hargaPerKg: 13000,
    deskripsi: 'Kaleng soda & minuman penyegar bersih dipipihkan',
    kelompok: 'Logam',
  },
  {
    id: 'SMP07',
    kategori: 'Minyak Jelantah (UCO)',
    hargaPerKg: 6500,
    deskripsi: 'Minyak jelantah rumahan yang disaring tanpa ampas (per Liter/Kg)',
    kelompok: 'Minyak',
  },
  {
    id: 'SMP08',
    kategori: 'Botol Kaca Utuh / Kecap / Bir',
    hargaPerKg: 1000,
    deskripsi: 'Botol kaca utuh tidak sompel/pecah',
    kelompok: 'Kaca',
  },
  {
    id: 'SMP09',
    kategori: 'Tembaga Super',
    hargaPerKg: 95000,
    deskripsi: 'Kabel kupas tembaga merah murni mengkilap',
    kelompok: 'Logam',
  },
  {
    id: 'SMP10',
    kategori: 'Aki Bekas Motor / Mobil',
    hargaPerKg: 11000,
    deskripsi: 'Aki basah atau kering utuh',
    kelompok: 'Lainnya',
  },
];

const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-20260925-01',
    tanggal: new Date(Date.now() - 2 * 86400000).toISOString(),
    idNasabah: 'NSB001',
    namaNasabah: 'Ibu Siti Aminah (Warga RT 09)',
    jenis: 'Kardus Bekas Kering',
    beratKg: 6.0,
    subtotal: 15000,
    dicatatOleh: 'Pak Bambang (Ketua RT 09)',
    keterangan: 'Setoran rutin warga RW 09',
  },
  {
    id: 'TRX-20260925-02',
    tanggal: new Date(Date.now() - 2 * 86400000 + 120000).toISOString(),
    idNasabah: 'NSB001',
    namaNasabah: 'Ibu Siti Aminah (Warga RT 09)',
    jenis: 'Botol Plastik PET Bening',
    beratKg: 5.0,
    subtotal: 17500,
    dicatatOleh: 'Pak Bambang (Ketua RT 09)',
    keterangan: 'Botol bersih tanpa label',
  },
  {
    id: 'TRX-20260922-01',
    tanggal: new Date(Date.now() - 5 * 86400000).toISOString(),
    idNasabah: 'NSB001',
    namaNasabah: 'Ibu Siti Aminah (Warga RT 09)',
    jenis: 'Kaleng Alumunium Minuman',
    beratKg: 1.0,
    subtotal: 13000,
    dicatatOleh: 'Pak Bambang (Ketua RT 09)',
    keterangan: 'Kaleng kemasan dipipihkan',
  },
  {
    id: 'TRX-20260918-01',
    tanggal: new Date(Date.now() - 9 * 86400000).toISOString(),
    idNasabah: 'NSB002',
    namaNasabah: 'Bpk. Joko Supriyanto',
    jenis: 'Besi Tua / Logam Campur',
    beratKg: 10.0,
    subtotal: 45000,
    dicatatOleh: 'Pak Bambang (Ketua RT 09)',
    keterangan: 'Besi sisa renovasi pagar',
  },
  {
    id: 'TRX-20260910-01',
    tanggal: new Date(Date.now() - 17 * 86400000).toISOString(),
    idNasabah: 'NSB004',
    namaNasabah: 'Bpk. Ahmad Fauzi',
    jenis: 'Tembaga Super',
    beratKg: 1.0,
    subtotal: 95000,
    dicatatOleh: 'Pak Bambang (Ketua RT 09)',
    keterangan: 'Kabel tembaga instalasi',
  },
];

// Helper database demo di localStorage
function getLocalDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEMO_DATA);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading demo db', e);
  }

  const initialDb = {
    users: INITIAL_DEMO_USERS,
    catalog: INITIAL_DEMO_CATALOG,
    transactions: INITIAL_DEMO_TRANSACTIONS,
  };
  localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(initialDb));
  return initialDb;
}

function saveLocalDb(db: unknown) {
  localStorage.setItem(STORAGE_KEYS.DEMO_DATA, JSON.stringify(db));
}

/**
 * Panggilan API terpadu:
 * - Menggunakan Google Apps Script jika SCRIPT_URL sudah dikonfigurasi
 * - Menggunakan simulasi lokal jika masih mode demo
 */
async function callGAS<T = unknown>(action: string, payload: Record<string, unknown> = {}): Promise<ApiResponse<T>> {
  const url = getActiveScriptUrl();

  if (isUsingLiveScript()) {
    try {
      // Kirim dengan Content-Type text/plain untuk menghindari CORS preflight OPTIONS rejection di GAS
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action, ...payload }),
      });

      if (!response.ok) {
        throw new Error(`Server GAS merespons dengan status ${response.status}`);
      }

      const json = await response.json();
      return json;
    } catch (err: unknown) {
      console.warn('Gagal memanggil Google Apps Script live, fallback ke local database:', err);
      // Jika terjadi gangguan jaringan, fallback dengan informasi jelas
      return {
        success: false,
        message: `Koneksi Google Apps Script bermasalah: ${err instanceof Error ? err.message : String(err)}. Pastikan Web App di-deploy dengan akses 'Anyone'.`,
      };
    }
  }

  // JALANKAN LOGIKA SIMULASI LOKAL (DEMO MODE)
  await new Promise((resolve) => setTimeout(resolve, 300)); // Simulasi latensi jaringan yang realistis
  const db = getLocalDb();

  switch (action) {
    case 'login': {
      const { identifier, pin } = payload;
      const cleanId = String(identifier || '').trim().toLowerCase();
      const cleanWa = cleanId.replace(/[^0-9]/g, '');
      const cleanPin = String(pin || '').trim();

      // PIN demo: 123456 untuk admin, 112233 untuk Siti, atau default 123456
      const user = db.users.find((u: User) => {
        const uId = u.id.toLowerCase();
        const uWa = u.noWa.replace(/[^0-9]/g, '');
        const match = uId === cleanId || (cleanWa.length >= 8 && uWa === cleanWa);
        // Izinkan PIN sesuai yang terdaftar atau demo PIN
        if (!match) return false;
        if (cleanPin === '123456' || cleanPin === '112233' || cleanPin === '654321') return true;
        return true; // di mode demo permudah pengetesan
      });

      if (user) {
        return {
          success: true,
          user: {
            id: user.id,
            nama: user.nama,
            noWa: user.noWa,
            role: user.role,
            saldo: user.saldo,
          },
          message: `Selamat datang, ${user.nama}! (Mode Demo Aktif)`,
        };
      }
      return {
        success: false,
        message: 'No. WA / ID atau PIN tidak sesuai. Contoh demo: 081298765432 / PIN: 112233',
      };
    }

    case 'getWasteCatalog': {
      return {
        success: true,
        data: db.catalog as T,
      };
    }

    case 'getNasabahList': {
      const list = db.users.map((u: User) => ({
        id: u.id,
        nama: u.nama,
        noWa: u.noWa,
        role: u.role,
        saldo: u.saldo,
      }));
      return {
        success: true,
        data: list as T,
      };
    }

    case 'getTransactions': {
      const { idNasabah, role, month, year } = payload;
      let txs = [...db.transactions];

      if (role === 'nasabah' && idNasabah) {
        txs = txs.filter((t: Transaction) => t.idNasabah === idNasabah);
      }

      if (month && Number(month) > 0) {
        txs = txs.filter((t: Transaction) => {
          const d = new Date(t.tanggal);
          return d.getMonth() + 1 === Number(month);
        });
      }

      if (year && Number(year) > 0) {
        txs = txs.filter((t: Transaction) => {
          const d = new Date(t.tanggal);
          return d.getFullYear() === Number(year);
        });
      }

      txs.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

      return {
        success: true,
        data: txs as T,
      };
    }

    case 'addDeposit': {
      const { idNasabah, items, dicatatOleh, keterangan } = payload as {
        idNasabah: string;
        items: Array<{ kategori: string; beratKg: number; hargaPerKg: number; subtotal: number }>;
        dicatatOleh: string;
        keterangan: string;
      };

      const userIndex = db.users.findIndex((u: User) => u.id === idNasabah);
      if (userIndex === -1) {
        return { success: false, message: 'Nasabah tidak ditemukan' };
      }

      const targetUser = db.users[userIndex];
      let totalAdded = 0;
      const createdTxs: Transaction[] = [];
      const timestamp = new Date().toISOString();

      items.forEach((item, index) => {
        const txId = `TRX-${Date.now()}-${index + 1}`;
        const subtotal = Number(item.subtotal);
        totalAdded += subtotal;

        const newTx: Transaction = {
          id: txId,
          tanggal: timestamp,
          idNasabah: targetUser.id,
          namaNasabah: targetUser.nama,
          jenis: item.kategori,
          beratKg: Number(item.beratKg),
          subtotal: subtotal,
          dicatatOleh: dicatatOleh || 'Pengurus Kenanga 9',
          keterangan: keterangan || `${item.kategori} (${item.beratKg} kg @ Rp ${item.hargaPerKg})`,
        };

        db.transactions.unshift(newTx);
        createdTxs.push(newTx);
      });

      targetUser.saldo += totalAdded;
      saveLocalDb(db);

      return {
        success: true,
        message: `Setoran sampah senilai Rp ${totalAdded.toLocaleString('id-ID')} berhasil disimpan!`,
        newSaldo: targetUser.saldo,
        totalAdded: totalAdded,
        transactions: createdTxs,
      };
    }

    case 'withdrawBalance': {
      const { idNasabah, jumlah, dicatatOleh, keterangan } = payload as {
        idNasabah: string;
        jumlah: number;
        dicatatOleh: string;
        keterangan: string;
      };

      const userIndex = db.users.findIndex((u: User) => u.id === idNasabah);
      if (userIndex === -1) {
        return { success: false, message: 'Nasabah tidak ditemukan' };
      }

      const targetUser = db.users[userIndex];
      const nominal = Number(jumlah);

      if (targetUser.saldo < nominal) {
        return {
          success: false,
          message: `Saldo tidak cukup! Saldo saat ini: Rp ${targetUser.saldo.toLocaleString('id-ID')}`,
        };
      }

      targetUser.saldo -= nominal;
      const txId = `WD-${Date.now()}`;
      const newTx: Transaction = {
        id: txId,
        tanggal: new Date().toISOString(),
        idNasabah: targetUser.id,
        namaNasabah: targetUser.nama,
        jenis: 'Tarik Saldo Tunai',
        beratKg: 0,
        subtotal: -nominal,
        dicatatOleh: dicatatOleh || 'Pengurus Kenanga 9',
        keterangan: keterangan || `Penarikan tunai tabungan warga: ${targetUser.nama}`,
      };

      db.transactions.unshift(newTx);
      saveLocalDb(db);

      return {
        success: true,
        message: `Penarikan tunai Rp ${nominal.toLocaleString('id-ID')} berhasil dicatat.`,
        txId,
        newSaldo: targetUser.saldo,
        withdrawnAmount: nominal,
      };
    }

    default:
      return { success: false, message: 'Aksi simulasi tidak dikenal' };
  }
}

export const api = {
  login: (identifier: string, pin: string) => callGAS<User>('login', { identifier, pin }),

  getTransactions: (params: { idNasabah?: string; role?: string; month?: number; year?: number }) =>
    callGAS<Transaction[]>('getTransactions', params),

  getWasteCatalog: () => callGAS<WasteCategory[]>('getWasteCatalog'),

  getNasabahList: (role: string) => callGAS<User[]>('getNasabahList', { role }),

  addDeposit: (params: {
    idNasabah: string;
    items: Array<{ kategori: string; beratKg: number; hargaPerKg: number; subtotal: number }>;
    dicatatOleh: string;
    keterangan?: string;
  }) => callGAS('addDeposit', params),

  withdrawBalance: (params: {
    idNasabah: string;
    jumlah: number;
    dicatatOleh: string;
    keterangan?: string;
  }) => callGAS('withdrawBalance', params),

  testConnection: async (testUrl: string): Promise<{ success: boolean; message: string }> => {
    if (!testUrl || !testUrl.startsWith('https://script.google.com/macros/s/')) {
      return {
        success: false,
        message: 'Format URL Google Apps Script tidak valid. Harus dimulai dengan https://script.google.com/macros/s/.../exec',
      };
    }
    try {
      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'ping' }),
      });
      const data = await res.json();
      if (data && data.success) {
        return { success: true, message: data.message || 'Koneksi ke Google Sheets berhasil!' };
      }
      return { success: false, message: data?.message || 'Server Google Apps Script merespons tetapi mengembalikan error.' };
    } catch (e: unknown) {
      return {
        success: false,
        message: `Gagal menghubungi URL: ${e instanceof Error ? e.message : String(e)}. Pastikan deployment diatur ke 'Who has access: Anyone'.`,
      };
    }
  },

  resetDemoData: () => {
    localStorage.removeItem(STORAGE_KEYS.DEMO_DATA);
    window.location.reload();
  },
};
