document.addEventListener('DOMContentLoaded', async () => {
  // 1. Inisialisasi DB & Tampilan Awal
  await db.open();
  await refreshUI();

  // 2. Navigation Tabs Listener
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // 3. Modals Close Button Listener
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modal));
  });

  // 4. Role Selection Listener
  document.getElementById('roleSelect').addEventListener('change', (e) => changeRole(e.value));
  document.getElementById('btnConnectMaster').addEventListener('click', promptConnectToMaster);
  document.getElementById('btnCopyPeerId').addEventListener('click', copyPeerId);

  // 5. Triggers Datalist Auto Input Modal
  document.getElementById('titipPelangganInput').addEventListener('change', (e) => checkNewPelangganTrigger(e.target.value));
  document.getElementById('kasMasukPihakInput').addEventListener('change', (e) => checkNewPelangganTrigger(e.target.value));
  document.getElementById('kasKeluarPihakInput').addEventListener('change', (e) => checkNewPelangganTrigger(e.target.value));
  document.getElementById('titipBarangInput').addEventListener('change', (e) => checkNewBarangTrigger(e.target.value));
  document.getElementById('kasMasukKategoriInput').addEventListener('change', (e) => checkNewKategoriMasukTrigger(e.target.value));
  document.getElementById('kasKeluarKategoriInput').addEventListener('change', (e) => checkNewKategoriKeluarTrigger(e.target.value));

  // 6. Form Submissions
  document.getElementById('formTitipJual').addEventListener('submit', prosesTitipJualBaru);
  document.getElementById('formKasMasuk').addEventListener('submit', prosesKasMasuk);
  document.getElementById('formKasKeluar').addEventListener('submit', prosesKasKeluar);
  document.getElementById('formModalPelanggan').addEventListener('submit', saveModalPelanggan);
  document.getElementById('formModalBarang').addEventListener('submit', saveModalBarang);
  document.getElementById('formModalKategoriKas').addEventListener('submit', saveModalKategoriKas);
  document.getElementById('formModalPelunasan').addEventListener('submit', prosesPelunasanSubmit);
  document.getElementById('formModalSelesaikanDeposit').addEventListener('submit', prosesSelesaikanDepositSubmit);

  // 7. Barang Modal Direct Buttons
  document.getElementById('btnTambahBarang').addEventListener('click', openModalTambahBarangDirect);
  document.getElementById('btnUpdateBarang').addEventListener('click', openModalUpdateBarangDirect);
  document.getElementById('modalSelectBarangEdit').addEventListener('change', (e) => onSelectBarangEditChange(e.target.value));

  // 8. Pelunasan Modal Quick Helpers
  document.getElementById('pelunasanQtyRetur').addEventListener('input', hitungTotalPelunasan);
  document.getElementById('btnQuickLunas').addEventListener('click', () => quickSetUangDiterima('lunas'));
  document.getElementById('btnQuickHutang').addEventListener('click', () => quickSetUangDiterima('hutang'));
  document.querySelectorAll('.btn-quick-add').forEach(btn => {
    btn.addEventListener('click', () => quickAddUangDiterima(parseInt(btn.dataset.add)));
  });

  // 9. WA & Database Tools
  document.getElementById('btnKirimWA').addEventListener('click', kirimDaftarTitipWA);
  document.getElementById('btnBackupDb').addEventListener('click', backupDatabaseJSON);
  document.getElementById('btnRestoreDbTrigger').addEventListener('click', () => document.getElementById('importJsonFile').click());
  document.getElementById('importJsonFile').addEventListener('change', restoreDatabaseJSON);
});