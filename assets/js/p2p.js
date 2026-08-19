let currentRole = 'STANDALONE';
let peer = null;
let p2pConn = null;
let activeClients = [];

function changeRole(newRole) {
  currentRole = newRole;
  document.getElementById('footerNodeInfo').innerText = `Mode: ${newRole}`;

  if (peer) { peer.destroy(); peer = null; }
  p2pConn = null;
  activeClients = [];

  const p2pBadge = document.getElementById('p2pStatusBadge');
  const peerIdContainer = document.getElementById('peerIdContainer');
  const btnConnect = document.getElementById('btnConnectMaster');
  const clientAlert = document.getElementById('clientDisconnectAlert');
  const masterNotice = document.getElementById('masterClientReadOnlyNotice');
  const barangButtons = document.getElementById('barangActionButtons');

  p2pBadge.classList.add('hidden');
  peerIdContainer.classList.add('hidden');
  btnConnect.classList.add('hidden');
  clientAlert.classList.add('hidden');
  masterNotice.classList.add('hidden');

  if (newRole === 'MASTER') {
    initMasterPeer();
    peerIdContainer.classList.remove('hidden');
    p2pBadge.classList.remove('hidden');
    updateP2PBadge(false, "Menunggu Client");
    if (barangButtons) barangButtons.classList.remove('hidden');
  } else if (newRole === 'CLIENT') {
    initClientPeer();
    btnConnect.classList.remove('hidden');
    p2pBadge.classList.remove('hidden');
    masterNotice.classList.remove('hidden');
    updateP2PBadge(false, "Disconnected");
    if (barangButtons) barangButtons.classList.add('hidden');
  } else {
    if (barangButtons) barangButtons.classList.remove('hidden');
  }

  if (typeof refreshUI === 'function') refreshUI();
}

function initMasterPeer() {
  peer = new Peer();
  peer.on('open', (id) => {
    document.getElementById('displayPeerId').innerText = id;
  });

  peer.on('connection', (conn) => {
    activeClients.push(conn);
    updateP2PBadge(true, `${activeClients.length} Client Terhubung`);

    conn.on('data', async (data) => {
      await handleP2PDataOnMaster(data, conn);
    });

    conn.on('close', () => {
      activeClients = activeClients.filter(c => c !== conn);
      updateP2PBadge(activeClients.length > 0, activeClients.length > 0 ? `${activeClients.length} Client Terhubung` : "Menunggu Client");
    });
  });
}

function initClientPeer() {
  peer = new Peer();
  peer.on('open', (id) => {
    console.log("Client Peer Opened, ID:", id);
  });
}

function promptConnectToMaster() {
  const masterId = prompt("Masukkan Peer ID milik HP Master:");
  if (!masterId) return;

  p2pConn = peer.connect(masterId);

  p2pConn.on('open', () => {
    updateP2PBadge(true, "Terhubung ke Master");
    document.getElementById('clientDisconnectAlert').classList.add('hidden');
    p2pConn.send({ type: 'REQ_SYNC_MASTER' });
  });

  p2pConn.on('data', async (data) => {
    await handleP2PDataOnClient(data);
  });

  p2pConn.on('close', () => {
    updateP2PBadge(false, "Terputus dari Master");
    document.getElementById('clientDisconnectAlert').classList.add('hidden');
  });
}

function updateP2PBadge(connected, text) {
  const indicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('p2pStatusText');
  statusText.innerText = text;
  indicator.className = connected ? "w-2 h-2 rounded-full bg-green-500 inline-block mr-1.5" : "w-2 h-2 rounded-full bg-red-500 inline-block mr-1.5";
}

async function handleP2PDataOnMaster(data, conn) {
  if (data.type === 'REQ_SYNC_MASTER') {
    const barangList = await db.barang.toArray();
    const pelangganList = await db.pelanggan.toArray();
    const kasKategoriList = await db.kategoriKas.toArray();
    const transaksiList = await db.transaksi.toArray();
    conn.send({
      type: 'RES_SYNC_MASTER',
      payload: { barang: barangList, pelanggan: pelangganList, kategoriKas: kasKategoriList, transaksi: transaksiList }
    });
  }
}

async function handleP2PDataOnClient(data) {
  if (data.type === 'RES_SYNC_MASTER') {
    await db.barang.clear(); await db.barang.bulkAdd(data.payload.barang);
    await db.pelanggan.clear(); await db.pelanggan.bulkAdd(data.payload.pelanggan);
    await db.kategoriKas.clear(); await db.kategoriKas.bulkAdd(data.payload.kategoriKas);
    if (data.payload.transaksi) {
      await db.transaksi.clear(); await db.transaksi.bulkAdd(data.payload.transaksi);
    }
    if (typeof refreshUI === 'function') refreshUI();
  }
}