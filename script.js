/* ============================================
   DRIP CLIENT - SCRIPT.JS
   All Functions, DB (JSONBin.io), Particles
============================================ */

/* ============================================
   JSONBIN.IO CONFIG
   GANTI KEY & BIN ID SESUAI MILIK ANDA
============================================ */
const JSONBIN_API_KEY = '$2a$10$uzdLhr/GM.l1rf7rJ11x3ey4eWi0Kj7V5eMtEE6o.RfixGw5qAsXG'; // Ganti dengan API key Anda
const JSONBIN_BASE = 'https://api.jsonbin.io/v3/b';

// Bin IDs - Akan dibuat otomatis jika tidak ada
const BINS = {
  users: null,
  products: null,
  transactions: null,
  promos: null,
  settings: null
};

// Local storage key untuk menyimpan bin IDs
const BIN_IDS_KEY = '69b788adc3097a1dd52ba7ec';

/* ─────────────────────────────────────────
   BIN MANAGEMENT
───────────────────────────────────────── */
function loadBinIds() {
  const stored = localStorage.getItem(BIN_IDS_KEY);
  if (stored) {
    const ids = JSON.parse(stored);
    Object.assign(BINS, ids);
  }
}

function saveBinIds() {
  localStorage.setItem(BIN_IDS_KEY, JSON.stringify(BINS));
}

async function createBin(name, initialData) {
  const res = await fetch(JSONBIN_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY,
      'X-Bin-Name': 'drip-' + name,
      'X-Bin-Private': 'false'
    },
    body: JSON.stringify(initialData)
  });
  if (!res.ok) throw new Error('Gagal membuat bin: ' + name);
  const data = await res.json();
  return data.metadata.id;
}

async function getBin(binId) {
  const res = await fetch(`${JSONBIN_BASE}/${binId}/latest`, {
    headers: { 'X-Master-Key': JSONBIN_API_KEY }
  });
  if (!res.ok) throw new Error('Gagal fetch bin: ' + binId);
  const data = await res.json();
  return data.record;
}

async function updateBin(binId, data) {
  const res = await fetch(`${JSONBIN_BASE}/${binId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Gagal update bin');
  return await res.json();
}

async function getOrCreateBin(name, initial) {
  loadBinIds();
  if (!BINS[name]) {
    BINS[name] = await createBin(name, initial);
    saveBinIds();
  }
  return BINS[name];
}

/* ─────────────────────────────────────────
   DATABASE API
───────────────────────────────────────── */

// USERS
async function dbGetUsers() {
  const id = await getOrCreateBin('users', []);
  return await getBin(id);
}

async function dbSaveUsers(users) {
  const id = await getOrCreateBin('users', []);
  await updateBin(id, users);
}

// PRODUCTS
async function dbGetProducts() {
  const id = await getOrCreateBin('products', []);
  return await getBin(id);
}

async function dbSaveProducts(products) {
  const id = await getOrCreateBin('products', []);
  await updateBin(id, products);
}

// TRANSACTIONS
async function dbGetTransactions() {
  const id = await getOrCreateBin('transactions', []);
  return await getBin(id);
}

async function dbSaveTransactions(transactions) {
  const id = await getOrCreateBin('transactions', []);
  await updateBin(id, transactions);
}

// PROMOS
async function dbGetPromos() {
  const id = await getOrCreateBin('promos', []);
  return await getBin(id);
}

async function dbSavePromos(promos) {
  const id = await getOrCreateBin('promos', []);
  await updateBin(id, promos);
}

// SETTINGS
async function dbGetSettings() {
  const id = await getOrCreateBin('settings', {
    resetKeyOn: true,
    marqueeOn: false,
    marqueeText: 'KODE PROMO TERBARU : DISKON70% ★ JOIN CHANNEL WHATSAPP KAMI ★ BUY KEY MURAH DI DRIP CLIENT'
  });
  return await getBin(id);
}

async function dbSaveSettings(settings) {
  const id = await getOrCreateBin('settings', {});
  await updateBin(id, settings);
}

/* ─────────────────────────────────────────
   3D PARTICLE SYSTEM (Purple)
───────────────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });

  const COUNT = 80;
  const particles = [];

  const PURPLES = [
    'rgba(108,35,192,',
    'rgba(168,85,247,',
    'rgba(192,132,252,',
    'rgba(91,15,140,',
    'rgba(139,92,246,'
  ];

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.z = Math.random() * 1000;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.vz = -Math.random() * 2 - 0.5;
      this.color = PURPLES[Math.floor(Math.random() * PURPLES.length)];
      this.size = Math.random() * 3 + 1;
      this.alpha = Math.random() * 0.8 + 0.2;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.03;
    }

    update() {
      this.z += this.vz;
      this.x += this.vx;
      this.y += this.vy;
      this.pulse += this.pulseSpeed;
      if (this.z < 1) this.reset();
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }

    draw() {
      const scale = 1000 / (1000 + this.z);
      const px = (this.x - W / 2) * scale + W / 2;
      const py = (this.y - H / 2) * scale + H / 2;
      const r = this.size * scale;
      const a = this.alpha * (0.5 + 0.5 * Math.sin(this.pulse));

      // Glow effect
      const gradient = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
      gradient.addColorStop(0, this.color + a + ')');
      gradient.addColorStop(0.5, this.color + (a * 0.3) + ')');
      gradient.addColorStop(1, this.color + '0)');

      ctx.beginPath();
      ctx.arc(px, py, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + a + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Connection lines
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const scale1 = 1000 / (1000 + particles[i].z);
        const px1 = (particles[i].x - W/2) * scale1 + W/2;
        const py1 = (particles[i].y - H/2) * scale1 + H/2;

        const scale2 = 1000 / (1000 + particles[j].z);
        const px2 = (particles[j].x - W/2) * scale2 + W/2;
        const py2 = (particles[j].y - H/2) * scale2 + H/2;

        const dist = Math.hypot(px2 - px1, py2 - py1);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.strokeStyle = `rgba(108,35,192,${(1 - dist/100) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  // Nebula background blobs
  function drawNebula() {
    const blobs = [
      { x: W * 0.15, y: H * 0.2, r: 300, color: 'rgba(60,10,100,0.08)' },
      { x: W * 0.8, y: H * 0.6, r: 400, color: 'rgba(91,15,140,0.06)' },
      { x: W * 0.5, y: H * 0.8, r: 250, color: 'rgba(108,35,192,0.05)' },
    ];
    blobs.forEach(b => {
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.color);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  let animFrame;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawNebula();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animFrame = requestAnimationFrame(animate);
  }

  animate();
}

/* ─────────────────────────────────────────
   MODAL UTILITIES
───────────────────────────────────────── */
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
    document.body.style.overflow = '';
  }
});

/* ─────────────────────────────────────────
   DRAWER (HAMBURGER)
───────────────────────────────────────── */
function toggleDrawer() {
  const drawer = document.getElementById('quick-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!drawer) return;
  const isOpen = drawer.classList.contains('open');
  if (isOpen) {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
  } else {
    drawer.classList.add('open');
    overlay.classList.add('show');
  }
}

function closeDrawer() {
  const drawer = document.getElementById('quick-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!drawer) return;
  drawer.classList.remove('open');
  overlay.classList.remove('show');
}

/* ─────────────────────────────────────────
   PASSWORD TOGGLE
───────────────────────────────────────── */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
}

/* ─────────────────────────────────────────
   SCROLL FADE IN
───────────────────────────────────────── */
function initScrollFade() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   KEYBOARD SHORTCUTS
───────────────────────────────────────── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    // Close all modals
    document.querySelectorAll('.modal-overlay.show').forEach(m => {
      m.classList.remove('show');
      document.body.style.overflow = '';
    });
    closeDrawer();
  }
});

/* ─────────────────────────────────────────
   INIT SCROLL FADE ON LOAD
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initScrollFade();

  // Animate numbers
  function animateNumber(el, target) {
    let current = 0;
    const step = target / 30;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current);
    }, 50);
  }

  // Re-observe after dynamic content
  setTimeout(initScrollFade, 500);
});
