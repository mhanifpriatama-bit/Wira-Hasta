let activeTitipItemForPayment = null;

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('bg-emerald-900', 'border-b-2', 'border-yellow-400'));

  document.getElementById(`sec-${tabName}`).classList.remove('hidden');
  document.getElementById(`tab-${tabName}`).classList.add('bg-emerald-900', 'border-b-2', 'border-yellow-400');
}

function copyPeerId() {
  const idText = document.getElementById('displayPeerId').innerText;
  navigator.clipboard.writeText(idText);
}

function checkNewPelangganTrigger(val) {
  if (val === '+input baru') {
    document.getElementById('modalIdPelanggan').value = 'PLG-' + Date.now().toString().slice(-4);
    document.getElementById('modalNamaPelanggan').value = '';
    document.getElementById('modalNoHPPelanggan').value = '';
    document.getElementById('modalPelanggan').classList.remove('hidden');
    document.getElementById('titipPelangganInput').value = '';
    document.getElementById('kasMasukPihakInput').value = '';
    document.getElementById('kasKeluarPihakInput').value = '';
  }
}

async function saveModalPelanggan(e) {
  e.preventDefault();
  const idPelanggan = document.getElementById('modalIdPelanggan').value.trim();
  const nama = document.getElementById('modalNamaPelanggan').value.trim();
  const nohp = document.getElementById('modalNoHPPelanggan').value.trim();
  if (!nama || !idPelanggan) return;

  await db.pelanggan.add({ idPelanggan, nama, nohp, deposit: 0 });
  closeModal('modalPelanggan');
  await refreshUI();
  document.getElementById('titipPelangganInput').value = nama;
}

async function openModalTambahBarangDirect() {
  if (currentRole === 'CLIENT') return;
  document.getElementById('modalBarangTitle').innerText = "Tambah Barang Baru";
  document.getElementById('btnSubmitModalBarang').innerText = "Simpan Barang";
  document.getElementById('modalBarangEditId').value = "";
  
  document.getElementById('modalSKUBarang').value = 'BRG-' + Date.now().toString().slice(-4);
  document.getElementById('modalNamaBarang').value = '';
  document.getElementById('modalHPPBarang').value = '';
  document.getElementById('modalHargaBarang').value = '';
  document.getElementById('modalStokBarang').value = '0';

  await populateSelectBarangEdit();
  document.getElementById('modalSelectBarangEdit').value = "";
  document.getElementById('modalBarang').classList.remove('hidden');
}

async function openModalUpdateBarangDirect() {
  if (currentRole === 'CLIENT') return;
  document.getElementById('modalBarangTitle').innerText = "Update Data Barang";
  document.getElementById('btnSubmitModalBarang').innerText = "Update Barang";
  
  await populateSelectBarangEdit();
  const select = document.getElementById('modalSelectBarangEdit');
  if (select.options.length > 1) {
    select.selectedIndex = 1;
    onSelectBarangEditChange(select.value);
  } else {
    document.getElementById('modalBarangEditId').value = "";
    document.getElementById('modalSKUBarang').value = '';
    document.getElementById('modalNamaBarang').value = '';
    document.getElementById('modalHPPBarang').value = '';
    document.getElementById('modalHargaBarang').value = '';
    document.getElementById('modalStokBarang').value = '0';
  }

  document.getElementById('modalBarang').classList.remove('hidden');
}

async function populateSelectBarangEdit() {
  const select = document.getElementById('modalSelectBarangEdit');
  const barangList = await db.barang.toArray();
  select.innerHTML = '<option value="">-- Tambah Barang Baru --</option>' +
    barangList.map(b => `<option value="${b.id}">${b.sku} - ${b.nama}</option>`).join('');
}

async function onSelectBarangEditChange(idVal) {
  if (!idVal) {
    document.getElementById('modalBarangTitle').innerText = "Tambah Barang Baru";
    document.getElementById('btnSubmitModalBarang').innerText = "Simpan Barang";
    document.getElementById('modalBarangEditId').value = "";
    document.getElementById('modalSKUBarang').value = 'BRG-' + Date.now().toString().slice(-4);
    document.getElementById('modalNamaBarang').value = '';
    document.getElementById('modalHPPBarang').value = '';
    document.getElementById('modalHargaBarang').value = '';
    document.getElementById('modalStokBarang').value = '0';
    return;
  }

  const b = await db.barang.get(parseInt(idVal));
  if (b) {
    document.getElementById('modalBarangTitle').innerText = "Update Data Barang";
    document.getElementById('btnSubmitModalBarang').innerText = "Update Barang";
    document.getElementById('modalBarangEditId').value = b.id;
    document.getElementById('modalSKUBarang').value = b.sku;
    document.getElementById('modalNamaBarang').value = b.nama;
    document.getElementById('modalHPPBarang').value = b.hppDefault;
    document.getElementById('modalHargaBarang').value = b.hargaJual;
    document.getElementById('modalStokBarang').value = b.stok;
  }
}

function checkNewBarangTrigger(val) {
  if (val === '+input baru') {
    openModalTambahBarangDirect();
    document.getElementById('titipBarangInput').value = '';
  }
}

async function saveModalBarang(e) {
  e.preventDefault();
  const editId = document.getElementById('modalBarangEditId').value;
  const sku = document.getElementById('modalSKUBarang').value.trim();
  const nama = document.getElementById('modalNamaBarang').value.trim();
  const hppDefault = parseInt(document.getElementById('modalHPPBarang').value) || 0;
  const hargaJual = parseInt(document.getElementById('modalHargaBarang').value) || 0;
  const stok = parseInt(document.getElementById('modalStokBarang').value) || 0;

  if (editId) {
    await db.barang.update(parseInt(editId), { sku, nama, hppDefault, hargaJual, stok });
  } else {
    const exist = await db.barang.where('sku').equals(sku).first();
    if (exist) {
      await db.barang.update(exist.id, { nama, hppDefault, hargaJual, stok });
    } else {
      await db.barang.add({ sku, nama, hppDefault, hargaJual, stok });
    }
  }

  closeModal('modalBarang');
  await refreshUI();
  document.getElementById('titipBarangInput').value = nama;
}

function checkNewKategoriMasukTrigger(val) {
  if (val === '+input baru') {
    document.getElementById('modalKategoriTargetType').value = 'MASUK';
    document.getElementById('modalNamaKategoriKas').value = '';
    document.getElementById('modalJenisKategoriKas').value = 'MASUK';
    document.getElementById('modalKategoriKas').classList.remove('hidden');
    document.getElementById('kasMasukKategoriInput').value = '';
  }
}

function checkNewKategoriKeluarTrigger(val) {
  if (val === '+input baru') {
    document.getElementById('modalKategoriTargetType').value = 'KELUAR';
    document.getElementById('modalNamaKategoriKas').value = '';
    document.getElementById('modalJenisKategoriKas').value = 'KELUAR';
    document.getElementById('modalKategoriKas').classList.remove('hidden');
    document.getElementById('kasKeluarKategoriInput').value = '';
  }
}

async function saveModalKategoriKas(e) {
  e.preventDefault();
  const nama = document.getElementById('modalNamaKategoriKas').value.trim();
  const jenis = document.getElementById('modalJenisKategoriKas').value;
  const target = document.getElementById('modalKategoriTargetType').value;
  if (!nama) return;

  await db.kategoriKas.add({ nama, jenis });
  closeModal('modalKategoriKas');
  await refreshUI();

  if (target === 'MASUK') {
    document.getElementById('kasMasukKategoriInput').value = nama;
  } else {
    document.getElementById('kasKeluarKategoriInput').value = nama;
  }
}

async function openModalSelesaikanDeposit(pelangganId) {
  const pel = await db.pelanggan.get(pelangganId);
  if (!pel || !pel.deposit) return;

  document.getElementById('sdPelangganId').value = pel.id;
  document.getElementById('sdSaldoDeposit').value = pel.deposit;
  document.getElementById('sdNamaPelanggan').innerText = `${pel.nama} (${pel.idPelanggan || 'N/A'})`;
  document.getElementById('sdDisplaySaldo').innerText = `Rp ${pel.deposit.toLocaleString()}`;
  document.getElementById('sdDisplaySaldo').className = `text-base font-extrabold ${pel.deposit < 0 ? 'text-red-600' : 'text-emerald-700'}`;

  const infoBox = document.getElementById('sdInfoActionBox');
  if (pel.deposit > 0) {
    infoBox.className = "p-3 rounded border border-emerald-300 bg-emerald-50 text-emerald-900 text-sm leading-relaxed";
    infoBox.innerHTML = `
      <p class="font-semibold"><i class="fa-solid fa-hand-holding-dollar text-emerald-600 mr-1"></i> Tindakan: Bayar ke Pelanggan</p>
      <p class="text-xs text-gray-600 mt-1">Sistem akan mengeluarkan uang kas sebesar <strong>Rp ${pel.deposit.toLocaleString()}</strong> untuk dikembalikan ke pelanggan, mengubah deposit menjadi <strong>Rp 0</strong>, dan mencatat transaksi sebagai <strong>PENYELESAIAN_DEPOSIT</strong>.</p>
    `;
  } else {
    infoBox.className = "p-3 rounded border border-red-300 bg-red-50 text-red-900 text-sm leading-relaxed";
    infoBox.innerHTML = `
      <p class="font-semibold"><i class="fa-solid fa-hand-holding-hand text-red-600 mr-1"></i> Tindakan: Tarik Kurang Bayar dari Pelanggan</p>
      <p class="text-xs text-gray-600 mt-1">Sistem akan menerima uang dari pelanggan sebesar <strong>Rp ${Math.abs(pel.deposit).toLocaleString()}</strong> untuk melunasi kekurangan, mengubah deposit menjadi <strong>Rp 0</strong>, dan mencatat transaksi sebagai <strong>PENYELESAIAN_DEPOSIT</strong>.</p>
    `;
  }

  document.getElementById('modalSelesaikanDeposit').classList.remove('hidden');
}

async function prosesSelesaikanDepositSubmit(e) {
  e.preventDefault();
  const pelId = parseInt(document.getElementById('sdPelangganId').value);
  const depositVal = parseInt(document.getElementById('sdSaldoDeposit').value);

  const pel = await db.pelanggan.get(pelId);
  if (!pel) return;

  const tgl = new Date().toISOString();
  const terminalId = currentRole === 'CLIENT' ? 'Client-' + (peer ? peer.id : 'unk') : 'Local';
  const nominalAbs = Math.abs(depositVal);

  let rincianTeks = depositVal > 0 
    ? `Penyelesaian Deposit: Bayar ke pelanggan ${pel.nama} (Rp ${nominalAbs.toLocaleString()})`
    : `Penyelesaian Deposit: Tarik kurang bayar dari pelanggan ${pel.nama} (Rp ${nominalAbs.toLocaleString()})`;

  await db.pelanggan.update(pelId, { deposit: 0 });

  await addValidatedTransaksi({
    tanggal: tgl,
    tipe: 'PENYELESAIAN_DEPOSIT',
    rincian: rincianTeks,
    nominalOrQty: `Rp ${nominalAbs.toLocaleString()}`,
    terminalId: terminalId,
    refId: pelId
  });

  closeModal('modalSelesaikanDeposit');
  refreshUI();
}

async function prosesTitipJualBaru(e) {
  e.preventDefault();
  const namaPelanggan = document.getElementById('titipPelangganInput').value.trim();
  const namaBarang = document.getElementById('titipBarangInput').value.trim();
  const qty = parseInt(document.getElementById('titipQtyInput').value);

  if (!namaPelanggan || !namaBarang || !qty) return;

  const barang = await db.barang.where('nama').equalsIgnoreCase(namaBarang).first();
  const hargaJual = barang ? barang.hargaJual : 0;
  const tgl = new Date().toISOString();
  const terminalId = currentRole === 'CLIENT' ? 'Client-' + (peer ? peer.id : 'unk') : 'Local';

  const titipId = await db.titipJual.add({
    nomorNota: 'NT-' + Date.now().toString().slice(-6),
    tanggal: tgl,
    namaPelanggan: namaPelanggan,
    namaBarang: namaBarang,
    qtyTitip: qty,
    hargaJual: hargaJual,
    status: 'BELUM_BAYAR',
    terminalId: terminalId
  });

  await addValidatedTransaksi({
    tanggal: tgl,
    tipe: 'NOTA_TITIP_JUAL',
    rincian: `Nota Titip: ${namaPelanggan} - ${namaBarang} (${qty} Pcs)`,
    nominalOrQty: `Qty: ${qty}`,
    terminalId: terminalId,
    refId: titipId
  });

  document.getElementById('formTitipJual').reset();
  refreshUI();
}

async function openModalBayar(id) {
  const item = await db.titipJual.get(id);
  if (!item) return;

  activeTitipItemForPayment = item;
  document.getElementById('pelunasanId').value = item.id;
  document.getElementById('pelunasanInfoPelanggan').innerText = `Pelanggan: ${item.namaPelanggan}`;
  document.getElementById('pelunasanInfoBarang').innerText = `Barang: ${item.namaBarang}`;
  document.getElementById('pelunasanInfoQty').innerText = `Qty Titip: ${item.qtyTitip}`;
  
  const returInput = document.getElementById('pelunasanQtyRetur');
  returInput.value = 0;
  returInput.max = item.qtyTitip;

  hitungTotalPelunasan();
  document.getElementById('modalPelunasan').classList.remove('hidden');
}

function hitungTotalPelunasan() {
  if (!activeTitipItemForPayment) return;

  const qtyTitip = activeTitipItemForPayment.qtyTitip;
  const hargaJual = activeTitipItemForPayment.hargaJual || 0;
  const returVal = document.getElementById('pelunasanQtyRetur');
  const qtyRetur = !returVal || returVal.value === '' ? 0 : (parseInt(returVal.value) || 0);
  const qtyLaku = Math.max(0, qtyTitip - qtyRetur);
  const totalTagihan = qtyLaku * hargaJual;

  document.getElementById('pelunasanTotalTagihan').value = totalTagihan;
  document.getElementById('pelunasanUangDiterima').value = totalTagihan;
}

function quickSetUangDiterima(mode) {
  const totalTagihan = parseInt(document.getElementById('pelunasanTotalTagihan').value) || 0;
  const uangDiterimaInput = document.getElementById('pelunasanUangDiterima');
  if (mode === 'lunas') {
    uangDiterimaInput.value = totalTagihan;
  } else if (mode === 'hutang') {
    uangDiterimaInput.value = 0;
  }
}

function quickAddUangDiterima(amount) {
  const uangDiterimaInput = document.getElementById('pelunasanUangDiterima');
  const currentVal = parseInt(uangDiterimaInput.value) || 0;
  uangDiterimaInput.value = currentVal + amount;
}

async function prosesPelunasanSubmit(e) {
  e.preventDefault();
  if (!activeTitipItemForPayment) return;

  const id = parseInt(document.getElementById('pelunasanId').value);
  const returVal = document.getElementById('pelunasanQtyRetur').value;
  const qtyRetur = returVal === '' ? 0 : (parseInt(returVal) || 0);
  const qtyLaku = Math.max(0, activeTitipItemForPayment.qtyTitip - qtyRetur);
  const totalTagihan = parseInt(document.getElementById('pelunasanTotalTagihan').value) || 0;
  const uangDiterimaVal = document.getElementById('pelunasanUangDiterima').value;
  const uangDiterima = uangDiterimaVal === '' ? 0 : (parseInt(uangDiterimaVal) || 0);

  const selisihDeposit = uangDiterima - totalTagihan;
  const tgl = new Date().toISOString();
  const terminalId = currentRole === 'CLIENT' ? 'Client-' + (peer ? peer.id : 'unk') : 'Local';

  await db.titipJual.update(id, { status: 'LUNAS' });

  const pelunasanId = await db.pelunasanTitip.add({
    tanggal: tgl,
    idTitip: id,
    qtyLaku: qtyLaku,
    qtyRetur: qtyRetur,
    uangDiterima: uangDiterima,
    depositDibuat: selisihDeposit,
    terminalId: terminalId
  });

  const pel = await db.pelanggan.where('nama').equalsIgnoreCase(activeTitipItemForPayment.namaPelanggan).first();
  if (pel) {
    await db.pelanggan.update(pel.id, { deposit: (pel.deposit || 0) + selisihDeposit });
  }

  await addValidatedTransaksi({
    tanggal: tgl,
    tipe: 'PELUNASAN_TITIP',
    rincian: `Pelunasan: ${activeTitipItemForPayment.namaPelanggan} - ${activeTitipItemForPayment.namaBarang} (Laku: ${qtyLaku}, Retur: ${qtyRetur})`,
    nominalOrQty: `Rp ${totalTagihan.toLocaleString()}`,
    terminalId: terminalId,
    refId: pelunasanId
  });

  closeModal('modalPelunasan');
  refreshUI();
}

async function prosesKasMasuk(e) {
  e.preventDefault();
  const kategori = document.getElementById('kasMasukKategoriInput').value.trim();
  const pihak = document.getElementById('kasMasukPihakInput').value.trim();
  const nominal = parseInt(document.getElementById('kasMasukNominalInput').value);
  const keterangan = document.getElementById('kasMasukKeteranganInput').value.trim();

  if (!kategori || !pihak || !nominal) return;

  const tgl = new Date().toISOString();
  const terminalId = currentRole === 'CLIENT' ? 'Client-' + (peer ? peer.id : 'unk') : 'Local';

  const kasId = await db.kasLain.add({
    tanggal: tgl,
    jenis: 'MASUK',
    kategori: kategori,
    pihak: pihak,
    nominal: nominal,
    keterangan: keterangan,
    terminalId: terminalId
  });

  await addValidatedTransaksi({
    tanggal: tgl,
    tipe: 'KAS_MASUK',
    rincian: `Kas Masuk: [${kategori}] Dari ${pihak}${keterangan ? ' - ' + keterangan : ''}`,
    nominalOrQty: `Rp ${nominal.toLocaleString()}`,
    terminalId: terminalId,
    refId: kasId
  });

  document.getElementById('formKasMasuk').reset();
  refreshUI();
}

async function prosesKasKeluar(e) {
  e.preventDefault();
  const kategori = document.getElementById('kasKeluarKategoriInput').value.trim();
  const pihak = document.getElementById('kasKeluarPihakInput').value.trim();
  const nominal = parseInt(document.getElementById('kasKeluarNominalInput').value);
  const keterangan = document.getElementById('kasKeluarKeteranganInput').value.trim();

  if (!kategori || !pihak || !nominal) return;

  const tgl = new Date().toISOString();
  const terminalId = currentRole === 'CLIENT' ? 'Client-' + (peer ? peer.id : 'unk') : 'Local';

  const kasId = await db.kasLain.add({
    tanggal: tgl,
    jenis: 'KELUAR',
    kategori: kategori,
    pihak: pihak,
    nominal: nominal,
    keterangan: keterangan,
    terminalId: terminalId
  });

  await addValidatedTransaksi({
    tanggal: tgl,
    tipe: 'KAS_KELUAR',
    rincian: `Kas Keluar: [${kategori}] Ke ${pihak}${keterangan ? ' - ' + keterangan : ''}`,
    nominalOrQty: `Rp ${nominal.toLocaleString()}`,
    terminalId: terminalId,
    refId: kasId
  });

  document.getElementById('formKasKeluar').reset();
  refreshUI();
}

async function refreshUI() {
  const barangList = await db.barang.toArray();
  const pelangganList = await db.pelanggan.toArray();
  const kasKategoriList = await db.kategoriKas.toArray();

  const pelangganMap = {};
  pelangganList.forEach(p => { pelangganMap[p.nama] = p.idPelanggan || p.nama; });

  const barangMap = {};
  barangList.forEach(b => { barangMap[b.nama] = b.sku || b.nama; });

  const pelangganOptionsHtml = pelangganList.map(p => `<option value="${p.nama}">`).join('') + '<option value="+input baru">+input baru</option>';
  document.getElementById('pelangganListOptions').innerHTML = pelangganOptionsHtml;

  const barangOptionsHtml = barangList.map(b => `<option value="${b.nama}">`).join('') + '<option value="+input baru">+input baru</option>';
  document.getElementById('barangListOptions').innerHTML = barangOptionsHtml;

  document.getElementById('pihakKasMasukOptions').innerHTML = pelangganOptionsHtml;
  document.getElementById('pihakKasKeluarOptions').innerHTML = pelangganOptionsHtml;

  const listMasuk = kasKategoriList.filter(k => k.jenis === 'MASUK');
  document.getElementById('kategoriMasukOptions').innerHTML = listMasuk.map(k => `<option value="${k.nama}">`).join('') + '<option value="+input baru">+input baru</option>';

  const listKeluar = kasKategoriList.filter(k => k.jenis === 'KELUAR');
  document.getElementById('kategoriKeluarOptions').innerHTML = listKeluar.map(k => `<option value="${k.nama}">`).join('') + '<option value="+input baru">+input baru</option>';

  const listBelumBayar = await db.titipJual.where('status').equals('BELUM_BAYAR').reverse().toArray();
  const titipGridContainer = document.getElementById('titipGridContainer');
  if (listBelumBayar.length === 0) {
    titipGridContainer.innerHTML = '<p class="text-center py-4 text-gray-400 italic">Tidak ada data transaksi belum bayar</p>';
  } else {
    titipGridContainer.innerHTML = listBelumBayar.map(item => {
      const idPlg = pelangganMap[item.namaPelanggan] || item.namaPelanggan;
      const skuBrg = barangMap[item.namaBarang] || item.namaBarang;
      return `
        <div class="bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-950 p-3 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-2 transition-all">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="font-bold text-sm bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">${idPlg}</span>
            <span class="text-sm font-semibold text-gray-700"><strong class="font-mono text-emerald-900">${skuBrg}</strong></span>
            <span class="text-sm font-semibold text-gray-700"><strong class="text-emerald-900">${item.qtyTitip}</strong></span>
          </div>
          <button onclick="openModalBayar(${item.id})" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-1.5 rounded shadow flex items-center gap-1">
            <i class="fa-solid fa-hand-holding-dollar"></i></button>
        </div>
      `;
    }).join('');
  }

  const activeDepositList = pelangganList.filter(p => (p.deposit || 0) !== 0);
  const depositGridContainer = document.getElementById('depositGridContainer');
  if (activeDepositList.length === 0) {
    depositGridContainer.innerHTML = '<p class="text-center py-4 text-gray-400 italic col-span-full">Tidak ada pelanggan dengan saldo deposit aktif</p>';
  } else {
    depositGridContainer.innerHTML = activeDepositList.map(p => {
      const displayNominal = formatNominalK(p.deposit);
      const textColor = p.deposit > 0 ? 'text-blue-600' : 'text-red-600';
      const idPlg = p.idPelanggan || p.nama;
      return `
        <div onclick="openModalSelesaikanDeposit(${p.id})" class="cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 p-3 rounded-lg shadow-sm flex flex-col items-center justify-center transition-all">
          <span class="font-bold text-xs text-gray-700 select-none">${idPlg}</span>
          <span class="font-extrabold text-base ${textColor} select-none">${displayNominal}</span>
        </div>
      `;
    }).join('');
  }

  const masterPelangganTbody = document.getElementById('masterPelangganTableBody');
  masterPelangganTbody.innerHTML = pelangganList.map(p => `
    <tr>
      <td class="p-2 font-mono font-bold">${p.idPelanggan || '-'}</td>
      <td class="p-2 font-semibold">${p.nama}</td>
      <td class="p-2">${p.nohp || '-'}</td>
      <td class="p-2 text-right font-bold ${p.deposit < 0 ? 'text-red-600' : 'text-emerald-700'}">Rp ${(p.deposit || 0).toLocaleString()}</td>
    </tr>
  `).join('');

  const masterBarangTbody = document.getElementById('masterBarangTableBody');
  masterBarangTbody.innerHTML = barangList.map(b => `
    <tr>
      <td class="p-2 font-mono">${b.sku}</td>
      <td class="p-2 font-semibold">${b.nama}</td>
      <td class="p-2 text-right">Rp ${b.hppDefault.toLocaleString()}</td>
      <td class="p-2 text-right">Rp ${b.hargaJual.toLocaleString()}</td>
      <td class="p-2 text-center font-bold">${b.stok}</td>
    </tr>
  `).join('');

  const listTransaksi = await db.transaksi.toArray();
  const masterTransaksiTbody = document.getElementById('masterTransaksiTableBody');
  if (listTransaksi.length === 0) {
    masterTransaksiTbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-gray-400 italic">Belum ada data transaksi</td></tr>';
  } else {
    let runningSaldoKas = 0;
    const rowsHtml = [];

    for (const t of listTransaksi) {
      let perubahanKas = 0;
      if (t.tipe === 'KAS_MASUK' || t.tipe === 'PELUNASAN_TITIP') {
        perubahanKas = parseInt(t.nominalOrQty.replace(/[^0-9]/g, '')) || 0;
      } else if (t.tipe === 'KAS_KELUAR') {
        perubahanKas = -(parseInt(t.nominalOrQty.replace(/[^0-9]/g, '')) || 0);
      } else if (t.tipe === 'PENYELESAIAN_DEPOSIT') {
        const val = parseInt(t.nominalOrQty.replace(/[^0-9]/g, '')) || 0;
        perubahanKas = t.rincian.includes('Bayar ke pelanggan') ? -val : val;
      }

      runningSaldoKas += perubahanKas;

      rowsHtml.push(`
        <tr>
          <td class="p-2 text-xs">${new Date(t.tanggal).toLocaleString('id-ID')}</td>
          <td class="p-2 font-bold text-xs">${t.tipe}</td>
          <td class="p-2 text-gray-700 text-xs">${t.rincian}</td>
          <td class="p-2 text-right font-bold text-xs">${t.nominalOrQty}</td>
          <td class="p-2 text-right font-bold text-xs ${runningSaldoKas < 0 ? 'text-red-600' : 'text-emerald-700'}">Rp ${runningSaldoKas.toLocaleString('id-ID')}</td>
        </tr>
      `);
    }

    masterTransaksiTbody.innerHTML = rowsHtml.join('');
    const container = document.getElementById('transaksiTableContainer');
    if (container) container.scrollTop = container.scrollHeight;
  }
}

async function kirimDaftarTitipWA() {
  const listBelumBayar = await db.titipJual.where('status').equals('BELUM_BAYAR').toArray();
  const pelangganList = await db.pelanggan.toArray();
  const barangList = await db.barang.toArray();

  const pelangganMap = {};
  pelangganList.forEach(p => pelangganMap[p.nama] = p.idPelanggan || p.nama);

  const barangMap = {};
  barangList.forEach(b => barangMap[b.nama] = b.sku || b.nama);

  let csvContent = "";
  listBelumBayar.forEach(item => {
    const idPlg = pelangganMap[item.namaPelanggan] || item.namaPelanggan;
    const skuBrg = barangMap[item.namaBarang] || item.namaBarang;
    csvContent += `${idPlg},${skuBrg},${item.qtyTitip},\n`;
  });

  const targetNumber = "6282323707088";
  window.open(`https://wa.me/${targetNumber}?text=${encodeURIComponent(csvContent)}`, '_blank');
}

async function backupDatabaseJSON() {
  try {
    const exportData = {
      version: 4,
      timestamp: new Date().toISOString(),
      tables: {
        barang: await db.barang.toArray(),
        pelanggan: await db.pelanggan.toArray(),
        kategoriKas: await db.kategoriKas.toArray(),
        titipJual: await db.titipJual.toArray(),
        pelunasanTitip: await db.pelunasanTitip.toArray(),
        kasLain: await db.kasLain.toArray(),
        transaksi: await db.transaksi.toArray()
      }
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `WirahastaDB_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Gagal melakukan backup database: " + err.message);
  }
}

async function restoreDatabaseJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!confirm("Apakah Anda yakin ingin memulihkan database? Data saat ini akan diganti sepenuhnya.")) {
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.tables) throw new Error("Format file JSON backup tidak valid.");

      await db.transaction('rw', [db.barang, db.pelanggan, db.kategoriKas, db.titipJual, db.pelunasanTitip, db.kasLain, db.transaksi], async () => {
        if (data.tables.barang) { await db.barang.clear(); await db.barang.bulkAdd(data.tables.barang); }
        if (data.tables.pelanggan) { await db.pelanggan.clear(); await db.pelanggan.bulkAdd(data.tables.pelanggan); }
        if (data.tables.kategoriKas) { await db.kategoriKas.clear(); await db.kategoriKas.bulkAdd(data.tables.kategoriKas); }
        if (data.tables.titipJual) { await db.titipJual.clear(); await db.titipJual.bulkAdd(data.tables.titipJual); }
        if (data.tables.pelunasanTitip) { await db.pelunasanTitip.clear(); await db.pelunasanTitip.bulkAdd(data.tables.pelunasanTitip); }
        if (data.tables.kasLain) { await db.kasLain.clear(); await db.kasLain.bulkAdd(data.tables.kasLain); }
        if (data.tables.transaksi) { await db.transaksi.clear(); await db.transaksi.bulkAdd(data.tables.transaksi); }
      });

      alert("Restore database berhasil!");
      await refreshUI();
    } catch (err) {
      alert("Gagal melakukan restore database: " + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}