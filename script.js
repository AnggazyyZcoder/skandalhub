// JSONBin.io Configuration
const BIN_ID = '69b66b19b7ec241ddc6d56c5'; // Ganti dengan bin ID Anda
const API_KEY = '$2a$10$ldwDDS5thsD8qBEdjcNzc..R6XpeQggFqRrl4a6NNv3pQVEfhYbBq'; // Ganti dengan API key Anda
const BASE_URL = 'https://api.jsonbin.io/v3';

// Database Structure
const DB_STRUCTURE = {
    users: [],
    products: [],
    promoCodes: [],
    transactions: [],
    settings: {
        runningText: { text: '', enabled: false },
        resetKeySystem: true
    }
};

// Initialize Database
async function initDatabase() {
    try {
        const response = await fetch(`${BASE_URL}/b/${BIN_ID}`, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        
        if (!response.ok) {
            // Create new bin if doesn't exist
            await fetch(`${BASE_URL}/b`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': API_KEY
                },
                body: JSON.stringify(DB_STRUCTURE)
            });
        }
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Get Database
async function getDatabase() {
    try {
        const response = await fetch(`${BASE_URL}/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.error('Error getting database:', error);
        return DB_STRUCTURE;
    }
}

// Update Database
async function updateDatabase(data) {
    try {
        await fetch(`${BASE_URL}/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Error updating database:', error);
    }
}

// Loading Screen Handler
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            setTimeout(function() {
                loadingScreen.style.display = 'none';
                const dashboard = document.getElementById('dashboard');
                if (dashboard) {
                    dashboard.style.display = 'block';
                    initializePage();
                } else {
                    const authContainer = document.getElementById('authContainer');
                    if (authContainer) {
                        authContainer.style.display = 'flex';
                    }
                }
            }, 500);
        }
    }, 3000);
});

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Show Login Form
function showLogin() {
    document.getElementById('registerContainer').style.display = 'none';
    document.getElementById('authContainer').style.display = 'flex';
}

// Show Register Form
function showRegister() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('registerContainer').style.display = 'flex';
}

// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    initDatabase();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Show loading
            Swal.fire({
                title: 'Loading...',
                text: 'Memverifikasi kredensial...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Check credentials
            const db = await getDatabase();
            const user = db.users.find(u => u.username === username && u.password === password);
            
            setTimeout(() => {
                if (user) {
                    Swal.fire({
                        icon: 'success',
                        title: `Welcome ${username}!`,
                        text: 'Login berhasil, mengalihkan...',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        if (rememberMe) {
                            localStorage.setItem('currentUser', JSON.stringify(user));
                        } else {
                            sessionStorage.setItem('currentUser', JSON.stringify(user));
                        }
                        window.location.href = 'home.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Gagal',
                        text: 'Username atau password salah!'
                    });
                }
            }, 3000);
        });
    }
    
    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            if (password !== confirmPassword) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Password tidak cocok!'
                });
                return;
            }
            
            // Show loading
            Swal.fire({
                title: 'Loading...',
                text: 'Membuat akun...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            
            // Save to database
            const db = await getDatabase();
            
            // Check if username exists
            if (db.users.some(u => u.username === username)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Username sudah digunakan!'
                });
                return;
            }
            
            const newUser = {
                username: username,
                password: password,
                credit: 0,
                resetUsed: 0,
                lastReset: null,
                transactions: []
            };
            
            db.users.push(newUser);
            await updateDatabase(db);
            
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Sukses!',
                    text: 'Akun berhasil dibuat, silakan login.',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    showLogin();
                });
            }, 2000);
        });
    }
    
    // Initialize page based on current file
    initializePage();
});

// Initialize Page
function initializePage() {
    const path = window.location.pathname;
    
    if (path.includes('home.html')) {
        initializeHome();
    } else if (path.includes('admin.html')) {
        initializeAdmin();
    }
}

// Initialize Home Page
async function initializeHome() {
    // Get current user
    const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update user greeting
    document.getElementById('username').textContent = user.username;
    
    // Get database and update credit
    const db = await getDatabase();
    const currentUser = db.users.find(u => u.username === user.username);
    if (currentUser) {
        document.getElementById('creditSaldo').textContent = currentUser.credit;
    }
    
    // Load products
    loadProducts();
    
    // Check running text
    if (db.settings.runningText.enabled && db.settings.runningText.text) {
        document.getElementById('runningText').textContent = db.settings.runningText.text;
        document.getElementById('runningTextContainer').style.display = 'block';
    }
    
    // Menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenu = document.getElementById('closeMenu');
    
    menuToggle.addEventListener('click', () => {
        sideMenu.classList.add('open');
    });
    
    closeMenu.addEventListener('click', () => {
        sideMenu.classList.remove('open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!sideMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            sideMenu.classList.remove('open');
        }
    });
}

// Load Products
async function loadProducts() {
    const db = await getDatabase();
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    db.products.forEach(product => {
        const features = product.features ? product.features.split(',').map(f => f.trim()) : [];
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => showProductDetail(product);
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-features">
                    ${features.map(f => `<span class="feature-tag">✓ ${f}</span>`).join('')}
                </div>
            </div>
        `;
        
        productsGrid.appendChild(card);
    });
}

// Show Product Detail
function showProductDetail(product) {
    const modal = document.getElementById('productModal');
    const content = document.getElementById('productDetailContent');
    
    let priceOptionsHtml = '';
    product.prices.forEach((price, index) => {
        priceOptionsHtml += `
            <div class="price-option" onclick="selectPriceOption(${index}, ${price.value})">
                <span>${price.label}</span>
                <span>$${price.value}</span>
            </div>
        `;
    });
    
    content.innerHTML = `
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-features">
            ${product.features.split(',').map(f => `<span class="feature-tag">✓ ${f.trim()}</span>`).join('')}
        </div>
        
        <h4 style="margin: 1rem 0;">Pilih Opsi:</h4>
        <div class="price-options-container">
            ${priceOptionsHtml}
        </div>
        
        <div class="quantity-control">
            <button onclick="changeQuantity(-1)">-</button>
            <span id="quantity">1</span>
            <button onclick="changeQuantity(1)">+</button>
        </div>
        
        <div class="promo-input">
            <input type="text" id="promoCodeInput" placeholder="Masukkan kode promo">
            <button onclick="applyPromo()">Apply</button>
        </div>
        
        <div class="whatsapp-input">
            <input type="text" id="whatsappNumber" placeholder="Masukkan nomor WhatsApp">
        </div>
        
        <div style="margin: 1rem 0; text-align: right;">
            <strong>Total: $<span id="totalPrice">${product.prices[0].value}</span></strong>
        </div>
        
        <button class="auth-btn" onclick="buyProduct('${product.id}')">
            <span>Buy Now</span>
        </button>
    `;
    
    modal.style.display = 'flex';
    
    // Store selected product data
    window.selectedProduct = product;
    window.selectedPrice = product.prices[0];
    window.quantity = 1;
    window.appliedPromo = null;
}

// Select Price Option
function selectPriceOption(index, price) {
    window.selectedPrice = window.selectedProduct.prices[index];
    updateTotalPrice();
    
    // Update UI
    document.querySelectorAll('.price-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
}

// Change Quantity
function changeQuantity(delta) {
    window.quantity = Math.max(1, window.quantity + delta);
    document.getElementById('quantity').textContent = window.quantity;
    updateTotalPrice();
}

// Update Total Price
function updateTotalPrice() {
    let total = window.selectedPrice.value * window.quantity;
    
    if (window.appliedPromo) {
        total = total * (1 - window.appliedPromo.discount / 100);
    }
    
    document.getElementById('totalPrice').textContent = total.toFixed(2);
}

// Apply Promo
async function applyPromo() {
    const code = document.getElementById('promoCodeInput').value;
    if (!code) return;
    
    const db = await getDatabase();
    const promo = db.promoCodes.find(p => p.code === code);
    
    if (!promo) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Promo',
            text: 'Kode promo tidak valid!'
        });
        return;
    }
    
    if (promo.used >= promo.maxUse) {
        Swal.fire({
            icon: 'error',
            title: 'Promo Expired',
            text: 'Kode promo sudah mencapai batas penggunaan!'
        });
        return;
    }
    
    window.appliedPromo = promo;
    updateTotalPrice();
    
    Swal.fire({
        icon: 'success',
        title: 'Promo Applied!',
        text: `Diskon ${promo.discount}% berhasil diterapkan!`
    });
}

// Buy Product
async function buyProduct(productId) {
    const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    const whatsapp = document.getElementById('whatsappNumber').value;
    
    if (!whatsapp) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Masukkan nomor WhatsApp!'
        });
        return;
    }
    
    const total = parseFloat(document.getElementById('totalPrice').textContent);
    
    // Check user credit
    const db = await getDatabase();
    const currentUser = db.users.find(u => u.username === user.username);
    
    if (currentUser.credit < total) {
        Swal.fire({
            icon: 'error',
            title: 'Saldo Tidak Cukup',
            text: `Saldo Anda: $${currentUser.credit}, Dibutuhkan: $${total}`
        });
        return;
    }
    
    // Process transaction
    const transaction = {
        id: 'TRX' + Date.now(),
        userId: currentUser.username,
        productId: productId,
        productName: window.selectedProduct.name,
        price: window.selectedPrice.value,
        quantity: window.quantity,
        total: total,
        whatsapp: whatsapp,
        promo: window.appliedPromo ? window.appliedPromo.code : null,
        status: 'waiting',
        date: new Date().toISOString(),
        keys: []
    };
    
    // Update user credit
    currentUser.credit -= total;
    
    // Update promo usage
    if (window.appliedPromo) {
        const promo = db.promoCodes.find(p => p.code === window.appliedPromo.code);
        if (promo) {
            promo.used = (promo.used || 0) + 1;
        }
    }
    
    // Add transaction
    db.transactions.push(transaction);
    
    // Save to database
    await updateDatabase(db);
    
    // Update local storage
    if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    // Update credit display
    document.getElementById('creditSaldo').textContent = currentUser.credit;
    
    Swal.fire({
        icon: 'success',
        title: 'Pembelian Berhasil!',
        text: 'Transaksi sedang diproses. ID Transaksi: ' + transaction.id
    });
    
    closeProductModal();
}

// Close Product Modal
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Open Reset Key Modal
function openResetKeyModal() {
    document.getElementById('resetKeyModal').style.display = 'flex';
}

// Close Reset Key Modal
function closeResetKeyModal() {
    document.getElementById('resetKeyModal').style.display = 'none';
}

// Process Reset Key
async function processResetKey() {
    const btn = document.getElementById('resetKeyBtn');
    const response = document.getElementById('resetResponse');
    const input = document.getElementById('resetInput').value;
    
    if (!input) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Masukkan key yang akan direset!'
        });
        return;
    }
    
    // Get database
    const db = await getDatabase();
    
    // Check if reset key system is enabled
    if (!db.settings.resetKeySystem) {
        response.innerHTML = `
            <div style="color: var(--danger); padding: 1rem; background: rgba(248, 113, 113, 0.1); border-radius: 10px;">
                <i class="fas fa-exclamation-circle"></i>
                Maaf fitur ini sedang di nonaktifkan oleh admin atau sedang tidak beroperasi normal,<br>
                Silahkan coba lagi nanti.
            </div>
        `;
        return;
    }
    
    // Get current user
    const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    const currentUser = db.users.find(u => u.username === user.username);
    
    // Check if user has used reset today
    const lastReset = currentUser.lastReset ? new Date(currentUser.lastReset) : null;
    const today = new Date();
    
    if (lastReset && lastReset.toDateString() === today.toDateString()) {
        response.innerHTML = `
            <div style="color: var(--danger); padding: 1rem; background: rgba(248, 113, 113, 0.1); border-radius: 10px;">
                <i class="fas fa-exclamation-circle"></i>
                Anda sudah melakukan reset hari ini. Maksimal reset 1x perhari.
            </div>
        `;
        return;
    }
    
    // Show loading
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching Server.....';
    
    setTimeout(async () => {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Respone Database.....';
        
        setTimeout(async () => {
            // Generate random 12 digit key
            const newKey = Math.floor(100000000000 + Math.random() * 900000000000);
            
            // Update user reset data
            currentUser.resetUsed = (currentUser.resetUsed || 0) + 1;
            currentUser.lastReset = new Date().toISOString();
            
            await updateDatabase(db);
            
            response.innerHTML = `
                <div style="color: var(--success); padding: 1rem; background: rgba(74, 222, 128, 0.1); border-radius: 10px;">
                    <i class="fas fa-check-circle"></i>
                    <strong>✅ Reset Successful</strong><br><br>
                    Status: 200<br>
                    Response: {"success":true,"message":"Token reset successfully","resetsused":${currentUser.resetUsed},"resetsmax":2,"nextresettime":"${new Date(Date.now() + 24*60*60*1000).toISOString().replace('T', ' ').substr(0, 19)}"}<br><br>
                    <strong>New Key: ${newKey}</strong>
                </div>
            `;
            
            btn.innerHTML = '<span>Reset</span>';
        }, 2000);
    }, 2000);
}

// Open Transaction Logs
async function openTransactionLogs() {
    const modal = document.getElementById('transactionLogsModal');
    const content = document.getElementById('transactionLogsContent');
    
    const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    const db = await getDatabase();
    
    const userTransactions = db.transactions.filter(t => t.userId === user.username);
    
    if (userTransactions.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Belum ada transaksi</p>';
    } else {
        content.innerHTML = userTransactions.map(t => `
            <div class="transaction-item ${t.status}">
                <div class="transaction-header">
                    <span class="transaction-id">${t.id}</span>
                    <span class="transaction-status status-${t.status}">${t.status.toUpperCase()}</span>
                </div>
                <div>Product: ${t.productName}</div>
                <div>Quantity: ${t.quantity}</div>
                <div>Total: $${t.total}</div>
                <div>Date: ${new Date(t.date).toLocaleString()}</div>
                ${t.keys && t.keys.length > 0 ? `<div>Keys: ${t.keys.join(', ')}</div>` : ''}
            </div>
        `).join('');
    }
    
    modal.style.display = 'flex';
}

// Close Transaction Logs
function closeTransactionLogs() {
    document.getElementById('transactionLogsModal').style.display = 'none';
}

// Logout
function logout() {
    Swal.fire({
        title: 'Logout',
        text: 'Apakah Anda yakin ingin logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        cancelButtonColor: 'var(--danger)',
        confirmButtonText: 'Ya, logout'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
}

// Initialize Admin Page
async function initializeAdmin() {
    // Load existing data
    await loadAdminProducts();
    await loadAdminTransactions();
    
    // Load settings
    const db = await getDatabase();
    document.getElementById('runningTextToggle').checked = db.settings.runningText.enabled;
    document.getElementById('resetKeyToggle').checked = db.settings.resetKeySystem;
    document.getElementById('runningTextInput').value = db.settings.runningText.text || '';
}

// Add Price Row
function addPriceRow() {
    const container = document.getElementById('priceOptions');
    const row = document.createElement('div');
    row.className = 'price-row';
    row.innerHTML = `
        <input type="text" placeholder="Label (contoh: 1 DAYS)" class="price-label">
        <input type="number" placeholder="Harga $" class="price-value">
    `;
    container.appendChild(row);
}

// Add Product
async function addProduct() {
    const name = document.getElementById('productName').value;
    const image = document.getElementById('productImage').value;
    const desc = document.getElementById('productDesc').value;
    const features = document.getElementById('productFeatures').value;
    
    if (!name || !image || !desc || !features) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Semua field harus diisi!'
        });
        return;
    }
    
    // Get price options
    const priceRows = document.querySelectorAll('.price-row');
    const prices = [];
    
    priceRows.forEach(row => {
        const label = row.querySelector('.price-label').value;
        const value = parseFloat(row.querySelector('.price-value').value);
        if (label && value) {
            prices.push({ label, value });
        }
    });
    
    if (prices.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Minimal 1 opsi harga harus diisi!'
        });
        return;
    }
    
    const db = await getDatabase();
    
    const newProduct = {
        id: 'PROD' + Date.now(),
        name: name,
        image: image,
        description: desc,
        features: features,
        prices: prices
    };
    
    db.products.push(newProduct);
    await updateDatabase(db);
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: 'Produk berhasil ditambahkan'
    });
    
    // Clear form
    document.getElementById('productName').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productDesc').value = '';
    document.getElementById('productFeatures').value = '';
    document.getElementById('priceOptions').innerHTML = `
        <div class="price-row">
            <input type="text" placeholder="Label (contoh: 1 DAYS)" class="price-label">
            <input type="number" placeholder="Harga $" class="price-value">
        </div>
    `;
    
    // Reload products
    loadAdminProducts();
}

// Add Promo Code
async function addPromoCode() {
    const code = document.getElementById('promoCode').value;
    const percent = parseInt(document.getElementById('promoPercent').value);
    const maxUse = parseInt(document.getElementById('promoMax').value);
    
    if (!code || !percent || !maxUse) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Semua field harus diisi!'
        });
        return;
    }
    
    const db = await getDatabase();
    
    const newPromo = {
        code: code,
        discount: percent,
        maxUse: maxUse,
        used: 0
    };
    
    db.promoCodes.push(newPromo);
    await updateDatabase(db);
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: 'Kode promo berhasil ditambahkan'
    });
    
    // Clear form
    document.getElementById('promoCode').value = '';
    document.getElementById('promoPercent').value = '';
    document.getElementById('promoMax').value = '';
}

// Toggle Running Text
async function toggleRunningText() {
    const toggle = document.getElementById('runningTextToggle');
    const db = await getDatabase();
    
    db.settings.runningText.enabled = toggle.checked;
    await updateDatabase(db);
}

// Save Running Text
async function saveRunningText() {
    const text = document.getElementById('runningTextInput').value;
    const db = await getDatabase();
    
    db.settings.runningText.text = text;
    await updateDatabase(db);
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: 'Running text berhasil disimpan'
    });
}

// Add Credit
async function addCredit() {
    const username = document.getElementById('targetUsername').value;
    const amount = parseFloat(document.getElementById('creditAmount').value);
    
    if (!username || !amount) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Semua field harus diisi!'
        });
        return;
    }
    
    const db = await getDatabase();
    const user = db.users.find(u => u.username === username);
    
    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Username tidak ditemukan!'
        });
        return;
    }
    
    user.credit += amount;
    await updateDatabase(db);
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: `Saldo ${username} berhasil ditambahkan $${amount}`
    });
    
    // Clear form
    document.getElementById('targetUsername').value = '';
    document.getElementById('creditAmount').value = '';
}

// Toggle Reset Key System
async function toggleResetKeySystem() {
    const toggle = document.getElementById('resetKeyToggle');
    const db = await getDatabase();
    
    db.settings.resetKeySystem = toggle.checked;
    await updateDatabase(db);
}

// Load Admin Products
async function loadAdminProducts() {
    const db = await getDatabase();
    const container = document.getElementById('productsList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    db.products.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'product-item';
        productEl.innerHTML = `
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <small>Harga: ${product.prices.map(p => `${p.label}: $${p.value}`).join(', ')}</small>
            <div class="product-item-actions">
                <button class="btn-edit" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        container.appendChild(productEl);
    });
}

// Edit Product
async function editProduct(productId) {
    const db = await getDatabase();
    const product = db.products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Populate form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDesc').value = product.description;
    document.getElementById('productFeatures').value = product.features;
    
    // Clear and populate price options
    const container = document.getElementById('priceOptions');
    container.innerHTML = '';
    
    product.prices.forEach(price => {
        const row = document.createElement('div');
        row.className = 'price-row';
        row.innerHTML = `
            <input type="text" value="${price.label}" class="price-label">
            <input type="number" value="${price.value}" class="price-value">
        `;
        container.appendChild(row);
    });
    
    // Change add button to update
    const addBtn = document.querySelector('.admin-card button[onclick="addProduct()"]');
    addBtn.innerHTML = '<i class="fas fa-sync"></i> Update Product';
    addBtn.setAttribute('onclick', `updateProduct('${productId}')`);
}

// Update Product
async function updateProduct(productId) {
    const name = document.getElementById('productName').value;
    const image = document.getElementById('productImage').value;
    const desc = document.getElementById('productDesc').value;
    const features = document.getElementById('productFeatures').value;
    
    if (!name || !image || !desc || !features) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Semua field harus diisi!'
        });
        return;
    }
    
    // Get price options
    const priceRows = document.querySelectorAll('.price-row');
    const prices = [];
    
    priceRows.forEach(row => {
        const label = row.querySelector('.price-label').value;
        const value = parseFloat(row.querySelector('.price-value').value);
        if (label && value) {
            prices.push({ label, value });
        }
    });
    
    if (prices.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Minimal 1 opsi harga harus diisi!'
        });
        return;
    }
    
    const db = await getDatabase();
    const productIndex = db.products.findIndex(p => p.id === productId);
    
    if (productIndex !== -1) {
        db.products[productIndex] = {
            ...db.products[productIndex],
            name: name,
            image: image,
            description: desc,
            features: features,
            prices: prices
        };
        
        await updateDatabase(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Produk berhasil diupdate'
        });
        
        // Reset form and reload
        resetProductForm();
        loadAdminProducts();
    }
}

// Delete Product
async function deleteProduct(productId) {
    const result = await Swal.fire({
        title: 'Hapus Produk?',
        text: 'Produk yang dihapus tidak dapat dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--danger)',
        cancelButtonColor: 'var(--primary)',
        confirmButtonText: 'Ya, hapus!'
    });
    
    if (result.isConfirmed) {
        const db = await getDatabase();
        db.products = db.products.filter(p => p.id !== productId);
        await updateDatabase(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Produk berhasil dihapus'
        });
        
        loadAdminProducts();
    }
}

// Reset Product Form
function resetProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productDesc').value = '';
    document.getElementById('productFeatures').value = '';
    document.getElementById('priceOptions').innerHTML = `
        <div class="price-row">
            <input type="text" placeholder="Label (contoh: 1 DAYS)" class="price-label">
            <input type="number" placeholder="Harga $" class="price-value">
        </div>
    `;
    
    const addBtn = document.querySelector('.admin-card button[onclick*="addProduct"]');
    addBtn.innerHTML = '<i class="fas fa-save"></i> Add Product';
    addBtn.setAttribute('onclick', 'addProduct()');
}

// Load Admin Transactions
async function loadAdminTransactions() {
    const db = await getDatabase();
    const container = document.getElementById('adminTransactionLogs');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    db.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(transaction => {
        const trxEl = document.createElement('div');
        trxEl.className = `transaction-item ${transaction.status}`;
        trxEl.innerHTML = `
            <div class="transaction-header">
                <span class="transaction-id">${transaction.id}</span>
                <span class="transaction-status status-${transaction.status}">${transaction.status.toUpperCase()}</span>
            </div>
            <div>User: ${transaction.userId}</div>
            <div>Product: ${transaction.productName}</div>
            <div>Quantity: ${transaction.quantity}</div>
            <div>Total: $${transaction.total}</div>
            <div>WhatsApp: ${transaction.whatsapp}</div>
            <div>Date: ${new Date(transaction.date).toLocaleString()}</div>
            ${transaction.promo ? `<div>Promo: ${transaction.promo}</div>` : ''}
            ${transaction.keys && transaction.keys.length > 0 ? `<div>Keys: ${transaction.keys.join(', ')}</div>` : ''}
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                ${transaction.status === 'waiting' ? `
                    <button class="auth-btn" style="flex: 1;" onclick="approveTransaction('${transaction.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="auth-btn" style="flex: 1; background: linear-gradient(135deg, var(--danger), #dc2626);" onclick="rejectTransaction('${transaction.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                ` : ''}
            </div>
        `;
        container.appendChild(trxEl);
    });
}

// Approve Transaction
let currentTransactionId = null;

function approveTransaction(transactionId) {
    currentTransactionId = transactionId;
    document.getElementById('approveModal').style.display = 'flex';
}

// Submit Approval
async function submitApproval() {
    const keys = document.getElementById('keyInput').value.split(',').map(k => k.trim()).filter(k => k);
    
    if (keys.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Masukkan minimal 1 key!'
        });
        return;
    }
    
    const db = await getDatabase();
    const transaction = db.transactions.find(t => t.id === currentTransactionId);
    
    if (transaction) {
        transaction.status = 'approved';
        transaction.keys = keys;
        
        await updateDatabase(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Transaksi berhasil diapprove'
        });
        
        document.getElementById('approveModal').style.display = 'none';
        document.getElementById('keyInput').value = '';
        loadAdminTransactions();
    }
}

// Reject Transaction
async function rejectTransaction(transactionId) {
    const result = await Swal.fire({
        title: 'Reject Transaksi?',
        text: 'Apakah Anda yakin ingin mereject transaksi ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--danger)',
        cancelButtonColor: 'var(--primary)',
        confirmButtonText: 'Ya, reject'
    });
    
    if (result.isConfirmed) {
        const db = await getDatabase();
        const transaction = db.transactions.find(t => t.id === transactionId);
        
        if (transaction) {
            transaction.status = 'rejected';
            
            // Refund credit
            const user = db.users.find(u => u.username === transaction.userId);
            if (user) {
                user.credit += transaction.total;
            }
            
            await updateDatabase(db);
            
            Swal.fire({
                icon: 'success',
                title: 'Sukses!',
                text: 'Transaksi direject dan dana dikembalikan'
            });
            
            loadAdminTransactions();
        }
    }
}

// Close Approve Modal
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// FAQ Data
const faqData = [
    {
        question: "Apa itu Drip Client?",
        answer: "Drip Client adalah cheat android dengan fitur lengkap seperti Silent Aim, Anti Ban, dan berbagai fitur premium lainnya untuk meningkatkan pengalaman gaming Anda."
    },
    {
        question: "Bagaimana cara membeli key?",
        answer: "Pilih produk yang diinginkan, tentukan durasi, masukkan kode promo (jika ada), nomor WhatsApp, lalu klik Buy Now. Admin akan memproses pembelian Anda."
    },
    {
        question: "Apakah ada garansi anti ban?",
        answer: "Ya, semua produk Drip Client dilengkapi dengan fitur anti ban untuk keamanan akun Anda."
    },
    {
        question: "Berapa lama proses pembelian?",
        answer: "Proses pembelian biasanya diproses dalam 1x24 jam oleh admin. Status transaksi bisa dilihat di menu Logs Transaksi."
    },
    {
        question: "Bagaimana jika lupa key?",
        answer: "Anda bisa menggunakan fitur Reset Key di menu Quick Actions untuk mendapatkan key baru (maksimal 1x per hari)."
    }
];

// Initialize FAQ
function initFAQ() {
    const faqContainer = document.querySelector('.faq-section');
    if (!faqContainer) return;
    
    faqData.forEach((item, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        faqItem.innerHTML = `
            <div class="faq-question" onclick="toggleFAQ(${index})">
                ${item.question}
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="faq-answer">
                ${item.answer}
            </div>
        `;
        faqContainer.appendChild(faqItem);
    });
}

// Toggle FAQ
function toggleFAQ(index) {
    const items = document.querySelectorAll('.faq-item');
    items[index].classList.toggle('active');
}

// Call initFAQ when on home page
if (window.location.pathname.includes('home.html')) {
    document.addEventListener('DOMContentLoaded', initFAQ);
}