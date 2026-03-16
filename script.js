/* =============================================
   DRIP CLIENT - MAIN SCRIPT
   All features & functions
   ============================================= */

// ============================================
// JSONBIN CONFIG
// ============================================
const JSONBIN_ID = '69b788adc3097a1dd52ba7ec'; // Will be created dynamically
const JSONBIN_API_KEY = '$2a$10$uzdLhr/GM.l1rf7rJ11x3ey4eWi0Kj7V5eMtEE6o.RfixGw5qAsXG'; // Replace with real key

// JSONBin base URL - using a public bin approach
const BIN_BASE = 'https://api.jsonbin.io/v3/b';

// We'll use a simpler approach: localStorage-based with sessionStorage for persistence
// This makes the demo fully functional. For production, replace with real JSONBin keys.

// ============================================
// LOCAL DATABASE (JSONBin-backed)
// ============================================

const STORAGE_KEY = 'drip_client_db';

function getDB() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  // Default database structure
  return {
    users: [
      { username: 'admin', password: 'admin123', credit: 999, role: 'admin', created: Date.now() },
      { username: 'demo', password: 'demo123', credit: 10, role: 'user', created: Date.now() }
    ],
    products: [
      {
        id: 'prod_1',
        name: 'DRIP CLIENT',
        subtitle: 'Cheat Android Pro',
        image: 'https://cdn-uploads.huggingface.co/production/uploads/noauth/8W2qfrJxJ0G0EplunCycM.jpeg',
        desc: 'Cheat Android terpercaya & aman',
        features: ['No Ban Protection', 'Silent Aim', 'ESP Wallhack', 'Auto Headshot', 'Speed Hack'],
        prices: [
          { label: '1 Day', price: 1 },
          { label: '3 Days', price: 3 },
          { label: '7 Days', price: 7 },
          { label: '15 Days', price: 15 },
          { label: '1 Bulan', price: 30 }
        ]
      }
    ],
    promos: [],
    transactions: [],
    ticker: {
      active: false,
      text: 'KODE PROMO TERBARU : DISKON70%  |  UPDATE TERBARU SUDAH DIRILIS!  |  JOIN CHANNEL WA KAMI!'
    },
    resetSystem: true,
    userResets: {} // track daily resets per user
  };
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  // In production: POST to JSONBin
  syncToJsonbin(db);
}

async function syncToJsonbin(db) {
  // Placeholder for JSONBin sync
  // In production, uncomment and add real API key:
  /*
  try {
    await fetch(`${BIN_BASE}/${JSONBIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY
      },
      body: JSON.stringify(db)
    });
  } catch(e) { console.log('Sync error:', e); }
  */
}

async function loadFromJsonbin() {
  // In production: fetch from JSONBin
  // For now, uses localStorage
  return getDB();
}

// ============================================
// PARTICLES INIT
// ============================================
function initParticles() {
  if (typeof particlesJS === 'undefined') return;
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: ['#7c4dff', '#c084fc', '#4c2f8a', '#9c6fff'] },
      shape: { type: 'circle' },
      opacity: { value: 0.6, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
      size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.5, sync: false } },
      line_linked: { enable: true, distance: 120, color: '#7c4dff', opacity: 0.3, width: 1 },
      move: { enable: true, speed: 1.5, direction: 'none', random: true, out_mode: 'out', bounce: false }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
      modes: { grab: { distance: 140, line_linked: { opacity: 0.6 } }, push: { particles_nb: 4 } }
    },
    retina_detect: true
  });
}

// ============================================
// LOADING SCREEN
// ============================================
function initLoadingScreen(page) {
  const chars = 'DRIPCLIENT'.split('');
  const container = document.getElementById('loading-chars');
  if (!container) return;

  chars.forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'loading-char';
    span.textContent = ch;
    span.style.animationDelay = `${i * 0.12}s`;
    if (ch === 'C') span.style.marginLeft = '14px';
    container.appendChild(span);
  });

  setTimeout(() => {
    const ls = document.getElementById('loading-screen');
    if (ls) ls.classList.add('fade-out');
    setTimeout(() => {
      if (ls) ls.style.display = 'none';
      afterLoad(page);
    }, 800);
  }, 3000);
}

function afterLoad(page) {
  if (page === 'login') {
    const wrap = document.getElementById('auth-content');
    if (wrap) {
      wrap.style.display = 'flex';
      setTimeout(() => {
        const card = document.getElementById('auth-card');
        if (card) card.classList.add('active');
      }, 100);
    }
    // Check already logged in
    const sess = sessionStorage.getItem('drip_session');
    if (sess) window.location.href = 'home.html';
  } else if (page === 'register') {
    const wrap = document.getElementById('auth-content');
    if (wrap) {
      wrap.style.display = 'flex';
      setTimeout(() => {
        const card = document.getElementById('auth-card');
        if (card) card.classList.add('active');
      }, 100);
    }
  } else if (page === 'home') {
    const sess = sessionStorage.getItem('drip_session');
    if (!sess) { window.location.href = 'index.html'; return; }
    const user = JSON.parse(sess);
    initDashboard(user);
  } else if (page === 'admin') {
    const content = document.getElementById('admin-content');
    if (content) content.style.display = 'flex';
    initAdmin();
  }
}

// ============================================
// AUTH - TOGGLE PASSWORD
// ============================================
function togglePass(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btn) btn.innerHTML = '<i class="fa fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    if (btn) btn.innerHTML = '<i class="fa fa-eye"></i>';
  }
}

// ============================================
// LOGIN
// ============================================
async function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-me')?.checked;

  if (!username || !password) {
    Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Username dan password wajib diisi!', confirmButtonText: 'OK' });
    return;
  }

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> &nbsp;Memproses...';

  // Simulate API delay
  await sleep(1200);

  const db = getDB();
  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);

  if (!user) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-sign-in-alt"></i> &nbsp;LOGIN';
    Swal.fire({ icon: 'error', title: 'Login Gagal', text: 'Username atau password salah. Coba lagi!', confirmButtonText: 'OK' });
    return;
  }

  // Remember me
  if (remember) {
    localStorage.setItem('drip_remember', JSON.stringify({ u: username, p: password }));
  } else {
    localStorage.removeItem('drip_remember');
  }

  // Save session
  sessionStorage.setItem('drip_session', JSON.stringify({ username: user.username, credit: user.credit, role: user.role }));

  // Welcome animation
  const overlay = document.getElementById('welcome-overlay');
  const wt = document.getElementById('welcome-text');
  if (overlay && wt) {
    wt.textContent = `Welcome, ${user.username}! 🎉`;
    overlay.classList.add('show');
    setTimeout(() => {
      overlay.classList.remove('show');
      window.location.href = 'home.html';
    }, 3000);
  } else {
    window.location.href = 'home.html';
  }
}

// ============================================
// REGISTER
// ============================================
async function doRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  if (!username || !password || !confirm) {
    Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Semua field wajib diisi!', confirmButtonText: 'OK' });
    return;
  }

  if (username.length < 3) {
    Swal.fire({ icon: 'warning', title: 'Username Terlalu Pendek', text: 'Minimal 3 karakter.', confirmButtonText: 'OK' });
    return;
  }

  if (password.length < 5) {
    Swal.fire({ icon: 'warning', title: 'Password Lemah', text: 'Password minimal 5 karakter.', confirmButtonText: 'OK' });
    return;
  }

  if (password !== confirm) {
    Swal.fire({ icon: 'error', title: 'Password Tidak Cocok', text: 'Konfirmasi password tidak sesuai.', confirmButtonText: 'OK' });
    return;
  }

  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> &nbsp;Mendaftarkan...';

  await sleep(1500);

  const db = getDB();
  const exists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (exists) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-user-plus"></i> &nbsp;REGISTER';
    Swal.fire({ icon: 'error', title: 'Username Sudah Ada', text: 'Username ini sudah digunakan. Coba username lain.', confirmButtonText: 'OK' });
    return;
  }

  // Add user
  db.users.push({
    username,
    password,
    credit: 0,
    role: 'user',
    created: Date.now()
  });
  saveDB(db);

  btn.disabled = false;
  btn.innerHTML = '<i class="fa fa-user-plus"></i> &nbsp;REGISTER';

  await Swal.fire({
    icon: 'success',
    title: '✅ Akun Berhasil Dibuat!',
    html: `Selamat <strong>${username}</strong>! Akun kamu sudah terdaftar.<br>Silahkan login dengan kredensial baru kamu.`,
    confirmButtonText: 'Login Sekarang'
  });

  window.location.href = 'index.html';
}

// ============================================
// DASHBOARD INIT
// ============================================
function initDashboard(user) {
  // Refresh user data from DB
  const db = getDB();
  const dbUser = db.users.find(u => u.username === user.username);
  if (dbUser) {
    user.credit = dbUser.credit;
    sessionStorage.setItem('drip_session', JSON.stringify(user));
  }

  // Show dashboard
  const dc = document.getElementById('dashboard-content');
  if (dc) dc.style.display = 'block';

  // Update topbar
  const tu = document.getElementById('topbar-username');
  const tc = document.getElementById('topbar-credit');
  if (tu) tu.textContent = user.username;
  if (tc) tc.textContent = user.credit.toFixed(2);

  // Nav info
  const nu = document.getElementById('nav-uname');
  const nc = document.getElementById('nav-credit');
  const na = document.getElementById('nav-avatar');
  if (nu) nu.textContent = user.username;
  if (nc) nc.textContent = user.credit.toFixed(2);
  if (na) na.textContent = user.username.charAt(0).toUpperCase();

  // Welcome popup
  setTimeout(() => {
    const popup = document.getElementById('welcome-popup');
    const pu = document.getElementById('popup-username');
    if (pu) pu.textContent = user.username;
    if (popup) popup.classList.add('show');
  }, 500);

  // Load ticker
  loadTicker();

  // Load products
  loadProducts();

  // Load FAQ
  loadFAQ();

  // Scroll animations
  initScrollAnimations();
}

// ============================================
// TICKER
// ============================================
function loadTicker() {
  const db = getDB();
  const ticker = db.ticker;
  const tickerEl = document.getElementById('running-ticker');
  const track = document.getElementById('ticker-track');

  if (ticker.active && ticker.text && tickerEl && track) {
    tickerEl.classList.add('visible');
    const items = ticker.text.split('|');
    let html = '';
    // Duplicate for seamless loop
    for (let r = 0; r < 2; r++) {
      items.forEach(item => {
        html += `<span class="ticker-item"><i class="fa fa-star"></i>${item.trim()}</span>`;
      });
    }
    track.innerHTML = html;
  }
}

// ============================================
// PRODUCTS
// ============================================
function loadProducts() {
  const db = getDB();
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (!db.products || db.products.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;" class="empty-state"><i class="fa fa-box-open"></i><p>Belum ada produk tersedia</p></div>`;
    return;
  }

  grid.innerHTML = db.products.map(p => `
    <div class="product-card fade-in-scroll" onclick="openProductModal('${p.id}')">
      <div class="product-image-wrap">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://cdn-uploads.huggingface.co/production/uploads/noauth/8W2qfrJxJ0G0EplunCycM.jpeg'"/>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.subtitle || p.desc}</div>
        <ul class="product-features">
          ${(p.features || []).slice(0, 4).map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    </div>
  `).join('');

  initScrollAnimations();
}

// ============================================
// FAQ
// ============================================
function loadFAQ() {
  const faqs = [
    { q: 'Apa itu Drip Client?', a: 'Drip Client adalah platform jual beli key / lisensi software premium. Kami menyediakan berbagai produk dengan harga terjangkau dan layanan terpercaya.' },
    { q: 'Bagaimana cara membeli key?', a: 'Pilih produk yang kamu inginkan, pilih durasi / paket, masukan nomor WhatsApp, lalu klik Buy Now. Pastikan saldo credit kamu mencukupi.' },
    { q: 'Bagaimana cara mengisi saldo?', a: 'Hubungi admin melalui channel WhatsApp kami untuk pengisian saldo. Admin akan memproses transfer credit ke akun kamu.' },
    { q: 'Berapa lama proses pengiriman key?', a: 'Admin akan memproses pesananmu sesegera mungkin. Biasanya dalam 1-24 jam setelah pembayaran dikonfirmasi.' },
    { q: 'Apakah ada garansi?', a: 'Ya, kami memberikan garansi sesuai durasi yang dibeli. Jika ada masalah teknis, hubungi support kami melalui WhatsApp.' },
    { q: 'Bagaimana cara reset key?', a: 'Buka menu Quick Action (titik tiga di pojok kanan atas), pilih Reset Key, masukan key yang ingin direset, dan klik tombol Reset. Fitur ini tersedia jika diaktifkan oleh admin.' },
    { q: 'Apakah bisa menggunakan kode promo?', a: 'Ya! Saat melakukan pembelian, kamu bisa memasukan kode promo di kolom yang tersedia. Diskon akan otomatis terpotong dari total harga.' }
  ];

  const container = document.getElementById('faq-list');
  if (!container) return;

  container.innerHTML = faqs.map((f, i) => `
    <div class="faq-item fade-in-scroll" onclick="toggleFaq(this)">
      <div class="faq-question">
        <span>${f.q}</span>
        <i class="fa fa-chevron-down"></i>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-inner">${f.a}</div>
      </div>
    </div>
  `).join('');

  initScrollAnimations();
}

function toggleFaq(el) {
  el.classList.toggle('open');
}

// ============================================
// HAMBURGER NAV
// ============================================
function toggleNav() {
  const nav = document.getElementById('side-nav');
  const overlay = document.getElementById('nav-overlay');
  if (nav) nav.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
}

function closeNav() {
  const nav = document.getElementById('side-nav');
  const overlay = document.getElementById('nav-overlay');
  if (nav) nav.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

function scrollToProducts() {
  const el = document.getElementById('products-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function scrollToFaq() {
  const el = document.getElementById('faq-section');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// WELCOME POPUP
// ============================================
function closeWelcomePopup() {
  const p = document.getElementById('welcome-popup');
  if (p) p.classList.remove('show');
}

// ============================================
// PRODUCT MODAL
// ============================================
let currentProduct = null;
let selectedPrice = null;
let currentQty = 1;
let promoApplied = null;

function openProductModal(productId) {
  const db = getDB();
  const product = db.products.find(p => p.id === productId);
  if (!product) return;

  currentProduct = product;
  selectedPrice = null;
  currentQty = 1;
  promoApplied = null;

  document.getElementById('modal-product-name').textContent = product.name;
  document.getElementById('qty-display').textContent = '1';
  document.getElementById('total-price-display').textContent = '$0';
  document.getElementById('promo-input').value = '';
  document.getElementById('promo-status').innerHTML = '';
  document.getElementById('wa-input').value = '';

  // Build price options
  const priceContainer = document.getElementById('modal-price-options');
  priceContainer.innerHTML = product.prices.map((p, i) => `
    <div class="price-option" onclick="selectPrice(${i})" data-idx="${i}">
      <div class="price-duration">${p.label}</div>
      <div class="price-amount">$${p.price}</div>
    </div>
  `).join('');

  document.getElementById('product-modal').classList.add('show');
}

function selectPrice(idx) {
  document.querySelectorAll('.price-option').forEach(el => el.classList.remove('selected'));
  const el = document.querySelector(`.price-option[data-idx="${idx}"]`);
  if (el) el.classList.add('selected');
  selectedPrice = currentProduct.prices[idx];
  promoApplied = null;
  document.getElementById('promo-status').innerHTML = '';
  document.getElementById('promo-input').value = '';
  updateTotal();
}

function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById('qty-display').textContent = currentQty;
  updateTotal();
}

function updateTotal() {
  if (!selectedPrice) return;
  let base = selectedPrice.price * currentQty;
  if (promoApplied) {
    base = base * (1 - promoApplied.pct / 100);
  }
  document.getElementById('total-price-display').textContent = `$${base.toFixed(2)}`;
}

function applyPromo() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  const statusEl = document.getElementById('promo-status');

  if (!code) {
    statusEl.innerHTML = '<div style="color:var(--accent-red);font-size:0.8rem;margin-top:5px;"><i class="fa fa-exclamation-circle"></i> Masukan kode promo terlebih dahulu.</div>';
    return;
  }

  const db = getDB();
  const promo = db.promos.find(p => p.code === code);

  if (!promo) {
    statusEl.innerHTML = '<div style="color:var(--accent-red);font-size:0.8rem;margin-top:5px;"><i class="fa fa-times-circle"></i> Kode promo tidak valid.</div>';
    return;
  }

  // Check max usage
  if (promo.maxUse > 0 && promo.usedBy && promo.usedBy.length >= promo.maxUse) {
    statusEl.innerHTML = `<div style="color:var(--accent-red);font-size:0.8rem;margin-top:5px;"><i class="fa fa-ban"></i> Kode promo sudah mencapai batas penggunaan (${promo.maxUse} orang).</div>`;
    return;
  }

  // Check if user already used
  const sess = JSON.parse(sessionStorage.getItem('drip_session') || '{}');
  if (promo.usedBy && promo.usedBy.includes(sess.username)) {
    statusEl.innerHTML = `<div style="color:var(--accent-red);font-size:0.8rem;margin-top:5px;"><i class="fa fa-ban"></i> Kamu sudah pernah menggunakan kode promo ini.</div>`;
    return;
  }

  promoApplied = promo;
  statusEl.innerHTML = `<div class="promo-applied"><i class="fa fa-check-circle"></i> Promo <strong>${code}</strong> berhasil! Diskon ${promo.pct}%</div>`;
  updateTotal();
}

async function doBuyNow() {
  if (!selectedPrice) {
    Swal.fire({ icon: 'warning', title: 'Pilih Paket', text: 'Silahkan pilih paket terlebih dahulu!', confirmButtonText: 'OK' });
    return;
  }

  const wa = document.getElementById('wa-input').value.trim();
  if (!wa) {
    Swal.fire({ icon: 'warning', title: 'Nomor WA Diperlukan', text: 'Masukan nomor WhatsApp untuk notifikasi pembelian.', confirmButtonText: 'OK' });
    return;
  }

  const sess = JSON.parse(sessionStorage.getItem('drip_session') || '{}');
  const db = getDB();
  const dbUser = db.users.find(u => u.username === sess.username);

  if (!dbUser) { window.location.href = 'index.html'; return; }

  let totalPrice = selectedPrice.price * currentQty;
  if (promoApplied) totalPrice = totalPrice * (1 - promoApplied.pct / 100);
  totalPrice = parseFloat(totalPrice.toFixed(2));

  if (dbUser.credit < totalPrice) {
    Swal.fire({
      icon: 'error',
      title: 'Saldo Tidak Cukup',
      html: `Saldo kamu: <strong>$${dbUser.credit}</strong><br>Total pembelian: <strong>$${totalPrice}</strong><br><br>Silahkan hubungi admin untuk top-up saldo.`,
      confirmButtonText: 'OK'
    });
    return;
  }

  const confirm = await Swal.fire({
    icon: 'question',
    title: 'Konfirmasi Pembelian',
    html: `
      <div style="text-align:left;font-size:0.9rem;line-height:1.8;">
        <b>Produk:</b> ${currentProduct.name}<br>
        <b>Paket:</b> ${selectedPrice.label}<br>
        <b>Qty:</b> ${currentQty}x<br>
        ${promoApplied ? `<b>Promo:</b> ${promoApplied.code} (-${promoApplied.pct}%)<br>` : ''}
        <b>Total:</b> <span style="color:var(--accent-green);font-weight:700;">$${totalPrice}</span>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Beli Sekarang',
    cancelButtonText: 'Batal'
  });

  if (!confirm.isConfirmed) return;

  const btn = document.getElementById('buy-now-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> &nbsp;Memproses...';

  await sleep(1500);

  // Deduct credit
  dbUser.credit = parseFloat((dbUser.credit - totalPrice).toFixed(2));

  // Mark promo used
  if (promoApplied) {
    const promoIdx = db.promos.findIndex(p => p.code === promoApplied.code);
    if (promoIdx > -1) {
      if (!db.promos[promoIdx].usedBy) db.promos[promoIdx].usedBy = [];
      db.promos[promoIdx].usedBy.push(sess.username);
    }
  }

  // Create transaction
  const trxId = 'TRX' + Date.now();
  const trx = {
    id: trxId,
    username: sess.username,
    product: currentProduct.name,
    plan: selectedPrice.label,
    qty: currentQty,
    promo: promoApplied ? promoApplied.code : null,
    discount: promoApplied ? promoApplied.pct : 0,
    total: totalPrice,
    wa,
    status: 'waiting',
    keys: [],
    date: new Date().toISOString()
  };

  db.transactions.push(trx);

  // Update user session
  sess.credit = dbUser.credit;
  sessionStorage.setItem('drip_session', JSON.stringify(sess));

  saveDB(db);

  // Update topbar credit
  const tc = document.getElementById('topbar-credit');
  if (tc) tc.textContent = dbUser.credit.toFixed(2);

  btn.disabled = false;
  btn.innerHTML = '<i class="fa fa-shopping-cart"></i> &nbsp;BUY NOW';

  closeProductModal();

  Swal.fire({
    icon: 'success',
    title: '✅ Pembelian Berhasil!',
    html: `
      <div style="text-align:left;font-size:0.85rem;line-height:1.8;">
        <b>ID Transaksi:</b> <span style="font-family:monospace;color:var(--purple-neon);">${trxId}</span><br>
        <b>Produk:</b> ${currentProduct.name} - ${selectedPrice.label}<br>
        <b>Total Dipotong:</b> $${totalPrice}<br>
        <b>Status:</b> <span style="color:var(--accent-orange);">Menunggu Proses Admin</span><br>
        <br>
        Admin akan memproses pesananmu dan mengirimkan key melalui dashboard ini.
      </div>
    `,
    confirmButtonText: 'OK'
  });
}

function closeProductModal() {
  document.getElementById('product-modal').classList.remove('show');
}

// ============================================
// TRANSACTION LOGS
// ============================================
function openTrxModal() {
  const sess = JSON.parse(sessionStorage.getItem('drip_session') || '{}');
  const db = getDB();
  const userTrx = db.transactions.filter(t => t.username === sess.username).reverse();

  const container = document.getElementById('trx-list-container');

  if (userTrx.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa fa-box-open"></i><p>Belum ada transaksi</p></div>`;
  } else {
    container.innerHTML = `<div class="trx-list">${userTrx.map(t => `
      <div class="trx-item">
        <div class="trx-header">
          <div class="trx-name">${t.product}</div>
          <span class="badge badge-${t.status}">${t.status === 'waiting' ? 'Waiting' : t.status === 'approved' ? 'Approved' : 'Rejected'}</span>
        </div>
        <div class="trx-info">
          <b>${t.plan}</b> &nbsp;|&nbsp; Qty: ${t.qty} &nbsp;|&nbsp; Total: $${t.total}<br>
          ID: <span style="font-family:monospace;font-size:0.78rem;color:var(--purple-neon);">${t.id}</span><br>
          Tanggal: ${new Date(t.date).toLocaleString('id-ID')}
        </div>
        ${t.keys && t.keys.length > 0 ? `
          <div class="trx-keys">
            <div style="color:var(--text-muted);font-size:0.75rem;margin-bottom:6px;"><i class="fa fa-key"></i> KEY / LISENSI:</div>
            ${t.keys.map(k => `<div>→ ${k}</div>`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}</div>`;
  }

  document.getElementById('trx-modal').classList.add('show');
}

function closeTrxModal() {
  document.getElementById('trx-modal').classList.remove('show');
}

// ============================================
// RESET KEY POPUP
// ============================================
function openResetKeyPopup() {
  document.getElementById('reset-popup').classList.add('show');
  document.getElementById('reset-terminal').style.display = 'none';
  document.getElementById('reset-terminal').innerHTML = '';
  document.getElementById('reset-key-input').value = '';
}

function closeResetPopup() {
  document.getElementById('reset-popup').classList.remove('show');
}

async function doResetKey() {
  const keyInput = document.getElementById('reset-key-input').value.trim();
  if (!keyInput) {
    Swal.fire({ icon: 'warning', title: 'Input Kosong', text: 'Masukan key terlebih dahulu!', confirmButtonText: 'OK' });
    return;
  }

  const db = getDB();
  if (!db.resetSystem) {
    const term = document.getElementById('reset-terminal');
    term.style.display = 'block';
    term.innerHTML = `<div class="terminal-line error" style="animation-delay:0.1s">❌ SYSTEM OFFLINE</div>
    <div class="terminal-line muted" style="animation-delay:0.3s">Status: 503 Service Unavailable</div>
    <div class="terminal-line error" style="animation-delay:0.6s">Maaf fitur ini sedang di nonaktifkan oleh admin atau sedang tidak beroperasi normal. Silahkan coba lagi nanti.</div>`;
    return;
  }

  const btn = document.getElementById('reset-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Processing...';

  const term = document.getElementById('reset-terminal');
  term.style.display = 'block';
  term.innerHTML = '';

  const addLine = (text, cls, delay) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = `terminal-line ${cls}`;
      line.textContent = text;
      term.appendChild(line);
    }, delay);
  };

  addLine('> Connecting to server...', 'info', 200);
  addLine('> Fetching Server.....', 'muted', 600);
  addLine('> Response Database....', 'muted', 1200);

  await sleep(2000);

  // Check daily reset limit
  const sess = JSON.parse(sessionStorage.getItem('drip_session') || '{}');
  const today = new Date().toDateString();
  const resetKey = `reset_${sess.username}_${today}`;
  const resetCount = parseInt(localStorage.getItem(resetKey) || '0');

  if (resetCount >= 1) {
    addLine('> ERROR: Daily reset limit reached', 'error', 0);
    addLine(`> {"success":false,"message":"Reset limit 1x per day","resetsused":${resetCount},"resetsmax":1}`, 'error', 300);
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-sync-alt"></i> &nbsp;Reset Key';
    return;
  }

  // Success simulation
  const newKey = generateKey();
  const now = new Date();
  const nextReset = new Date(now.getTime() + 24*60*60*1000);

  localStorage.setItem(resetKey, '1');

  setTimeout(() => {
    addLine('> ✅ Reset Successful', 'success', 0);
    addLine(`> Status: 200 OK`, 'info', 200);
    addLine(`> {"success":true,"message":"Token reset successfully","resetsused":1,"resetsmax":1,"nextresettime":"${nextReset.toISOString().replace('T',' ').substr(0,19)}"}`, 'white', 400);
    addLine(`> New Key Generated:`, 'muted', 700);
    addLine(`> ${newKey}`, 'success', 900);
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-sync-alt"></i> &nbsp;Reset Key';
  }, 500);
}

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) key += chars[Math.floor(Math.random() * chars.length)];
    if (i < 4) key += '-';
  }
  return key;
}

// ============================================
// LOGOUT
// ============================================
function doLogout() {
  Swal.fire({
    icon: 'question',
    title: 'Logout',
    text: 'Yakin ingin keluar dari dashboard?',
    showCancelButton: true,
    confirmButtonText: 'Ya, Logout',
    cancelButtonText: 'Batal'
  }).then(result => {
    if (result.isConfirmed) {
      sessionStorage.removeItem('drip_session');
      window.location.href = 'index.html';
    }
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-scroll').forEach(el => observer.observe(el));
}

// ============================================
// ADMIN PANEL
// ============================================
function initAdmin() {
  const content = document.getElementById('admin-content');
  if (content) content.style.display = 'flex';
  loadAdminStats();
  loadAdminProducts();
  loadAdminPromos();
  loadAdminTransactions();
  loadAdminSettings();
  loadRecentTrx();
}

function showSection(name) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));

  const section = document.getElementById(`section-${name}`);
  if (section) section.classList.add('active');

  const navItem = document.querySelector(`[data-section="${name}"]`);
  if (navItem) navItem.classList.add('active');
}

function loadAdminStats() {
  const db = getDB();
  const statUsers = document.getElementById('stat-users');
  const statProd = document.getElementById('stat-products');
  const statTrx = document.getElementById('stat-trx');
  const statWait = document.getElementById('stat-waiting');

  if (statUsers) statUsers.textContent = db.users.length;
  if (statProd) statProd.textContent = db.products.length;
  if (statTrx) statTrx.textContent = db.transactions.length;
  if (statWait) statWait.textContent = db.transactions.filter(t => t.status === 'waiting').length;
}

function loadRecentTrx() {
  const db = getDB();
  const container = document.getElementById('recent-trx-list');
  if (!container) return;

  const recent = db.transactions.slice(-5).reverse();
  if (recent.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa fa-box-open"></i><p>Belum ada transaksi</p></div>`;
    return;
  }

  container.innerHTML = recent.map(t => `
    <div class="admin-trx-item">
      <div class="admin-trx-header">
        <span class="admin-trx-title">${t.product} - ${t.plan}</span>
        <span class="badge badge-${t.status}">${t.status}</span>
      </div>
      <div class="admin-trx-info">
        <span><i class="fa fa-user"></i> ${t.username}</span>
        <span><i class="fa fa-dollar-sign"></i> $${t.total}</span>
        <span><i class="fa fa-calendar"></i> ${new Date(t.date).toLocaleString('id-ID')}</span>
      </div>
    </div>
  `).join('');
}

function loadAdminProducts() {
  const db = getDB();
  const container = document.getElementById('admin-product-list');
  if (!container) return;

  if (db.products.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa fa-box-open"></i><p>Belum ada produk</p></div>`;
    return;
  }

  container.innerHTML = db.products.map(p => `
    <div class="product-edit-item">
      <img src="${p.image}" class="product-edit-img" alt="${p.name}" onerror="this.src='https://cdn-uploads.huggingface.co/production/uploads/noauth/8W2qfrJxJ0G0EplunCycM.jpeg'"/>
      <div class="product-edit-info">
        <div class="product-edit-name">${p.name}</div>
        <div class="product-edit-desc">${p.desc}</div>
      </div>
      <div class="product-edit-actions">
        <button class="btn-edit" onclick="openEditProduct('${p.id}')"><i class="fa fa-edit"></i> Edit</button>
        <button class="btn-delete" onclick="deleteProduct('${p.id}')"><i class="fa fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function loadAdminPromos() {
  const db = getDB();
  const container = document.getElementById('admin-promo-list');
  if (!container) return;

  if (!db.promos || db.promos.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa fa-tag"></i><p>Belum ada kode promo</p></div>`;
    return;
  }

  container.innerHTML = db.promos.map((p, i) => `
    <div style="background:rgba(10,6,18,0.7);border:1px solid var(--border-purple);border-radius:12px;padding:15px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
      <div>
        <div style="font-family:var(--font-mono);font-size:1rem;color:var(--purple-neon);font-weight:700;">${p.code}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);">Diskon ${p.pct}% &nbsp;|&nbsp; Penggunaan: ${(p.usedBy||[]).length}/${p.maxUse == 0 ? '∞' : p.maxUse}</div>
      </div>
      <button class="btn-delete" onclick="deletePromo(${i})"><i class="fa fa-trash"></i></button>
    </div>
  `).join('');
}

function loadAdminTransactions() {
  const db = getDB();
  const container = document.getElementById('admin-trx-list');
  if (!container) return;

  const allTrx = db.transactions.slice().reverse();
  if (allTrx.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa fa-box-open"></i><p>Belum ada transaksi</p></div>`;
    return;
  }

  container.innerHTML = allTrx.map(t => `
    <div class="admin-trx-item" id="trx-item-${t.id}">
      <div class="admin-trx-header">
        <span class="admin-trx-title">${t.product} - ${t.plan}</span>
        <span class="badge badge-${t.status}">${t.status}</span>
      </div>
      <div class="admin-trx-info">
        <span><i class="fa fa-hashtag"></i> ${t.id}</span>
        <span><i class="fa fa-user"></i> ${t.username}</span>
        <span><i class="fa fa-dollar-sign"></i> $${t.total}</span>
        <span><i class="fab fa-whatsapp" style="color:#25D366;"></i> ${t.wa}</span>
        <span><i class="fa fa-calendar"></i> ${new Date(t.date).toLocaleString('id-ID')}</span>
      </div>
      ${t.status === 'waiting' ? `
        <div class="admin-action-btns">
          <button class="btn-approve" onclick="openApproveModal('${t.id}')"><i class="fa fa-check"></i> Approve</button>
          <button class="btn-reject" onclick="rejectTrx('${t.id}')"><i class="fa fa-times"></i> Reject</button>
        </div>
      ` : ''}
      ${t.keys && t.keys.length > 0 ? `
        <div class="trx-keys" style="margin-top:10px;">
          <div style="color:var(--text-muted);font-size:0.75rem;margin-bottom:6px;"><i class="fa fa-key"></i> KEYS DIKIRIM:</div>
          ${t.keys.map(k => `<div>→ ${k}</div>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function loadAdminSettings() {
  const db = getDB();
  const resetToggle = document.getElementById('reset-system-toggle');
  const resetStatus = document.getElementById('reset-system-status');
  const tickerToggle = document.getElementById('ticker-toggle');
  const tickerText = document.getElementById('ticker-text-input');

  if (resetToggle) resetToggle.checked = db.resetSystem;
  if (resetStatus) {
    resetStatus.textContent = db.resetSystem ? 'ON - Aktif' : 'OFF - Tidak Aktif';
    resetStatus.style.color = db.resetSystem ? 'var(--accent-green)' : 'var(--accent-red)';
  }
  if (tickerToggle) tickerToggle.checked = db.ticker.active;
  if (tickerText) tickerText.value = db.ticker.text;
}

// Admin: Add Product
function addPriceRow() {
  const container = document.getElementById('price-fields');
  if (!container) return;
  const rows = container.querySelectorAll('.price-field-row');
  if (rows.length >= 5) {
    Swal.fire({ icon: 'warning', title: 'Maksimal 5 Harga', text: 'Tidak bisa menambah pilihan harga lagi.', confirmButtonText: 'OK' });
    return;
  }
  const row = document.createElement('div');
  row.className = 'price-field-row';
  row.innerHTML = `
    <input type="text" class="form-control" placeholder="Label"/>
    <input type="number" class="form-control" placeholder="Harga ($)" min="0.01" step="0.01"/>
    <input type="text" class="form-control" placeholder="Keterangan"/>
    <button onclick="removePriceRow(this)" title="Hapus"><i class="fa fa-trash"></i></button>
  `;
  container.appendChild(row);
}

function removePriceRow(btn) {
  const container = document.getElementById('price-fields');
  if (container && container.querySelectorAll('.price-field-row').length > 1) {
    btn.closest('.price-field-row').remove();
  }
}

async function adminAddProduct() {
  const name = document.getElementById('new-product-name').value.trim();
  const image = document.getElementById('new-product-image').value.trim();
  const desc = document.getElementById('new-product-desc').value.trim();
  const featuresRaw = document.getElementById('new-product-features').value.trim();

  if (!name || !desc) {
    Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nama dan deskripsi produk wajib diisi!', confirmButtonText: 'OK' });
    return;
  }

  const priceRows = document.querySelectorAll('#price-fields .price-field-row');
  const prices = [];
  priceRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const label = inputs[0].value.trim();
    const price = parseFloat(inputs[1].value);
    if (label && !isNaN(price) && price > 0) {
      prices.push({ label, price });
    }
  });

  if (prices.length === 0) {
    Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Tambahkan minimal 1 pilihan harga!', confirmButtonText: 'OK' });
    return;
  }

  const db = getDB();
  const newProduct = {
    id: 'prod_' + Date.now(),
    name,
    subtitle: desc,
    image: image || 'https://cdn-uploads.huggingface.co/production/uploads/noauth/8W2qfrJxJ0G0EplunCycM.jpeg',
    desc,
    features: featuresRaw.split(',').map(f => f.trim()).filter(Boolean),
    prices
  };

  db.products.push(newProduct);
  saveDB(db);

  Swal.fire({ icon: 'success', title: '✅ Produk Ditambahkan!', text: `Produk "${name}" berhasil ditambahkan.`, confirmButtonText: 'OK' });
  loadAdminProducts();
  loadAdminStats();
}

// Admin: Edit Product
function openEditProduct(productId) {
  const db = getDB();
  const p = db.products.find(p => p.id === productId);
  if (!p) return;

  document.getElementById('edit-product-id').value = p.id;
  document.getElementById('edit-product-name').value = p.name;
  document.getElementById('edit-product-image').value = p.image;
  document.getElementById('edit-product-desc').value = p.desc;
  document.getElementById('edit-product-features').value = (p.features || []).join(', ');
  document.getElementById('edit-product-prices').value = (p.prices || []).map(pr => `${pr.label}:${pr.price}`).join('|');

  document.getElementById('edit-product-modal').classList.add('show');
}

function closeEditModal() {
  document.getElementById('edit-product-modal').classList.remove('show');
}

function saveEditProduct() {
  const id = document.getElementById('edit-product-id').value;
  const db = getDB();
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return;

  const pricesRaw = document.getElementById('edit-product-prices').value;
  const prices = pricesRaw.split('|').map(item => {
    const [label, price] = item.split(':');
    return { label: label?.trim(), price: parseFloat(price) };
  }).filter(p => p.label && !isNaN(p.price));

  db.products[idx] = {
    ...db.products[idx],
    name: document.getElementById('edit-product-name').value.trim(),
    image: document.getElementById('edit-product-image').value.trim(),
    desc: document.getElementById('edit-product-desc').value.trim(),
    subtitle: document.getElementById('edit-product-desc').value.trim(),
    features: document.getElementById('edit-product-features').value.split(',').map(f => f.trim()).filter(Boolean),
    prices
  };

  saveDB(db);
  closeEditModal();
  loadAdminProducts();
  Swal.fire({ icon: 'success', title: '✅ Produk Diperbarui!', text: 'Perubahan berhasil disimpan.', confirmButtonText: 'OK' });
}

// Admin: Delete Product
function deleteProduct(productId) {
  Swal.fire({
    icon: 'warning',
    title: 'Hapus Produk?',
    text: 'Tindakan ini tidak dapat dibatalkan!',
    showCancelButton: true,
    confirmButtonText: 'Ya, Hapus',
    cancelButtonText: 'Batal'
  }).then(result => {
    if (result.isConfirmed) {
      const db = getDB();
      db.products = db.products.filter(p => p.id !== productId);
      saveDB(db);
      loadAdminProducts();
      loadAdminStats();
      Swal.fire({ icon: 'success', title: 'Produk Dihapus!', text: 'Produk berhasil dihapus.', confirmButtonText: 'OK' });
    }
  });
}

// Admin: Add Promo
async function adminAddPromo() {
  const code = document.getElementById('new-promo-code').value.trim().toUpperCase();
  const pct = parseInt(document.getElementById('new-promo-pct').value);
  const maxUse = parseInt(document.getElementById('new-promo-max').value);

  if (!code || isNaN(pct) || isNaN(maxUse)) {
    Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Semua field wajib diisi!', confirmButtonText: 'OK' });
    return;
  }

  if (pct < 1 || pct > 99) {
    Swal.fire({ icon: 'warning', title: 'Persen Tidak Valid', text: 'Persen diskon harus antara 1-99%', confirmButtonText: 'OK' });
    return;
  }

  const db = getDB();
  if (db.promos.find(p => p.code === code)) {
    Swal.fire({ icon: 'error', title: 'Kode Sudah Ada', text: 'Kode promo ini sudah terdaftar.', confirmButtonText: 'OK' });
    return;
  }

  db.promos.push({ code, pct, maxUse, usedBy: [], created: Date.now() });
  saveDB(db);

  document.getElementById('new-promo-code').value = '';
  document.getElementById('new-promo-pct').value = '';
  document.getElementById('new-promo-max').value = '';

  loadAdminPromos();
  Swal.fire({ icon: 'success', title: '✅ Promo Ditambahkan!', html: `Kode: <strong>${code}</strong> - Diskon ${pct}%`, confirmButtonText: 'OK' });
}

// Admin: Delete Promo
function deletePromo(idx) {
  const db = getDB();
  db.promos.splice(idx, 1);
  saveDB(db);
  loadAdminPromos();
  Swal.fire({ icon: 'success', title: 'Promo Dihapus!', timer: 1500, showConfirmButton: false });
}

// Admin: Save Ticker
function adminSaveTicker() {
  const text = document.getElementById('ticker-text-input').value.trim();
  if (!text) {
    Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Teks running tidak boleh kosong!', confirmButtonText: 'OK' });
    return;
  }
  const db = getDB();
  db.ticker.text = text;
  saveDB(db);
  Swal.fire({ icon: 'success', title: '✅ Running Text Disimpan!', timer: 1500, showConfirmButton: false });
}

function adminToggleTicker() {
  const db = getDB();
  db.ticker.active = document.getElementById('ticker-toggle').checked;
  saveDB(db);
}

// Admin: Toggle Reset System
function adminToggleResetSystem() {
  const db = getDB();
  db.resetSystem = document.getElementById('reset-system-toggle').checked;
  saveDB(db);
  const status = document.getElementById('reset-system-status');
  if (status) {
    status.textContent = db.resetSystem ? 'ON - Aktif' : 'OFF - Tidak Aktif';
    status.style.color = db.resetSystem ? 'var(--accent-green)' : 'var(--accent-red)';
  }
  Swal.fire({
    icon: 'success',
    title: `Reset System ${db.resetSystem ? 'Diaktifkan' : 'Dinonaktifkan'}`,
    timer: 1500,
    showConfirmButton: false
  });
}

// Admin: Add Saldo
async function adminAddSaldo() {
  const username = document.getElementById('saldo-username').value.trim();
  const amount = parseFloat(document.getElementById('saldo-amount').value);

  if (!username || isNaN(amount) || amount <= 0) {
    Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Username dan jumlah saldo wajib diisi dengan benar!', confirmButtonText: 'OK' });
    return;
  }

  const db = getDB();
  const userIdx = db.users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());

  if (userIdx === -1) {
    Swal.fire({ icon: 'error', title: 'User Tidak Ditemukan', text: `Username "${username}" tidak terdaftar di database.`, confirmButtonText: 'OK' });
    return;
  }

  db.users[userIdx].credit = parseFloat((db.users[userIdx].credit + amount).toFixed(2));
  saveDB(db);

  document.getElementById('saldo-username').value = '';
  document.getElementById('saldo-amount').value = '';

  Swal.fire({
    icon: 'success',
    title: '✅ Saldo Berhasil Ditransfer!',
    html: `<b>$${amount}</b> berhasil dikirim ke akun <b>${db.users[userIdx].username}</b><br>Saldo baru: <b style="color:var(--accent-green);">$${db.users[userIdx].credit}</b>`,
    confirmButtonText: 'OK'
  });
}

// Admin: Open Approve Modal
function openApproveModal(trxId) {
  document.getElementById('approve-trx-id').value = trxId;
  document.getElementById('keys-input-area').innerHTML = `
    <div class="key-input-row">
      <input type="text" class="form-control" placeholder="Key / Lisensi 1" style="font-family:var(--font-mono);font-size:0.85rem;"/>
      <button class="btn-add-key" onclick="addKeyRow()"><i class="fa fa-plus"></i> Tambah</button>
    </div>
  `;
  document.getElementById('approve-modal').classList.add('show');
}

function closeApproveModal() {
  document.getElementById('approve-modal').classList.remove('show');
}

function addKeyRow() {
  const area = document.getElementById('keys-input-area');
  const existingRows = area.querySelectorAll('.key-input-row');
  if (existingRows.length >= 5) {
    Swal.fire({ icon: 'warning', title: 'Maksimal 5 Key', text: 'Tidak bisa menambah key lagi.', confirmButtonText: 'OK' });
    return;
  }
  const row = document.createElement('div');
  row.className = 'key-input-row';
  row.innerHTML = `
    <input type="text" class="form-control" placeholder="Key / Lisensi ${existingRows.length + 1}" style="font-family:var(--font-mono);font-size:0.85rem;"/>
    <button class="btn-delete" onclick="this.parentElement.remove()" style="white-space:nowrap;"><i class="fa fa-trash"></i></button>
  `;
  area.appendChild(row);
}

async function submitApprove() {
  const trxId = document.getElementById('approve-trx-id').value;
  const keyInputs = document.querySelectorAll('#keys-input-area input[type="text"]');
  const keys = Array.from(keyInputs).map(i => i.value.trim()).filter(Boolean);

  if (keys.length === 0) {
    Swal.fire({ icon: 'warning', title: 'Key Kosong', text: 'Masukan minimal 1 key untuk dikirim ke user.', confirmButtonText: 'OK' });
    return;
  }

  const db = getDB();
  const trxIdx = db.transactions.findIndex(t => t.id === trxId);
  if (trxIdx === -1) return;

  db.transactions[trxIdx].status = 'approved';
  db.transactions[trxIdx].keys = keys;
  db.transactions[trxIdx].approvedAt = new Date().toISOString();
  saveDB(db);

  closeApproveModal();
  loadAdminTransactions();
  loadAdminStats();
  loadRecentTrx();

  Swal.fire({
    icon: 'success',
    title: '✅ Pesanan Diapprove!',
    html: `Transaksi <strong>${trxId}</strong> berhasil diapprove.<br>${keys.length} key telah dikirim ke user.`,
    confirmButtonText: 'OK'
  });
}

function rejectTrx(trxId) {
  Swal.fire({
    icon: 'warning',
    title: 'Reject Transaksi?',
    text: 'Pesanan ini akan ditolak dan saldo user akan dikembalikan.',
    showCancelButton: true,
    confirmButtonText: 'Ya, Reject',
    cancelButtonText: 'Batal'
  }).then(result => {
    if (result.isConfirmed) {
      const db = getDB();
      const trxIdx = db.transactions.findIndex(t => t.id === trxId);
      if (trxIdx === -1) return;

      // Refund
      const trx = db.transactions[trxIdx];
      const userIdx = db.users.findIndex(u => u.username === trx.username);
      if (userIdx > -1) {
        db.users[userIdx].credit = parseFloat((db.users[userIdx].credit + trx.total).toFixed(2));
      }

      db.transactions[trxIdx].status = 'rejected';
      db.transactions[trxIdx].rejectedAt = new Date().toISOString();
      saveDB(db);

      loadAdminTransactions();
      loadAdminStats();
      loadRecentTrx();

      Swal.fire({
        icon: 'success',
        title: 'Transaksi Ditolak',
        html: `Pesanan ${trxId} ditolak.<br>Saldo <strong>$${trx.total}</strong> telah dikembalikan ke user.`,
        confirmButtonText: 'OK'
      });
    }
  });
}

// ============================================
// UTILITY
// ============================================
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
