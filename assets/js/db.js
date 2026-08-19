const ALLOWED_TRANSACTION_TYPES = [
  'NOTA_TITIP_JUAL',
  'PELUNASAN_TITIP',
  'KAS_MASUK',
  'KAS_KELUAR',
  'PENYELESAIAN_DEPOSIT'
];

const db = new Dexie("WirahastaDB_v2");
db.version(4).stores({
  barang: '++id, sku, nama, hppDefault, hargaJual, stok',
  pelanggan: '++id, idPelanggan, nama, nohp, deposit',
  kategoriKas: '++id, nama, jenis',
  titipJual: '++id, nomorNota, tanggal, namaPelanggan, namaBarang, qtyTitip, hargaJual, status, terminalId',
  pelunasanTitip: '++id, tanggal, idTitip, qtyLaku, qtyRetur, uangDiterima, depositDibuat, terminalId',
  kasLain: '++id, tanggal, jenis, kategori, nominal, keterangan, terminalId, pihak',
  transaksi: '++id, tanggal, tipe, rincian, nominalOrQty, terminalId, refId'
});

// Helper Format Nominal K (e.g., 2500 -> 2k5, 10000 -> 10k)
function formatNominalK(val) {
  const absVal = Math.abs(val);
  const thousands = Math.floor(absVal / 1000);
  const remainder = Math.floor((absVal % 1000) / 100);
  let formatted = '';
  if (remainder > 0) {
    formatted = `${thousands}k${remainder}`;
  } else {
    formatted = `${thousands}k`;
  }
  return val < 0 ? `-${formatted}` : formatted;
}

// Helper menyimpan transaksi dengan validasi Whitelist Tipe Transaksi
async function addValidatedTransaksi(transaksiObj) {
  if (!ALLOWED_TRANSACTION_TYPES.includes(transaksiObj.tipe)) {
    console.warn(`[REJECTED] Tipe transaksi '${transaksiObj.tipe}' tidak terdaftar/diizinkan!`);
    return null;
  }
  return await db.transaksi.add(transaksiObj);
}

// Seed Data Awal jika Kosong
db.on("populate", () => {
  db.barang.bulkAdd([
    { sku: 'BRG-01', nama: 'Beras Premium 5kg', hppDefault: 60000, hargaJual: 68000, stok: 50 },
    { sku: 'BRG-02', nama: 'Minyak Goreng 1L', hppDefault: 14000, hargaJual: 16500, stok: 100 }
  ]);
  db.pelanggan.bulkAdd([
    { idPelanggan: 'PLG-001', nama: 'Toko Bu Ani', nohp: '08123456789', deposit: 2500 },
    { idPelanggan: 'PLG-002', nama: 'Warung Pak Eko', nohp: '08987654321', deposit: -5000 }
  ]);
  db.kategoriKas.bulkAdd([
    { nama: 'Operasional Toko', jenis: 'KELUAR' },
    { nama: 'Bahan Olahan', jenis: 'KELUAR' },
    { nama: 'Pembelian Stok', jenis: 'KELUAR' },
    { nama: 'Pendapatan Lain', jenis: 'MASUK' },
    { nama: 'Penjualan Sampingan', jenis: 'MASUK' }
  ]);
});