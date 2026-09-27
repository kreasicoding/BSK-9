export type UserRole = 'nasabah' | 'admin';

export interface User {
  id: string;
  nama: string;
  noWa: string;
  role: UserRole;
  saldo: number;
}

export interface WasteCategory {
  id: string;
  kategori: string;
  hargaPerKg: number;
  deskripsi?: string;
  kelompok?: 'Plastik' | 'Kertas' | 'Logam' | 'Kaca' | 'Minyak' | 'Lainnya';
}

export interface Transaction {
  id: string;
  tanggal: string; // ISO string
  idNasabah: string;
  namaNasabah?: string;
  jenis: string;
  beratKg: number;
  subtotal: number;
  dicatatOleh: string;
  keterangan?: string;
}

export interface DepositItemInput {
  kategoriId: string;
  kategori: string;
  beratKg: number;
  hargaPerKg: number;
  subtotal: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  user?: User;
  newSaldo?: number;
  totalAdded?: number;
  withdrawnAmount?: number;
  txId?: string;
  transactions?: Transaction[];
}
