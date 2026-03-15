// Konfigurasi JSONBin
const JSONBIN_API_KEY = '$2a$10$pHIKB7MrEZf5JpPo397.Xu8neS2lV/zvnzJG.rCn4Zt4g2th.uO6S';
const JSONBIN_BIN_ID = '69b69542c3097a1dd52887b3'; // Ganti dengan bin ID Anda
const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3/b';

// State global
let currentUser = null;
let products = [];
let promoCodes = [];
let transactions = [];
let settings = {
    runningText: {
        text: "KODE PROMO TERBARU : DISKON70%",
        enabled: false
    },
    resetKeyEnabled: true
};
let runningTextEnabled = false;

// Inisialisasi saat dokumen dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: '#9b4dff' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: true },
                size: { value: 3, random: true },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#9b4dff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                }
            },
            retina_detect: true
        });
    }

    // Handle loading screen
    handleLoadingScreen();

    // Cek halaman saat ini
    const path = window.location.pathname;
    
    if (path.includes('index.html') || path === '/' || path.endsWith('index.html')) {
        initLoginPage();
    } else if (path.includes('register.html')) {
        initRegisterPage();
    } else if (path.includes('home.html')) {
        initHomePage();
    } else if (path.includes('admin.html')) {
        initAdminPage();
    }
});

// Fungsi untuk handle loading screen
function handleLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                
                // Tampilkan konten sesuai halaman
                if (document.getElementById('loginContainer')) {
                    document.getElementById('loginContainer').style.display = 'flex';
                } else if (document.getElementById('registerContainer')) {
                    document.getElementById('registerContainer').style.display = 'flex';
                } else if (document.getElementById('dashboard')) {
                    document.getElementById('dashboard').style.display = 'block';
                    
                    // Tampilkan welcome popup setelah 1 detik
                    setTimeout(() => {
                        if (document.getElementById('welcomePopup')) {
                            document.getElementById('welcomePopup').style.display = 'flex';
                        }
                    }, 1000);
                } else if (document.getElementById('adminDashboard')) {
                    document.getElementById('adminDashboard').style.display = 'block';
                }
            }, 500);
        }
    }, 3000);
}

// Inisialisasi halaman login
function initLoginPage() {
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Tampilkan loading pada button
            const loginButton = document.getElementById('loginButton');
            const originalText = loginButton.innerHTML;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            loginButton.disabled = true;
            
            try {
                // Cek di database JSONBin
                const users = await getUsers();
                const user = users.find(u => u.username === username && u.password === password);
                
                if (user) {
                    // Simpan session
                    if (rememberMe) {
                        localStorage.setItem('currentUser', JSON.stringify(user));
                    } else {
                        sessionStorage.setItem('currentUser', JSON.stringify(user));
                    }
                    
                    // Tampilkan animasi welcome
                    Swal.fire({
                        title: `Welcome ${username}!`,
                        text: 'Mengalihkan ke dashboard...',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        background: '#1a1a2a',
                        color: '#fff',
                        iconColor: '#9b4dff'
                    });
                    
                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 2000);
                } else {
                    Swal.fire({
                        title: 'Login Gagal',
                        text: 'Username atau password salah!',
                        icon: 'error',
                        background: '#1a1a2a',
                        color: '#fff',
                        iconColor: '#ff4d4d'
                    });
                    
                    loginButton.innerHTML = originalText;
                    loginButton.disabled = false;
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Terjadi kesalahan saat login',
                    icon: 'error',
                    background: '#1a1a2a',
                    color: '#fff'
                });
                
                loginButton.innerHTML = originalText;
                loginButton.disabled = false;
            }
        });
    }
}

// Inisialisasi halaman register
function initRegisterPage() {
    // Toggle password visibility
    const toggleRegPassword = document.getElementById('toggleRegPassword');
    const regPassword = document.getElementById('regPassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (toggleRegPassword && regPassword) {
        toggleRegPassword.addEventListener('click', function() {
            const type = regPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            regPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    if (toggleConfirmPassword && confirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Handle register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPass) {
                Swal.fire({
                    title: 'Error',
                    text: 'Password tidak cocok!',
                    icon: 'error',
                    background: '#1a1a2a',
                    color: '#fff'
                });
                return;
            }
            
            // Tampilkan loading
            const registerButton = document.getElementById('registerButton');
            const originalText = registerButton.innerHTML;
            registerButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftar...';
            registerButton.disabled = true;
            
            try {
                // Ambil users dari database
                const users = await getUsers();
                
                // Cek apakah username sudah ada
                if (users.some(u => u.username === username)) {
                    Swal.fire({
                        title: 'Error',
                        text: 'Username sudah digunakan!',
                        icon: 'error',
                        background: '#1a1a2a',
                        color: '#fff'
                    });
                    
                    registerButton.innerHTML = originalText;
                    registerButton.disabled = false;
                    return;
                }
                
                // Tambah user baru
                const newUser = {
                    id: Date.now(),
                    username,
                    password,
                    credit: 0,
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                
                // Simpan ke database
                await saveUsers(users);
                
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Akun berhasil dibuat. Silakan login.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1a1a2a',
                    color: '#fff'
                });
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
                
            } catch (error) {
                console.error('Error:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Terjadi kesalahan saat mendaftar',
                    icon: 'error',
                    background: '#1a1a2a',
                    color: '#fff'
                });
                
                registerButton.innerHTML = originalText;
                registerButton.disabled = false;
            }
        });
    }
}

// Inisialisasi halaman home
async function initHomePage() {
    // Cek session user
    currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update UI dengan data user
    document.getElementById('navUsername').textContent = currentUser.username;
    document.getElementById('welcomeUsername').textContent = currentUser.username;
    document.getElementById('navCredit').textContent = currentUser.credit || 0;
    
    // Load data
    await loadProducts();
    await loadSettings();
    
    // Inisialisasi event listeners
    initHomeEventListeners();
    
    // Handle close welcome popup
    document.getElementById('closeWelcomePopup').addEventListener('click', function() {
        document.getElementById('welcomePopup').style.display = 'none';
    });
    
    // Handle hamburger menu
    const hamburger = document.getElementById('hamburgerMenu');
    const sideNav = document.getElementById('sideNav');
    const closeSideNav = document.getElementById('closeSideNav');
    
    if (hamburger && sideNav) {
        hamburger.addEventListener('click', function() {
            sideNav.classList.add('open');
        });
    }
    
    if (closeSideNav && sideNav) {
        closeSideNav.addEventListener('click', function() {
            sideNav.classList.remove('open');
        });
    }
    
    // Handle reset key action
    document.getElementById('resetKeyAction').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('sideNav').classList.remove('open');
        document.getElementById('resetKeyModal').classList.add('show');
    });
    
    document.getElementById('closeResetModal').addEventListener('click', function() {
        document.getElementById('resetKeyModal').classList.remove('show');
    });
    
    // Handle reset button
    document.getElementById('resetButton').addEventListener('click', handleResetKey);
    
    // Handle logs transaction
    document.getElementById('logsTransactionAction').addEventListener('click', async function(e) {
        e.preventDefault();
        document.getElementById('sideNav').classList.remove('open');
        await loadUserTransactions();
        document.getElementById('transactionsModal').classList.add('show');
    });
    
    document.getElementById('closeTransactionsModal').addEventListener('click', function() {
        document.getElementById('transactionsModal').classList.remove('show');
    });
    
    // Handle logout
    document.getElementById('logoutAction').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// Inisialisasi halaman admin
async function initAdminPage() {
    // Load data
    await loadProducts();
    await loadPromoCodes();
    await loadTransactions();
    await loadSettings();
    
    // Inisialisasi event listeners
    initAdminEventListeners();
    
    // Handle tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Handle add product form
    document.getElementById('addProductForm').addEventListener('submit', handleAddProduct);
    
    // Handle add promo form
    document.getElementById('addPromoForm').addEventListener('submit', handleAddPromo);
    
    // Handle running text form
    document.getElementById('runningTextForm').addEventListener('submit', handleUpdateRunningText);
    
    // Handle add saldo form
    document.getElementById('addSaldoForm').addEventListener('submit', handleAddSaldo);
    
    // Handle reset key toggle
    document.getElementById('resetKeyToggle').addEventListener('change', handleResetKeyToggle);
    
    // Load running text status
    const runningTextToggle = document.getElementById('runningTextToggle');
    if (runningTextToggle) {
        runningTextToggle.checked = settings.runningText.enabled;
    }
    
    // Load reset key toggle
    const resetKeyToggle = document.getElementById('resetKeyToggle');
    if (resetKeyToggle) {
        resetKeyToggle.checked = settings.resetKeyEnabled;
    }
}

// Event listeners untuk home page
function initHomeEventListeners() {
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

// Event listeners untuk admin page
function initAdminEventListeners() {
    // Close approve modal
    document.getElementById('closeApproveModal').addEventListener('click', function() {
        document.getElementById('approveModal').classList.remove('show');
    });
}

// Fungsi untuk handle reset key
async function handleResetKey() {
    const resetButton = document.getElementById('resetButton');
    const resetResponse = document.getElementById('resetResponse');
    const deviceId = document.getElementById('resetInput').value;
    
    resetButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching Server.....';
    resetButton.disabled = true;
    
    try {
        // Simulasi proses
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        resetResponse.innerHTML = 'Respone Database....';
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Cek apakah fitur reset key aktif
        if (!settings.resetKeyEnabled) {
            throw new Error('Fitur dinonaktifkan');
        }
        
        // Cek batas reset per hari
        const today = new Date().toDateString();
        const resetsKey = `reset_${currentUser.id}_${today}`;
        const resetCount = parseInt(localStorage.getItem(resetsKey) || '0');
        
        if (resetCount >= 2) {
            resetResponse.innerHTML = `❌ Reset Failed
            
Status: 429
Response: {"success":false,"message":"Reset limit reached","resetsused":2,"resetsmax":2,"nextresettime":"${new Date(Date.now() + 86400000).toISOString()}"}`;
            resetResponse.className = 'reset-response error';
        } else {
            // Simpan count reset
            localStorage.setItem(resetsKey, (resetCount + 1).toString());
            
            // Generate new key
            const newKey = generateKey();
            
            resetResponse.innerHTML = `✅ Reset Successful

Status: 200
Response: {"success":true,"message":"Token reset successfully","newkey":"${newKey}","resetsused":${resetCount + 1},"resetsmax":2,"nextresettime":"${new Date(Date.now() + 86400000).toISOString()}"}`;
            resetResponse.className = 'reset-response success';
        }
        
    } catch (error) {
        resetResponse.innerHTML = `❌ Reset Failed

Status: 403
Response: {"success":false,"message":"Maaf fitur ini sedang di nonaktifkan oleh admin atau sedang tidak beroperasi normal, Silahkan coba lagi nanti."}`;
        resetResponse.className = 'reset-response error';
    }
    
    resetButton.innerHTML = 'Reset';
    resetButton.disabled = false;
}

// Generate random key
function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            key += chars[Math.floor(Math.random() * chars.length)];
        }
        if (i < 3) key += '-';
    }
    return key;
}

// Fungsi untuk load produk
async function loadProducts() {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Failed to load products');
        
        const data = await response.json();
        products = data.record.products || [];
        
        // Render products di home
        if (document.getElementById('productsGrid')) {
            renderProducts();
        }
        
        // Render products di admin
        if (document.getElementById('productsList')) {
            renderAdminProducts();
        }
        
    } catch (error) {
        console.error('Error loading products:', error);
        // Gunakan data dummy jika gagal
        products = getDummyProducts();
        
        if (document.getElementById('productsGrid')) {
            renderProducts();
        }
    }
}

// Render products di home
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-features">
                    ${product.features.map(f => `
                        <span class="feature-tag">
                            <i class="fas fa-check-circle"></i> ${f}
                        </span>
                    `).join('')}
                </div>
                <button class="product-price-btn" onclick="showProductModal('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> Lihat Harga
                </button>
            </div>
        </div>
    `).join('');
}

// Render products di admin
function renderAdminProducts() {
    const list = document.getElementById('productsList');
    if (!list) return;
    
    list.innerHTML = products.map(product => `
        <div class="admin-product-item">
            <div class="product-info">
                <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; border-radius: 10px;">
                <div>
                    <h4>${product.name}</h4>
                    <p>${product.description.substring(0, 50)}...</p>
                </div>
            </div>
            <div class="product-actions">
                <button class="admin-btn small" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="admin-btn small danger" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        </div>
    `).join('');
}

// Fungsi untuk load promo codes
async function loadPromoCodes() {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Failed to load promos');
        
        const data = await response.json();
        promoCodes = data.record.promoCodes || [];
        
        renderAdminPromos();
        
    } catch (error) {
        console.error('Error loading promos:', error);
        promoCodes = [];
    }
}

// Render promo codes di admin
function renderAdminPromos() {
    const list = document.getElementById('promosList');
    if (!list) return;
    
    list.innerHTML = promoCodes.map(promo => `
        <div class="admin-promo-item">
            <div class="promo-info">
                <h4>${promo.code}</h4>
                <p>Diskon: ${promo.percent}% | Maks: ${promo.maxUse} | Terpakai: ${promo.used || 0}</p>
            </div>
            <div class="promo-actions">
                <button class="admin-btn small danger" onclick="deletePromo('${promo.id}')">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        </div>
    `).join('');
}

// Fungsi untuk load transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Failed to load transactions');
        
        const data = await response.json();
        transactions = data.record.transactions || [];
        
        renderAdminTransactions();
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        transactions = [];
    }
}

// Render transactions di admin
function renderAdminTransactions() {
    const list = document.getElementById('adminTransactionsList');
    if (!list) return;
    
    list.innerHTML = transactions.map(trx => `
        <div class="admin-transaction-item">
            <div class="transaction-header">
                <span class="transaction-id">ID: ${trx.id}</span>
                <span class="transaction-status status-${trx.status}">${trx.status}</span>
            </div>
            <div class="transaction-body">
                <p><strong>User:</strong> ${trx.username}</p>
                <p><strong>Product:</strong> ${trx.productName}</p>
                <p><strong>Plan:</strong> ${trx.selectedPlan}</p>
                <p><strong>Quantity:</strong> ${trx.quantity}</p>
                <p><strong>Total:</strong> $${trx.totalPrice}</p>
                <p><strong>WhatsApp:</strong> ${trx.phoneNumber}</p>
                <p><strong>Date:</strong> ${new Date(trx.date).toLocaleString()}</p>
                ${trx.keys ? `<p><strong>Keys:</strong> ${trx.keys.join(', ')}</p>` : ''}
            </div>
            ${trx.status === 'Waiting' ? `
                <div class="transaction-actions">
                    <button class="admin-btn small success" onclick="approveTransaction('${trx.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="admin-btn small danger" onclick="rejectTransaction('${trx.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Load user transactions
async function loadUserTransactions() {
    const list = document.getElementById('transactionsList');
    if (!list || !currentUser) return;
    
    const userTransactions = transactions.filter(t => t.userId === currentUser.id);
    
    list.innerHTML = userTransactions.map(trx => `
        <div class="transaction-item">
            <div class="transaction-header">
                <h4>${trx.productName}</h4>
                <span class="transaction-status status-${trx.status}">${trx.status}</span>
            </div>
            <div class="transaction-details">
                <p><strong>Tanggal:</strong> ${new Date(trx.date).toLocaleString()}</p>
                <p><strong>ID Trx:</strong> ${trx.id}</p>
                <p><strong>Plan:</strong> ${trx.selectedPlan}</p>
                <p><strong>Quantity:</strong> ${trx.quantity}</p>
                <p><strong>Total:</strong> $${trx.totalPrice}</p>
                ${trx.keys ? `
                    <div class="transaction-keys">
                        <strong>Keys:</strong>
                        <div class="keys-list">
                            ${trx.keys.map(key => `<code>${key}</code>`).join(' ')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    if (userTransactions.length === 0) {
        list.innerHTML = '<p class="no-data">Belum ada transaksi</p>';
    }
}

// Fungsi untuk load settings
async function loadSettings() {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Failed to load settings');
        
        const data = await response.json();
        settings = data.record.settings || settings;
        
        // Update running text di home
        const runningTextContainer = document.getElementById('runningTextContainer');
        const runningText = document.getElementById('runningText');
        
        if (runningTextContainer && runningText) {
            if (settings.runningText.enabled) {
                runningTextContainer.style.display = 'block';
                runningText.innerHTML = `<span>${settings.runningText.text}</span>`;
            } else {
                runningTextContainer.style.display = 'none';
            }
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Fungsi untuk handle add product
async function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const image = document.getElementById('productImage').value;
    const description = document.getElementById('productDescription').value;
    const features = document.getElementById('productFeatures').value.split(',').map(f => f.trim());
    
    // Ambil price options
    const priceOptions = [];
    document.querySelectorAll('#priceOptions .price-option').forEach(option => {
        const inputs = option.querySelectorAll('input');
        if (inputs[0].value && inputs[1].value) {
            priceOptions.push({
                name: inputs[0].value,
                price: parseFloat(inputs[1].value)
            });
        }
    });
    
    const newProduct = {
        id: Date.now().toString(),
        name,
        image,
        description,
        features,
        priceOptions
    };
    
    products.push(newProduct);
    
    try {
        await saveProducts(products);
        
        Swal.fire({
            title: 'Sukses!',
            text: 'Produk berhasil ditambahkan',
            icon: 'success',
            background: '#1a1a2a',
            color: '#fff'
        });
        
        document.getElementById('addProductForm').reset();
        renderAdminProducts();
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Gagal menambahkan produk',
            icon: 'error',
            background: '#1a1a2a',
            color: '#fff'
        });
    }
}

// Fungsi untuk handle add promo
async function handleAddPromo(e) {
    e.preventDefault();
    
    const code = document.getElementById('promoCode').value.toUpperCase();
    const percent = parseInt(document.getElementById('promoPercent').value);
    const maxUse = parseInt(document.getElementById('promoMaxUse').value);
    
    const newPromo = {
        id: Date.now().toString(),
        code,
        percent,
        maxUse,
        used: 0
    };
    
    promoCodes.push(newPromo);
    
    try {
        await savePromoCodes(promoCodes);
        
        Swal.fire({
            title: 'Sukses!',
            text: 'Kode promo berhasil ditambahkan',
            icon: 'success',
            background: '#1a1a2a',
            color: '#fff'
        });
        
        document.getElementById('addPromoForm').reset();
        renderAdminPromos();
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Gagal menambahkan promo',
            icon: 'error',
            background: '#1a1a2a',
            color: '#fff'
        });
    }
}

// Fungsi untuk handle update running text
async function handleUpdateRunningText(e) {
    e.preventDefault();
    
    const text = document.getElementById('runningTextInput').value;
    const enabled = document.getElementById('runningTextToggle').checked;
    
    settings.runningText = { text, enabled };
    
    try {
        await saveSettings(settings);
        
        Swal.fire({
            title: 'Sukses!',
            text: 'Running text berhasil diupdate',
            icon: 'success',
            background: '#1a1a2a',
            color: '#fff'
        });
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Gagal mengupdate running text',
            icon: 'error',
            background: '#1a1a2a',
            color: '#fff'
        });
    }
}

// Fungsi untuk handle add saldo
async function handleAddSaldo(e) {
    e.preventDefault();
    
    const username = document.getElementById('targetUsername').value;
    const amount = parseFloat(document.getElementById('creditAmount').value);
    
    try {
        const users = await getUsers();
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            Swal.fire({
                title: 'Error',
                text: 'Username tidak ditemukan!',
                icon: 'error',
                background: '#1a1a2a',
                color: '#fff'
            });
            return;
        }
        
        users[userIndex].credit = (users[userIndex].credit || 0) + amount;
        await saveUsers(users);
        
        Swal.fire({
            title: 'Sukses!',
            text: `Berhasil menambahkan $${amount} ke ${username}`,
            icon: 'success',
            background: '#1a1a2a',
            color: '#fff'
        });
        
        document.getElementById('addSaldoForm').reset();
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'Gagal menambahkan saldo',
            icon: 'error',
            background: '#1a1a2a',
            color: '#fff'
        });
    }
}

// Fungsi untuk handle reset key toggle
async function handleResetKeyToggle(e) {
    settings.resetKeyEnabled = e.target.checked;
    await saveSettings(settings);
}

// Fungsi untuk show product modal
window.showProductModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('productModalBody');
    const modalTitle = document.getElementById('productModalTitle');
    
    modalTitle.textContent = product.name;
    
    let selectedPlan = null;
    let quantity = 1;
    let totalPrice = 0;
    let appliedPromo = null;
    
    modalBody.innerHTML = `
        <div class="product-detail">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 15px; margin-bottom: 15px;">
            
            <div class="product-features" style="margin-bottom: 15px;">
                ${product.features.map(f => `
                    <span class="feature-tag">
                        <i class="fas fa-check-circle"></i> ${f}
                    </span>
                `).join('')}
            </div>
            
            <div class="price-options" id="priceOptions">
                ${product.priceOptions.map((opt, index) => `
                    <button class="price-option-btn" data-price="${opt.price}" data-plan="${opt.name}">
                        <span>${opt.name}</span>
                        <span>$${opt.price}</span>
                    </button>
                `).join('')}
            </div>
            
            <div class="quantity-control">
                <button class="quantity-btn" id="decreaseQty">-</button>
                <span class="quantity-display" id="quantity">1</span>
                <button class="quantity-btn" id="increaseQty">+</button>
            </div>
            
            <div class="promo-input">
                <input type="text" id="promoCode" placeholder="Masukkan kode promo (opsional)">
                <small style="color: var(--text-muted); display: block; margin-top: 5px;">Contoh: DISKON70%</small>
            </div>
            
            <div class="phone-input">
                <input type="text" id="phoneNumber" placeholder="Masukkan nomor WhatsApp" value="+62">
            </div>
            
            <div class="total-price" id="totalPrice">Total: $0</div>
            
            <button class="buy-now-btn" id="buyNowBtn" disabled>Buy Now</button>
        </div>
    `;
    
    // Event listeners untuk price options
    document.querySelectorAll('.price-option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.price-option-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            
            selectedPlan = {
                name: this.dataset.plan,
                price: parseFloat(this.dataset.price)
            };
            
            updateTotal();
            document.getElementById('buyNowBtn').disabled = false;
        });
    });
    
    // Quantity controls
    document.getElementById('decreaseQty').addEventListener('click', function() {
        if (quantity > 1) {
            quantity--;
            document.getElementById('quantity').textContent = quantity;
            updateTotal();
        }
    });
    
    document.getElementById('increaseQty').addEventListener('click', function() {
        quantity++;
        document.getElementById('quantity').textContent = quantity;
        updateTotal();
    });
    
    // Promo code input
    document.getElementById('promoCode').addEventListener('input', function() {
        checkPromoCode(this.value);
    });
    
    // Update total function
    function updateTotal() {
        if (selectedPlan) {
            totalPrice = selectedPlan.price * quantity;
            
            if (appliedPromo) {
                totalPrice = totalPrice - (totalPrice * appliedPromo.percent / 100);
            }
            
            document.getElementById('totalPrice').textContent = `Total: $${totalPrice.toFixed(2)}`;
        }
    }
    
    // Check promo code function
    async function checkPromoCode(code) {
        if (!code) {
            appliedPromo = null;
            updateTotal();
            return;
        }
        
        const promo = promoCodes.find(p => p.code === code.toUpperCase());
        
        if (promo && promo.used < promo.maxUse) {
            appliedPromo = promo;
            Swal.fire({
                title: 'Promo Valid!',
                text: `Anda mendapatkan diskon ${promo.percent}%`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: '#1a1a2a',
                color: '#fff'
            });
        } else {
            appliedPromo = null;
            if (code) {
                Swal.fire({
                    title: 'Promo Tidak Valid',
                    text: 'Kode promo tidak valid atau sudah habis',
                    icon: 'error',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1a1a2a',
                    color: '#fff'
                });
            }
        }
        
        updateTotal();
    }
    
    // Buy now button
    document.getElementById('buyNowBtn').addEventListener('click', async function() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        
        if (!selectedPlan) {
            Swal.fire({
                title: 'Error',
                text: 'Pilih paket terlebih dahulu',
                icon: 'error',
                background: '#1a1a2a',
                color: '#fff'
            });
            return;
        }
        
        if (!phoneNumber || phoneNumber.length < 10) {
            Swal.fire({
                title: 'Error',
                text: 'Masukkan nomor WhatsApp yang valid',
                icon: 'error',
                background: '#1a1a2a',
                color: '#fff'
            });
            return;
        }
        
        // Cek saldo
        if ((currentUser.credit || 0) < totalPrice) {
            Swal.fire({
                title: 'Saldo Tidak Cukup',
                text: `Anda membutuhkan $${totalPrice.toFixed(2)} tapi saldo Anda hanya $${currentUser.credit || 0}`,
                icon: 'error',
                background: '#1a1a2a',
                color: '#fff'
            });
            return;
        }
        
        // Proses pembelian
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        this.disabled = true;
        
        try {
            // Kurangi saldo user
            currentUser.credit -= totalPrice;
            
            // Update user di database
            const users = await getUsers();
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].credit = currentUser.credit;
                await saveUsers(users);
            }
            
            // Update promo usage if applied
            if (appliedPromo) {
                const promoIndex = promoCodes.findIndex(p => p.id === appliedPromo.id);
                if (promoIndex !== -1) {
                    promoCodes[promoIndex].used = (promoCodes[promoIndex].used || 0) + 1;
                    await savePromoCodes(promoCodes);
                }
            }
            
            // Buat transaksi
            const newTransaction = {
                id: 'TRX-' + Date.now(),
                userId: currentUser.id,
                username: currentUser.username,
                productId: product.id,
                productName: product.name,
                selectedPlan: selectedPlan.name,
                price: selectedPlan.price,
                quantity: quantity,
                totalPrice: totalPrice,
                phoneNumber: phoneNumber,
                promoCode: appliedPromo ? appliedPromo.code : null,
                discount: appliedPromo ? appliedPromo.percent : 0,
                status: 'Waiting',
                date: new Date().toISOString()
            };
            
            transactions.push(newTransaction);
            await saveTransactions(transactions);
            
            // Update UI credit
            document.getElementById('navCredit').textContent = currentUser.credit;
            
            Swal.fire({
                title: 'Pembelian Berhasil!',
                html: `
                    <p>Pesanan Anda sedang diproses</p>
                    <p>ID Transaksi: ${newTransaction.id}</p>
                    <p>Status: Menunggu persetujuan admin</p>
                `,
                icon: 'success',
                background: '#1a1a2a',
                color: '#fff'
            });
            
            // Tutup modal
            modal.classList.remove('show');
            
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'Gagal memproses pembelian',
                icon: 'error',
                background: '#1a1a2a',
                color: '#fff'
            });
        }
    });
    
    modal.classList.add('show');
};

// Fungsi untuk approve transaction
window.approveTransaction = async function(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    document.getElementById('approveModal').classList.add('show');
    
    const approveForm = document.getElementById('approveForm');
    approveForm.onsubmit = async function(e) {
        e.preventDefault();
        
        const keys = document.getElementById('keysInput').value.split(',').map(k => k.trim());
        
        transaction.status = 'Approved';
        transaction.keys = keys;
        
        await saveTransactions(transactions);
        
        Swal.fire({
            title: 'Sukses!',
            text: 'Transaksi telah diapprove dan key telah dikirim',
            icon: 'success',
            background: '#1a1a2a',
            color: '#fff'
        });
        
        document.getElementById('approveModal').classList.remove('show');
        renderAdminTransactions();
    };
};

// Fungsi untuk reject transaction
window.rejectTransaction = async function(transactionId) {
    const result = await Swal.fire({
        title: 'Reject Transaksi?',
        text: 'Apakah Anda yakin ingin menolak transaksi ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4d',
        cancelButtonColor: '#9b4dff',
        confirmButtonText: 'Ya, Reject',
        cancelButtonText: 'Batal',
        background: '#1a1a2a',
        color: '#fff'
    });
    
    if (result.isConfirmed) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (transaction) {
            transaction.status = 'Rejected';
            await saveTransactions(transactions);
            renderAdminTransactions();
            
            Swal.fire({
                title: 'Rejected!',
                text: 'Transaksi telah ditolak',
                icon: 'success',
                background: '#1a1a2a',
                color: '#fff'
            });
        }
    }
};

// Fungsi untuk edit product
window.editProduct = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Implement edit product modal
    Swal.fire({
        title: 'Edit Product',
        html: `
            <input id="editName" class="swal2-input" placeholder="Nama Product" value="${product.name}">
            <input id="editImage" class="swal2-input" placeholder="Image URL" value="${product.image}">
            <textarea id="editDescription" class="swal2-textarea" placeholder="Deskripsi">${product.description}</textarea>
            <input id="editFeatures" class="swal2-input" placeholder="Fitur (pisahkan koma)" value="${product.features.join(', ')}">
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        background: '#1a1a2a',
        color: '#fff',
        preConfirm: async () => {
            const name = document.getElementById('editName').value;
            const image = document.getElementById('editImage').value;
            const description = document.getElementById('editDescription').value;
            const features = document.getElementById('editFeatures').value.split(',').map(f => f.trim());
            
            product.name = name;
            product.image = image;
            product.description = description;
            product.features = features;
            
            await saveProducts(products);
            renderAdminProducts();
            
            return true;
        }
    });
};

// Fungsi untuk delete product
window.deleteProduct = async function(productId) {
    const result = await Swal.fire({
        title: 'Hapus Product?',
        text: 'Apakah Anda yakin ingin menghapus product ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4d',
        cancelButtonColor: '#9b4dff',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        background: '#1a1a2a',
        color: '#fff'
    });
    
    if (result.isConfirmed) {
        products = products.filter(p => p.id !== productId);
        await saveProducts(products);
        renderAdminProducts();
        
        Swal.fire({
            title: 'Terhapus!',
            text: 'Product telah dihapus',
            icon: 'success',
            background: '#1a1a2a',
            color: '#fff'
        });
    }
};

// Fungsi untuk delete promo
window.deletePromo = async function(promoId) {
    const result = await Swal.fire({
        title: 'Hapus Promo?',
        text: 'Apakah Anda yakin ingin menghapus promo ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4d',
        cancelButtonColor: '#9b4dff',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        background: '#1a1a2a',
        color: '#fff'
    });
    
    if (result.isConfirmed) {
        promoCodes = promoCodes.filter(p => p.id !== promoId);
        await savePromoCodes(promoCodes);
        renderAdminPromos();
        
        Swal.fire({
            title: 'Terhapus!',
            text: 'Promo telah dihapus',
            icon: 'success',
            background: '#1a1a2a',
            color: '#fff'
        });
    }
};

// Fungsi database
async function getUsers() {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!response.ok) throw new Error('Failed to get users');
        
        const data = await response.json();
        return data.record.users || [];
        
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}

async function saveUsers(users) {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({
                users,
                products,
                promoCodes,
                transactions,
                settings
            })
        });
        
        if (!response.ok) throw new Error('Failed to save users');
        
    } catch (error) {
        console.error('Error saving users:', error);
        throw error;
    }
}

async function saveProducts(products) {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({
                users: await getUsers(),
                products,
                promoCodes,
                transactions,
                settings
            })
        });
        
        if (!response.ok) throw new Error('Failed to save products');
        
    } catch (error) {
        console.error('Error saving products:', error);
        throw error;
    }
}

async function savePromoCodes(promoCodes) {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({
                users: await getUsers(),
                products,
                promoCodes,
                transactions,
                settings
            })
        });
        
        if (!response.ok) throw new Error('Failed to save promos');
        
    } catch (error) {
        console.error('Error saving promos:', error);
        throw error;
    }
}

async function saveTransactions(transactions) {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({
                users: await getUsers(),
                products,
                promoCodes,
                transactions,
                settings
            })
        });
        
        if (!response.ok) throw new Error('Failed to save transactions');
        
    } catch (error) {
        console.error('Error saving transactions:', error);
        throw error;
    }
}

async function saveSettings(settings) {
    try {
        const response = await fetch(`${JSONBIN_BASE_URL}/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify({
                users: await getUsers(),
                products,
                promoCodes,
                transactions,
                settings
            })
        });
        
        if (!response.ok) throw new Error('Failed to save settings');
        
    } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
    }
}

// Data dummy untuk inisialisasi
function getDummyProducts() {
    return [
        {
            id: '1',
            name: 'DRIP CLIENT PRO',
            image: 'https://via.placeholder.com/300x200/9b4dff/ffffff?text=DRIP+PRO',
            description: 'Cheat Android dengan fitur lengkap',
            features: ['No Ban', 'Silent Aim', 'Wallhack', 'ESP'],
            priceOptions: [
                { name: '1 DAYS', price: 1 },
                { name: '3 DAYS', price: 10 },
                { name: '7 DAYS', price: 7 },
                { name: '15 DAYS', price: 15 },
                { name: '1 MONTH', price: 30 }
            ]
        },
        {
            id: '2',
            name: 'DRIP CLIENT LITE',
            image: 'https://via.placeholder.com/300x200/ff49b0/ffffff?text=DRIP+LITE',
            description: 'Cheat Android versi ringan',
            features: ['No Ban', 'Silent Aim'],
            priceOptions: [
                { name: '1 DAYS', price: 0.5 },
                { name: '7 DAYS', price: 3 },
                { name: '15 DAYS', price: 5 },
                { name: '1 MONTH', price: 10 }
            ]
        }
    ];
}