# Kamus Istilah Operasional & Kode Aplikasi
**Wirahasta Hasil Bumi v2.0 (P2P Network Edition)**

Dokumen ini menghubungkan elemen variabel, fungsi, dan logika di dalam kode program dengan bahasa operasional sehari-hari[cite: 1]. Gunakan kamus ini saat penguji aplikasi menyampaikan masukan, meminta penambahan fitur, atau menginginkan perubahan perilaku pada aplikasi[cite: 1].

---

## 1. Peran & Mode Operasional (Networking)

| Istilah Kode / UI | Istilah Penguji (Bahasa Umum) | Definisi & Perilaku Aplikasi |
|---|---|---|
| `STANDALONE` | **Mode Mandiri** | Aplikasi berjalan *offline* di satu perangkat tanpa terhubung ke HP lain[cite: 1]. Seluruh data tersimpan di penyimpanan lokal perangkat tersebut[cite: 1]. |
| `MASTER` | **HP Pusat (Server Utama)** | Perangkat yang memegang database utama[cite: 1]. Dapat menambah, mengubah, serta menerima transaksi dari HP Cabang[cite: 1]. |
| `CLIENT` | **HP Cabang (Kasir Tambahan)** | Perangkat kasir tambahan yang terhubung ke HP Pusat[cite: 1]. Pengubahan database master di halaman ini dikunci (*Read-Only*)[cite: 1]. |
| `Peer ID` | **Kode Alamat Koneksi** | Kode unik yang dihasilkan oleh HP Pusat agar HP Cabang bisa terhubung melalui jaringan P2P[cite: 1]. |

---

## 2. Jenis Transaksi & Keuangan (`ALLOWED_TRANSACTION_TYPES`)

| Istilah Kode | Tampilan di Nota/UI | Istilah Penguji | Definisi & Dampak Keuangan |
|---|---|---|---|
| `NOTA_TITIP_JUAL` | Titip / Nota Jual | **Penyerahan Barang Konsinyasi** | Pencatatan penyerahan barang ke pelanggan[cite: 1]. **Belum memengaruhi saldo kas**; status transaksi tercatat sebagai `BELUM_BAYAR`[cite: 1]. |
| `PELUNASAN_TITIP` | Pelunasan | **Perhitungan & Lunas Konsinyasi** | Rekapitulasi barang laku, retur (kembali), dan penerimaan uang[cite: 1]. **Menambah Kas Masuk** sejumlah uang diterima dan menyesuaikan Deposit Pelanggan[cite: 1]. |
| `KAS_MASUK` | Kas Masuk | **Penerimaan Uang Lain** | Pencatatan penerimaan kas di luar pelunasan titip (misal: pendapatan non-titip/lain-lain)[cite: 1]. **Menambah Saldo Kas**[cite: 1]. |
| `KAS_KELUAR` | Kas Keluar | **Pengeluaran Operasional** | Pencatatan biaya operasional, belanja stok, atau beban usaha[cite: 1]. **Mengurangi Saldo Kas**[cite: 1]. |
| `PENYELESAIAN_DEPOSIT` | Penyelesaian Deposit | **Pelunasan Utang / Deposit** | Pengembalian uang lebih atau penarikan kekurangan bayar pelanggan hingga saldo deposit menjadi Rp 0[cite: 1]. |

---

## 3. Entitas & Data Master

| Istilah Kode | Istilah Penguji | Definisi & Perilaku Aplikasi |
|---|---|---|
| `pelanggan.deposit` | **Saldo Deposit / Utang Pelanggan** | **Nilai Positif (+):** Uang lebih pelanggan (Kita berutang ke pelanggan)[cite: 1].<br>**Nilai Negatif (-):** Kekurangan bayar pelanggan (Pelanggan berutang ke kita)[cite: 1]. |
| `barang.stok` | **Stok Barang** | Jumlah unit barang yang tersedia di database[cite: 1]. |
| `barang.hppDefault` | **HPP / Harga Modal** | Harga Pokok Pembelian default untuk kalkulasi nilai modal barang[cite: 1]. |
| `barang.hargaJual` | **Harga Jual Standar** | Harga jual acuan yang otomatis terisi saat pembuatan Nota Titip Baru[cite: 1]. |
| `transaksi.runningSaldoKas` | **Saldo Kas Berjalan** | Akumulasi sisa kas secara *real-time* yang dihitung dari riwayat transaksi kas masuk dan keluar[cite: 1]. |

---

## 4. Fitur, Komponen UI & Aksi Sistem

| Istilah Kode / Fungsi | Elemen UI / Tombol | Definisi Penguji |
|---|---|---|
| `formatNominalK()` | Angka Ringkas Grid (misal: `10k`, `-5k`) | **Penyingkat Nominal:** Format tampilan angka ribuan agar muat di dalam kotak kartu deposit/titip[cite: 1]. |
| `kirimDaftarTitipWA()` | Tombol **"Kirim WA"** | **Export Titipan ke WA:** Fitur untuk mengubah seluruh tagihan aktif (`BELUM_BAYAR`) menjadi teks format CSV lalu dikirim via WhatsApp[cite: 1]. |
| `backupDatabaseJSON()` | Tombol **"Unduh Backup Database"** | **Cadangkan Data:** Mengunduh seluruh data aplikasi menjadi file `.json`[cite: 1]. |
| `restoreDatabaseJSON()` | Tombol **"Unggah Restore Database"** | **Pemulihan Data:** Memuat kembali database dari file `.json` dan menggantikan data saat ini[cite: 1]. |

---

## Contoh Cara Penguji Menggunakan Kamus Ini

* **Contoh 1 (Ubah Perilaku Transaksi):**
  > *"Tolong ubah logika `PELUNASAN_TITIP`[cite: 1]. Kalau uang yang diterima kurang dari total tagihan, selisihnya jangan otomatis masuk ke `pelanggan.deposit`, tapi buatkan kolom catatan utang terpisah[cite: 1]."*

* **Contoh 2 (Ubah Hak Akses Peran):**
  > *"Pada mode `CLIENT`, tolong beri izin untuk melakukan 'Tambah Barang' di Database Barang, jangan buat Read-Only penuh[cite: 1]."*

* **Contoh 3 (Hapus / Tambah Fitur UI):**
  > *"Hilangkan tombol `kirimDaftarTitipWA()` dari halaman Tab Jual, atau ubah format teks CSV-nya agar menyertakan tanggal nota[cite: 1]."*