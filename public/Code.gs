/**
 * ============================================================================
 * BACKEND GOOGLE APPS SCRIPT (GAS) - BANK SAMPAH KENANGA 9
 * ============================================================================
 * 
 * PANDUAN PEMASANGAN:
 * 1. Buat Google Spreadsheet baru di https://sheets.google.com
 *    Beri judul "Database Bank Sampah Kenanga 9"
 * 2. Di menu spreadsheet, klik Extensions (Ekstensi) > Apps Script
 * 3. Hapus kode default di Editor, lalu tempel SELURUH KODE di bawah ini.
 * 4. Klik menu dropdown fungsi, pilih "initSetup" lalu klik RUN (Jalankan).
 *    Ini akan otomatis membuat 3 Sheet: 'Nasabah', 'Katalog_Sampah', 'Transaksi'
 *    beserta header kolom dan contoh data awal.
 * 5. Klik tombol "Deploy" (Terapkan) > "New deployment" (Penerapan baru)
 * 6. Pilih type: "Web app" (Aplikasi Web)
 *    - Description: "Bank Sampah Kenanga 9 API"
 *    - Execute as: "Me" (Saya / email Anda)
 *    - Who has access: "Anyone" (Siapa saja)  <-- PENTING agar web React bisa mengakses
 * 7. Klik "Deploy" dan salin URL Web App yang berakhiran "/exec".
 * 8. Tempelkan URL tersebut ke konfigurasi aplikasi React Anda (di src/config.ts
 *    atau langsung di menu Pengaturan Pengurus di dalam web).
 * ============================================================================
 */

// Nama-nama Sheet di Google Sheets
const SHEET_NAMES = {
  NASABAH: 'Nasabah',
  KATALOG: 'Katalog_Sampah',
  TRANSAKSI: 'Transaksi'
};

/**
 * Handle HTTP GET - Menampilkan status API jika diakses via browser
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'API Bank Sampah Kenanga 9 siap melayani.',
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST - Endpoint utama yang melayani semua permintaan dari aplikasi web React
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({
        success: false,
        message: 'Tidak ada data yang dikirimkan (payload kosong)'
      });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    let result;

    switch (action) {
      case 'login':
        result = handleLogin(payload);
        break;

      case 'getTransactions':
        result = handleGetTransactions(payload);
        break;

      case 'addDeposit':
        result = handleAddDeposit(payload);
        break;

      case 'withdrawBalance':
        result = handleWithdrawBalance(payload);
        break;

      case 'getWasteCatalog':
        result = handleGetWasteCatalog();
        break;

      case 'getNasabahList':
        result = handleGetNasabahList(payload);
        break;

      case 'ping':
        result = { success: true, message: 'Koneksi ke Google Sheets berhasil!', timestamp: new Date().toISOString() };
        break;

      default:
        result = {
          success: false,
          message: 'Aksi tidak dikenal: ' + action
        };
    }

    return jsonResponse(result);

  } catch (error) {
    return jsonResponse({
      success: false,
      message: 'Terjadi kesalahan server GAS: ' + error.toString()
    });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleLogin(payload) {
  const { identifier, pin } = payload;
  if (!identifier || !pin) {
    return { success: false, message: 'No. WA / ID Nasabah dan PIN wajib diisi' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.NASABAH);
  if (!sheet) {
    return { success: false, message: "Sheet 'Nasabah' tidak ditemukan. Jalankan initSetup terlebih dahulu." };
  }

  const data = sheet.getDataRange().getValues();
  const cleanId = String(identifier).trim().toLowerCase();
  const cleanPin = String(pin).trim();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowId = String(row[0]).trim().toLowerCase();
    const rowNama = String(row[1]).trim();
    const rowWa = String(row[2]).trim().toLowerCase().replace(/[^0-9]/g, '');
    const rowPin = String(row[3]).trim();
    const rowRole = String(row[4] || 'nasabah').trim().toLowerCase();
    const rowSaldo = Number(row[5]) || 0;

    const inputWaClean = cleanId.replace(/[^0-9]/g, '');

    const idMatch = rowId === cleanId;
    const waMatch = inputWaClean.length >= 8 && rowWa === inputWaClean;

    if ((idMatch || waMatch) && rowPin === cleanPin) {
      return {
        success: true,
        user: {
          id: String(row[0]),
          nama: rowNama,
          noWa: String(row[2]),
          role: rowRole,
          saldo: rowSaldo
        },
        message: 'Login berhasil. Selamat datang, ' + rowNama
      };
    }
  }

  return { success: false, message: 'Nomor WhatsApp / ID atau PIN salah. Silakan periksa kembali.' };
}

function handleGetTransactions(payload) {
  const { idNasabah, role, month, year } = payload;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.TRANSAKSI);
  if (!sheet) {
    return { success: false, message: "Sheet 'Transaksi' tidak ditemukan." };
  }

  const data = sheet.getDataRange().getValues();
  const transactions = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    const rowId = String(row[0]);
    const rowDate = row[1];
    const rowIdNasabah = String(row[2]);
    const rowJenis = String(row[3] || '');
    const rowBerat = Number(row[4]) || 0;
    const rowSubtotal = Number(row[5]) || 0;
    const rowPetugas = String(row[6] || '');
    const rowKet = String(row[7] || '');

    if (role === 'nasabah' && rowIdNasabah !== idNasabah) {
      continue;
    }

    const txDate = new Date(rowDate);
    if (month && txDate.getMonth() + 1 !== Number(month)) {
      continue;
    }
    if (year && txDate.getFullYear() !== Number(year)) {
      continue;
    }

    transactions.push({
      id: rowId,
      tanggal: txDate instanceof Date && !isNaN(txDate) ? txDate.toISOString() : String(rowDate),
      idNasabah: rowIdNasabah,
      jenis: rowJenis,
      beratKg: rowBerat,
      subtotal: rowSubtotal,
      dicatatOleh: rowPetugas,
      keterangan: rowKet
    });
  }

  transactions.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  return {
    success: true,
    data: transactions
  };
}

function handleAddDeposit(payload) {
  const { idNasabah, items, dicatatOleh, keterangan } = payload;
  
  if (!idNasabah || !items || !Array.isArray(items) || items.length === 0) {
    return { success: false, message: 'Data setoran tidak lengkap' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNasabah = ss.getSheetByName(SHEET_NAMES.NASABAH);
  const sheetTransaksi = ss.getSheetByName(SHEET_NAMES.TRANSAKSI);

  if (!sheetNasabah || !sheetTransaksi) {
    return { success: false, message: 'Sheet database tidak ditemukan.' };
  }

  const nasabahData = sheetNasabah.getDataRange().getValues();
  let nasabahRowIndex = -1;
  let currentSaldo = 0;
  let namaNasabah = '';

  for (let i = 1; i < nasabahData.length; i++) {
    if (String(nasabahData[i][0]).trim() === String(idNasabah).trim()) {
      nasabahRowIndex = i + 1;
      namaNasabah = String(nasabahData[i][1]);
      currentSaldo = Number(nasabahData[i][5]) || 0;
      break;
    }
  }

  if (nasabahRowIndex === -1) {
    return { success: false, message: 'Nasabah dengan ID ' + idNasabah + ' tidak ditemukan' };
  }

  const timestamp = new Date();
  const txIdBase = 'TRX-' + Utilities.formatDate(timestamp, 'Asia/Jakarta', 'yyyyMMddHHmmss');
  let totalSubtotal = 0;
  const createdTransactions = [];

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const txId = items.length > 1 ? txIdBase + '-' + (idx + 1) : txIdBase;
    const berat = Number(item.beratKg) || 0;
    const subtotal = Number(item.subtotal) || 0;
    totalSubtotal += subtotal;

    const row = [
      txId,
      Utilities.formatDate(timestamp, 'Asia/Jakarta', "yyyy-MM-dd'T'HH:mm:ss"),
      idNasabah,
      item.kategori,
      berat,
      subtotal,
      dicatatOleh || 'Pengurus Kenanga 9',
      keterangan || (item.kategori + ' (' + berat + ' kg @ Rp ' + (item.hargaPerKg || 0) + ')')
    ];

    sheetTransaksi.appendRow(row);

    createdTransactions.push({
      id: txId,
      tanggal: timestamp.toISOString(),
      idNasabah: idNasabah,
      namaNasabah: namaNasabah,
      jenis: item.kategori,
      beratKg: berat,
      subtotal: subtotal,
      dicatatOleh: dicatatOleh || 'Pengurus Kenanga 9'
    });
  }

  const newSaldo = currentSaldo + totalSubtotal;
  sheetNasabah.getRange(nasabahRowIndex, 6).setValue(newSaldo);

  return {
    success: true,
    message: 'Setoran berhasil dicatat! Saldo berhasil diperbarui.',
    newSaldo: newSaldo,
    totalAdded: totalSubtotal,
    transactions: createdTransactions
  };
}

function handleWithdrawBalance(payload) {
  const { idNasabah, jumlah, dicatatOleh, keterangan } = payload;
  const nominal = Number(jumlah);

  if (!idNasabah || !nominal || nominal <= 0) {
    return { success: false, message: 'Nominal penarikan harus lebih besar dari 0' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNasabah = ss.getSheetByName(SHEET_NAMES.NASABAH);
  const sheetTransaksi = ss.getSheetByName(SHEET_NAMES.TRANSAKSI);

  if (!sheetNasabah || !sheetTransaksi) {
    return { success: false, message: 'Sheet database tidak ditemukan.' };
  }

  const nasabahData = sheetNasabah.getDataRange().getValues();
  let nasabahRowIndex = -1;
  let currentSaldo = 0;
  let namaNasabah = '';

  for (let i = 1; i < nasabahData.length; i++) {
    if (String(nasabahData[i][0]).trim() === String(idNasabah).trim()) {
      nasabahRowIndex = i + 1;
      namaNasabah = String(nasabahData[i][1]);
      currentSaldo = Number(nasabahData[i][5]) || 0;
      break;
    }
  }

  if (nasabahRowIndex === -1) {
    return { success: false, message: 'Nasabah tidak ditemukan' };
  }

  if (currentSaldo < nominal) {
    return {
      success: false,
      message: 'Saldo tidak mencukupi. Saldo saat ini: Rp ' + currentSaldo.toLocaleString('id-ID')
    };
  }

  const timestamp = new Date();
  const txId = 'WD-' + Utilities.formatDate(timestamp, 'Asia/Jakarta', 'yyyyMMddHHmmss');
  const newSaldo = currentSaldo - nominal;

  const row = [
    txId,
    Utilities.formatDate(timestamp, 'Asia/Jakarta', "yyyy-MM-dd'T'HH:mm:ss"),
    idNasabah,
    'Tarik Saldo Tunai',
    0,
    -nominal,
    dicatatOleh || 'Pengurus Kenanga 9',
    keterangan || ('Penarikan tunai tabungan nasabah: ' + namaNasabah)
  ];

  sheetTransaksi.appendRow(row);
  sheetNasabah.getRange(nasabahRowIndex, 6).setValue(newSaldo);

  return {
    success: true,
    message: 'Penarikan saldo sebesar Rp ' + nominal.toLocaleString('id-ID') + ' berhasil.',
    txId: txId,
    newSaldo: newSaldo,
    withdrawnAmount: nominal
  };
}

function handleGetWasteCatalog() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.KATALOG);
  if (!sheet) {
    return { success: false, message: "Sheet 'Katalog_Sampah' tidak ditemukan." };
  }

  const data = sheet.getDataRange().getValues();
  const catalog = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    catalog.push({
      id: String(row[0]),
      kategori: String(row[1]),
      hargaPerKg: Number(row[2]) || 0,
      deskripsi: String(row[3] || '')
    });
  }

  return {
    success: true,
    data: catalog
  };
}

function handleGetNasabahList(payload) {
  if (payload.role !== 'admin') {
    return { success: false, message: 'Akses ditolak. Fitur ini khusus pengurus/admin.' };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.NASABAH);
  if (!sheet) {
    return { success: false, message: "Sheet 'Nasabah' tidak ditemukan." };
  }

  const data = sheet.getDataRange().getValues();
  const nasabahList = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;

    nasabahList.push({
      id: String(row[0]),
      nama: String(row[1]),
      noWa: String(row[2]),
      role: String(row[4] || 'nasabah'),
      saldo: Number(row[5]) || 0
    });
  }

  return {
    success: true,
    data: nasabahList
  };
}

function initSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheetNasabah = ss.getSheetByName(SHEET_NAMES.NASABAH);
  if (!sheetNasabah) {
    sheetNasabah = ss.insertSheet(SHEET_NAMES.NASABAH);
  }
  sheetNasabah.clear();
  sheetNasabah.appendRow(['ID', 'Nama', 'No_WA', 'PIN', 'Role', 'Saldo']);
  sheetNasabah.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#E8F5E9');
  
  const sampleNasabah = [
    ['ADM001', 'Pak Bambang (Ketua RT 09)', '081234567890', '123456', 'admin', 0],
    ['NSB001', 'Ibu Siti Aminah (Warga RT 09)', '081298765432', '112233', 'nasabah', 45000],
    ['NSB002', 'Bpk. Joko Supriyanto', '085712345678', '654321', 'nasabah', 78500],
    ['NSB003', 'Ibu Sri Wahyuni', '087811223344', '123123', 'nasabah', 22000],
    ['NSB004', 'Bpk. Ahmad Fauzi', '089699887766', '456456', 'nasabah', 115000]
  ];
  sampleNasabah.forEach(row => sheetNasabah.appendRow(row));

  let sheetKatalog = ss.getSheetByName(SHEET_NAMES.KATALOG);
  if (!sheetKatalog) {
    sheetKatalog = ss.insertSheet(SHEET_NAMES.KATALOG);
  }
  sheetKatalog.clear();
  sheetKatalog.appendRow(['ID', 'Kategori', 'Harga_Per_Kg', 'Deskripsi']);
  sheetKatalog.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#E8F5E9');

  const sampleKatalog = [
    ['SMP01', 'Kardus Bekas Kering', 2500, 'Kardus coklat bersih, tidak basah dan dipipihkan'],
    ['SMP02', 'Botol Plastik PET Bening', 3500, 'Botol mineral bening bersih tanpa tutup & label'],
    ['SMP03', 'Gelas Plastik Bersih (PP)', 2800, 'Cup minuman bening bersih'],
    ['SMP04', 'Kertas HVS & Buku Bekas', 2000, 'Kertas arsip, buku tulis, majalah bebas stepler'],
    ['SMP05', 'Besi Tua / Logam Campur', 4500, 'Besi pipa, paku, kawat, engsel'],
    ['SMP06', 'Kaleng Alumunium Minuman', 13000, 'Kaleng soda, minuman penyegar dipipihkan'],
    ['SMP07', 'Minyak Jelantah (UCO)', 6500, 'Minyak goreng bekas disaring bersih (per Liter/Kg)'],
    ['SMP08', 'Botol Kaca Utuh / Bir', 1000, 'Botol kecap, sirup, bir kondisi utuh tidak retak'],
    ['SMP09', 'Tembaga Super', 95000, 'Kabel kupas tembaga merah mengkilap'],
    ['SMP10', 'Aki Bekas Motor/Mobil', 11000, 'Aki basah/kering utuh']
  ];
  sampleKatalog.forEach(row => sheetKatalog.appendRow(row));

  let sheetTransaksi = ss.getSheetByName(SHEET_NAMES.TRANSAKSI);
  if (!sheetTransaksi) {
    sheetTransaksi = ss.insertSheet(SHEET_NAMES.TRANSAKSI);
  }
  sheetTransaksi.clear();
  sheetTransaksi.appendRow(['ID', 'Tanggal', 'ID_Nasabah', 'Jenis', 'Berat_Kg', 'Subtotal', 'Dicatat_Oleh', 'Keterangan']);
  sheetTransaksi.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#E8F5E9');

  const now = new Date();
  const d1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const d2 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();
  const d3 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();

  const sampleTransaksi = [
    ['TRX-20260925-01', d1, 'NSB001', 'Kardus Bekas Kering', 6.0, 15000, 'Pak Bambang', 'Setoran mingguan warga'],
    ['TRX-20260925-02', d1, 'NSB001', 'Botol Plastik PET Bening', 5.0, 17500, 'Pak Bambang', 'Botol bersih tanpa label'],
    ['TRX-20260922-01', d2, 'NSB001', 'Kaleng Alumunium Minuman', 1.0, 13000, 'Pak Bambang', 'Kaleng minuman ringan'],
    ['TRX-20260918-01', d3, 'NSB002', 'Besi Tua / Logam Campur', 10.0, 45000, 'Pak Bambang', 'Besi sisa renovasi'],
    ['TRX-20260918-02', d3, 'NSB004', 'Tembaga Super', 1.0, 95000, 'Pak Bambang', 'Kabel sisa instalasi']
  ];
  sampleTransaksi.forEach(row => sheetTransaksi.appendRow(row));

  Logger.log('Inisialisasi Bank Sampah Kenanga 9 Berhasil!');
}
