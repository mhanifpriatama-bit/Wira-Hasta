# Dokumentasi Arsitektur Sistem Wirahasta Hasil Bumi v2.0
**Pendekatan:** Modular Monolith Local-First Application

Arsitektur aplikasi **Wirahasta Hasil Bumi v2.0** dirancang dengan pendekatan *Modular Monolith Local-First Application*. Pemisahan berkas (*file modularization*) bertujuan untuk memisahkan antara tampilan (UI), penyimpanan data lokal (Database), modul komunikasi (P2P), dan pustaka pihak ketiga (*Vendors*).

---

## Ringkasan Struktur Direktori

```text
wirahasta-app/
│
├── index.html
│
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── all.min.css         (Vendor: FontAwesome)
│   │
│   └── js/
│       ├── tailwindcss.js      (Vendor: Tailwind Play CDN)
│       ├── dexie.js            (Vendor: Dexie IndexedDB Wrapper)
│       ├── peerjs.min.js       (Vendor: PeerJS P2P Engine)
│       │
│       ├── db.js               (Instansiasi Dexie DB & Helper Schema)
│       ├── p2p.js              (Logika PeerJS Master & Client)
│       ├── ui.js               (Event Handler, Modal, & Render UI)
│       └── app.js              (Entry Point & Event Listener Utama)
```

---

## Rincian Berkas & Fungsi

### 1. Root Directory (`/`)

* **`index.html`**  
  Menjadi *entry point* tunggal (*Single Page Application*) yang berisi struktur DOM dasar, tata letak antarmuka (UI), form modal, serta memuat pustaka-pustaka (*scripts & styles*). Dalam tahap pengembangan awal, seluruh logika JavaScript internal beroperasi di sini sebelum dipisahkan secara modular ke berkas-berkas `.js` terpisah.

---

### 2. Asset CSS (`assets/css/`)

* **`style.css`**  
  Menyimpan aturan CSS kustom tambahan atau modul modifikasi UI khusus aplikasi yang tidak di-cover langsung oleh framework *utility-first* Tailwind.
* **`all.min.css`** *(Vendor: FontAwesome)*  
  Pustaka ikon untuk menampilkan simbol visual pada antarmuka seperti ikon dompet (`fa-wallet`), database (`fa-database`), nota (`fa-file-invoice-dollar`), dan indikator server (`fa-server`).

---

### 3. Asset JavaScript / Vendor & App (`assets/js/`)

#### A. Vendor Libraries (Pustaka Pihak Ketiga)

* **`tailwindcss.js`** *(Vendor: Tailwind Play CDN)*  
  Pustaka pengolah CSS instan berbasis *class* (seperti `flex`, `bg-emerald-700`, `shadow-md`) untuk membentuk tata letak yang responsif tanpa perlu kompilasi CSS manual.
* **`dexie.js`** *(Vendor: Dexie IndexedDB Wrapper)*  
  Library wrapper untuk IndexedDB di peramban (*browser*). Pustaka ini memudahkan operasi *Database Offline* (CRUD) berbasis *asynchronous* (Promise).
* **`peerjs.min.js`** *(Vendor: PeerJS P2P Engine)*  
  Pustaka komunikasi data jaringan *peer-to-peer* (WebRTC). Memungkinkan HP Master dan HP Client saling berkirim/sinkronisasi data tanpa memerlukan server *backend* terpusat.

#### B. Application Modules (Modul Logika Utama)

* **`db.js`** *(Instansiasi Dexie DB & Helper Schema)*  
  Mengelola *database schema* lokal. Bertanggung jawab membuat *table/stores* (`barang`, `pelanggan`, `kategoriKas`, `titipJual`, `pelunasanTitip`, `kasLain`, dan `transaksi`), mengelola fungsi validasi transaksi (`addValidatedTransaksi`), serta memasukkan *seed data* awal (`db.on("populate")`).
* **`p2p.js`** *(Logika PeerJS Master & Client)*  
  Menangani arsitektur perutean mode perangkat (`STANDALONE`, `MASTER`, `CLIENT`). Bertugas menginisialisasi Peer ID, mengelola koneksi antar-HP, serta menangani permintaan sinkronisasi data (`REQ_SYNC_MASTER` dan `RES_SYNC_MASTER`).
* **`ui.js`** *(Event Handler, Modal, & Render UI)*  
  Fokus pada manipulasi DOM. Menangani pemindahan tab (`switchTab`), pembukaan dan penutupan *modal pop-up* (seperti modal barang, modal pelanggan, modal pelunasan), kalkulasi tagihan otomatis, serta fungsi *re-render* tabel/grid data (`refreshUI`).
* **`app.js`** *(Entry Point & Event Listener Utama)*  
  Menjadi jembatan pengikat antar-modul. Berisi *event listener* saat dokumen pertama kali dimuat (`DOMContentLoaded`), meng-handle *submit* pada form utama (Titip Jual, Kas Masuk, Kas Keluar), serta mengeksekusi fitur Backup/Restore database JSON.