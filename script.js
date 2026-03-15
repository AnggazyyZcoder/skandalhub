// JSONBin Configuration
const JSONBIN_API_KEY = '$2a$10$ldwDDS5thsD8qBEdjcNzc..R6XpeQggFqRrl4a6NNv3pQVEfhYbBq'; // Ganti dengan API key Anda
const JSONBIN_BIN_ID = '69b66b19b7ec241ddc6d56c5'; // Ganti dengan Bin ID Anda
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Initialize database
async function initDatabase() {
    try {
        const response = await fetch(JSONBIN_URL, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (!response.ok) {
            // Create initial data if bin doesn't exist
            const initialData = {
                users: [],
                products: [],
                promos: [],
                transactions: [],
                settings: {
                    runningText: {
                        content: 'KODE PROMO TERBARU : DISKON70%',
                        enabled: false
                    },
                    resetSystem: {
                        enabled: true
                    }
                }
            };
            
            await updateDatabase(initialData);
            return initialData;
        }
        
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.error('Database init error:', error);
        return null;
    }
}

// Update database
async function updateDatabase(data) {
    try {
        const response = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(data)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Database update error:', error);
        return null;
    }
}

// Global variables
let currentUser = null;
let selectedProduct = null;
let selectedPrice = null;
let currentQuantity = 1;
let appliedPromo = null;
let currentTransactionId = null;

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = event.currentTarget;
    
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

// Login function
async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Username dan password harus diisi!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    // Show loading
    Swal.fire({
        title: 'Loading...',
        html: 'Memvalidasi data...',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Get database
    const db = await initDatabase();
    if (!db) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal terhubung ke database!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    // Find user
    const user = db.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Welcome animation
        Swal.fire({
            title: `Welcome ${username}!`,
            text: 'Mengalihkan ke dashboard...',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: 'var(--card-bg)',
            color: 'var(--text)'
        }).then(() => {
            // Save current user
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('rememberedUser', username);
            }
            
            // Redirect to home
            window.location.href = 'home.html';
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Login Gagal',
            text: 'Username atau password salah!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
    }
}

// Register function
async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Semua field harus diisi!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Password tidak cocok!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    // Show loading
    Swal.fire({
        title: 'Loading...',
        html: 'Membuat akun...',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Get database
    const db = await initDatabase();
    if (!db) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal terhubung ke database!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    // Check if username exists
    if (db.users.some(u => u.username === username)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Username sudah digunakan!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    // Create new user
    const newUser = {
        username: username,
        password: password,
        credit: 0,
        createdAt: new Date().toISOString()
    };
    
    db.users.push(newUser);
    await updateDatabase(db);
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: 'Akun berhasil dibuat! Silakan login.',
        background: 'var(--card-bg)',
        color: 'var(--text)'
    }).then(() => {
        window.location.href = 'index.html';
    });
}

// Initialize dashboard
async function initializeDashboard() {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('usernameDisplay').textContent = currentUser.username;
    document.getElementById('userCredit').textContent = currentUser.credit;
    
    // Load products
    await loadProducts();
    
    // Check running text
    await checkRunningText();
    
    // Hamburger menu
    document.getElementById('hamburgerMenu').addEventListener('click', function() {
        document.getElementById('navbar').classList.add('open');
    });
    
    document.getElementById('closeNavbar').addEventListener('click', function() {
        document.getElementById('navbar').classList.remove('open');
    });
    
    // FAQ items
    document.querySelectorAll('.faq-question').forEach(item => {
        item.addEventListener('click', function() {
            this.parentElement.classList.toggle('active');
        });
    });
}

// Load products
async function loadProducts() {
    const db = await initDatabase();
    if (!db) return;
    
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';
    
    db.products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.setProperty('--i', index + 1);
        productCard.onclick = () => showProductDetail(product);
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=DRIP+CLIENT'">
            </div>
            <h3>${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            <ul class="product-features">
                ${product.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
            </ul>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Show product detail
function showProductDetail(product) {
    selectedProduct = product;
    selectedPrice = product.prices[0];
    currentQuantity = 1;
    appliedPromo = null;
    
    document.getElementById('quantity').textContent = '1';
    document.getElementById('totalPrice').textContent = `$${product.prices[0].value}`;
    
    const productDetail = document.getElementById('productDetail');
    productDetail.innerHTML = `
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <ul>
            ${product.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
        </ul>
    `;
    
    const priceOptions = document.getElementById('priceOptions');
    priceOptions.innerHTML = '';
    
    product.prices.forEach((price, index) => {
        const option = document.createElement('div');
        option.className = `price-option ${index === 0 ? 'selected' : ''}`;
        option.onclick = () => selectPrice(price, option);
        option.innerHTML = `
            <div class="label">${price.label}</div>
            <div class="value">$${price.value}</div>
        `;
        priceOptions.appendChild(option);
    });
    
    document.getElementById('productDetailPopup').style.display = 'flex';
}

// Select price
function selectPrice(price, element) {
    selectedPrice = price;
    
    document.querySelectorAll('.price-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    element.classList.add('selected');
    
    updateTotalPrice();
}

// Update quantity
function updateQuantity(change) {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
        currentQuantity = newQuantity;
        document.getElementById('quantity').textContent = currentQuantity;
        updateTotalPrice();
    }
}

// Update total price
function updateTotalPrice() {
    let total = selectedPrice.value * currentQuantity;
    
    if (appliedPromo) {
        total = total * (1 - appliedPromo.percent / 100);
    }
    
    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
}

// Apply promo
async function applyPromo() {
    const promoCode = document.getElementById('promoCode').value;
    
    if (!promoCode) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Masukkan kode promo!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    const db = await initDatabase();
    if (!db) return;
    
    const promo = db.promos.find(p => p.code === promoCode);
    
    if (!promo) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Kode promo tidak valid!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    if (promo.used >= promo.maxUses) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Kode promo sudah mencapai batas pemakaian!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    appliedPromo = promo;
    updateTotalPrice();
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: `Kode promo berhasil diaplikasikan! Diskon ${promo.percent}%`,
        background: 'var(--card-bg)',
        color: 'var(--text)'
    });
}

// Process purchase
async function processPurchase() {
    const whatsapp = document.getElementById('whatsappNumber').value;
    
    if (!whatsapp) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Masukkan nomor Whatsapp!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    const total = selectedPrice.value * currentQuantity * (appliedPromo ? (1 - appliedPromo.percent / 100) : 1);
    
    if (currentUser.credit < total) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Saldo tidak mencukupi!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    // Show loading
    Swal.fire({
        title: 'Processing...',
        html: 'Memproses pembelian...',
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    const db = await initDatabase();
    if (!db) return;
    
    // Create transaction
    const transaction = {
        id: 'TRX' + Date.now() + Math.random().toString(36).substr(2, 9),
        userId: currentUser.username,
        product: selectedProduct.name,
        price: selectedPrice,
        quantity: currentQuantity,
        total: total,
        promo: appliedPromo ? appliedPromo.code : null,
        whatsapp: whatsapp,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        keys: []
    };
    
    db.transactions.push(transaction);
    
    // Update user credit
    const userIndex = db.users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        db.users[userIndex].credit -= total;
        currentUser.credit = db.users[userIndex].credit;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('userCredit').textContent = currentUser.credit;
    }
    
    // Update promo usage
    if (appliedPromo) {
        const promoIndex = db.promos.findIndex(p => p.code === appliedPromo.code);
        if (promoIndex !== -1) {
            db.promos[promoIndex].used++;
        }
    }
    
    await updateDatabase(db);
    
    closePopup('productDetailPopup');
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: 'Pembelian berhasil! Menunggu proses admin.',
        background: 'var(--card-bg)',
        color: 'var(--text)'
    });
}

// Show reset key popup
function showResetKeyPopup() {
    document.getElementById('resetKeyPopup').style.display = 'flex';
}

// Process reset key
async function processResetKey() {
    const input = document.getElementById('resetInput').value;
    
    if (!input) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Masukkan key lama!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    const resultDiv = document.getElementById('resetResult');
    resultDiv.innerHTML = 'Fetching Server.....';
    
    const db = await initDatabase();
    if (!db) return;
    
    // Check if reset system is enabled
    if (!db.settings.resetSystem.enabled) {
        resultDiv.innerHTML = `
            <div style="color: var(--danger)">
                Maaf fitur ini sedang di nonaktifkan oleh admin atau sedang tidak beroperasi normal, Silahkan coba lagi nanti.
            </div>
        `;
        return;
    }
    
    resultDiv.innerHTML = 'Respone Database....';
    
    setTimeout(() => {
        // Check if user has used reset today
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem(`reset_${currentUser.username}_${today}`);
        
        if (lastReset) {
            resultDiv.innerHTML = `
                <div style="color: var(--danger)">
                    ⚠️ Reset Key Gagal<br><br>
                    Status: 429<br>
                    Response: {"success":false,"message":"You have reached the maximum number of resets for today","resetsused":1,"resetsmax":1,"nextresettime":"${new Date(Date.now() + 86400000).toISOString()}"}
                </div>
            `;
            return;
        }
        
        // Generate random key
        const newKey = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
        
        resultDiv.innerHTML = `
            <div style="color: var(--success)">
                ✅ Reset Successful<br><br>
                Status: 200<br>
                Response: {"success":true,"message":"Token reset successfully","resetsused":1,"resetsmax":1,"nextresettime":"${new Date(Date.now() + 86400000).toISOString()}"}<br><br>
                New Key: <span style="color: var(--primary); font-size: 18px;">${newKey}</span>
            </div>
        `;
        
        localStorage.setItem(`reset_${currentUser.username}_${today}`, 'true');
    }, 1500);
}

// Show transaction logs
async function showTransactionLogs() {
    const db = await initDatabase();
    if (!db) return;
    
    const userTransactions = db.transactions.filter(t => t.userId === currentUser.username);
    
    const logsContainer = document.getElementById('logsContainer');
    logsContainer.innerHTML = '';
    
    if (userTransactions.length === 0) {
        logsContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Belum ada transaksi</p>';
    } else {
        userTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        userTransactions.forEach(transaction => {
            const logItem = document.createElement('div');
            logItem.className = 'transaction-item';
            
            let statusClass = '';
            let statusText = '';
            
            switch(transaction.status) {
                case 'approved':
                    statusClass = 'status-approved';
                    statusText = 'Approved';
                    break;
                case 'rejected':
                    statusClass = 'status-rejected';
                    statusText = 'Rejected';
                    break;
                default:
                    statusClass = 'status-waiting';
                    statusText = 'Waiting';
            }
            
            logItem.innerHTML = `
                <div class="transaction-header">
                    <span class="transaction-id">${transaction.id}</span>
                    <span class="transaction-status ${statusClass}">${statusText}</span>
                </div>
                <div class="transaction-details">
                    <p><strong>Product:</strong> ${transaction.product}</p>
                    <p><strong>Plan:</strong> ${transaction.price.label}</p>
                    <p><strong>Quantity:</strong> ${transaction.quantity}</p>
                    <p><strong>Total:</strong> $${transaction.total.toFixed(2)}</p>
                    <p><strong>Tanggal:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                    ${transaction.keys && transaction.keys.length > 0 ? 
                        `<div class="keys-display">
                            <strong>Keys:</strong><br>
                            ${transaction.keys.map(key => `- ${key}`).join('<br>')}
                        </div>` : ''
                    }
                </div>
            `;
            
            logsContainer.appendChild(logItem);
        });
    }
    
    document.getElementById('transactionLogsPopup').style.display = 'flex';
}

// Show FAQ
function showFAQ() {
    document.getElementById('faqPopup').style.display = 'flex';
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
        confirmButtonText: 'Ya, logout',
        cancelButtonText: 'Batal',
        background: 'var(--card-bg)',
        color: 'var(--text)'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
}

// Check running text
async function checkRunningText() {
    const db = await initDatabase();
    if (!db) return;
    
    const container = document.getElementById('runningTextContainer');
    const content = document.getElementById('runningTextContent');
    
    if (db.settings.runningText.enabled && db.settings.runningText.content) {
        content.textContent = db.settings.runningText.content;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

// Initialize admin dashboard
async function initializeAdminDashboard() {
    await loadAdminProducts();
    await loadAdminPromos();
    await loadAdminSettings();
    await loadAdminTransactions();
    
    // Menu toggle
    document.getElementById('adminMenuToggle').addEventListener('click', function() {
        const sidebar = document.getElementById('adminSidebar');
        sidebar.style.width = sidebar.style.width === '70px' ? '250px' : '70px';
    });
}

// Show admin section
function showAdminSection(section) {
    document.querySelectorAll('.admin-sidebar li').forEach(li => {
        li.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    document.querySelectorAll('.admin-section').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
}

// Load admin products
async function loadAdminProducts() {
    const db = await initDatabase();
    if (!db) return;
    
    const productsList = document.getElementById('adminProductsList');
    productsList.innerHTML = '';
    
    db.products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            <div class="product-actions">
                <button onclick="editProduct('${product.id}')" class="admin-btn" style="background: var(--warning);">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button onclick="deleteProduct('${product.id}')" class="admin-btn" style="background: var(--danger);">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        `;
        productsList.appendChild(productItem);
    });
}

// Add new product
async function addNewProduct() {
    const name = document.getElementById('productName').value;
    const image = document.getElementById('productImage').value;
    const desc = document.getElementById('productDesc').value;
    const features = document.getElementById('productFeatures').value.split(',').map(f => f.trim());
    
    const prices = [];
    for (let i = 1; i <= 5; i++) {
        const label = document.getElementById(`priceLabel${i}`).value;
        const value = document.getElementById(`priceValue${i}`).value;
        if (label && value) {
            prices.push({
                label: label,
                value: parseFloat(value)
            });
        }
    }
    
    if (!name || !image || !desc || features.length === 0 || prices.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Semua field harus diisi!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    const db = await initDatabase();
    if (!db) return;
    
    const newProduct = {
        id: 'PROD' + Date.now(),
        name: name,
        image: image,
        description: desc,
        features: features,
        prices: prices,
        createdAt: new Date().toISOString()
    };
    
    db.products.push(newProduct);
    await updateDatabase(db);
    
    await loadAdminProducts();
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: 'Produk berhasil ditambahkan!',
        background: 'var(--card-bg)',
        color: 'var(--text)'
    });
    
    // Clear form
    document.getElementById('productName').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productDesc').value = '';
    document.getElementById('productFeatures').value = '';
}

// Load admin promos
async function loadAdminPromos() {
    const db = await initDatabase();
    if (!db) return;
    
    const promosList = document.getElementById('adminPromosList');
    promosList.innerHTML = '';
    
    db.promos.forEach(promo => {
        const promoItem = document.createElement('div');
        promoItem.className = 'promo-item';
        promoItem.innerHTML = `
            <h4>${promo.code}</h4>
            <p>Diskon: ${promo.percent}%</p>
            <p>Digunakan: ${promo.used || 0}/${promo.maxUses}</p>
            <button onclick="deletePromo('${promo.code}')" class="admin-btn" style="background: var(--danger);">
                <i class="fas fa-trash"></i> Hapus
            </button>
        `;
        promosList.appendChild(promoItem);
    });
}

// Add new promo
async function addNewPromo() {
    const code = document.getElementById('promoCode').value.toUpperCase();
    const percent = parseInt(document.getElementById('promoPercent').value);
    const maxUses = parseInt(document.getElementById('promoMax').value);
    
    if (!code || !percent || !maxUses) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Semua field harus diisi!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    const db = await initDatabase();
    if (!db) return;
    
    if (db.promos.some(p => p.code === code)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Kode promo sudah ada!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    const newPromo = {
        code: code,
        percent: percent,
        maxUses: maxUses,
        used: 0
    };
    
    db.promos.push(newPromo);
    await updateDatabase(db);
    
    await loadAdminPromos();
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: 'Kode promo berhasil ditambahkan!',
        background: 'var(--card-bg)',
        color: 'var(--text)'
    });
    
    // Clear form
    document.getElementById('promoCode').value = '';
    document.getElementById('promoPercent').value = '';
    document.getElementById('promoMax').value = '';
}

// Load admin settings
async function loadAdminSettings() {
    const db = await initDatabase();
    if (!db) return;
    
    document.getElementById('runningTextContent').value = db.settings.runningText.content || '';
    document.getElementById('runningTextToggle').checked = db.settings.runningText.enabled;
    document.getElementById('runningTextStatus').textContent = db.settings.runningText.enabled ? 'On' : 'Off';
    
    document.getElementById('resetSystemToggle').checked = db.settings.resetSystem.enabled;
    document.getElementById('resetSystemStatus').textContent = db.settings.resetSystem.enabled ? 'On' : 'Off';
}

// Save running text
async function saveRunningText() {
    const content = document.getElementById('runningTextContent').value;
    const enabled = document.getElementById('runningTextToggle').checked;
    
    const db = await initDatabase();
    if (!db) return;
    
    db.settings.runningText = {
        content: content,
        enabled: enabled
    };
    
    await updateDatabase(db);
    
    document.getElementById('runningTextStatus').textContent = enabled ? 'On' : 'Off';
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: 'Pengaturan running text berhasil disimpan!',
        background: 'var(--card-bg)',
        color: 'var(--text)'
    });
}

// Save reset system
async function saveResetSystem() {
    const enabled = document.getElementById('resetSystemToggle').checked;
    
    const db = await initDatabase();
    if (!db) return;
    
    db.settings.resetSystem.enabled = enabled;
    
    await updateDatabase(db);
    
    document.getElementById('resetSystemStatus').textContent = enabled ? 'On' : 'Off';
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: 'Pengaturan reset system berhasil disimpan!',
        background: 'var(--card-bg)',
        color: 'var(--text)'
    });
}

// Transfer saldo
async function transferSaldo() {
    const username = document.getElementById('saldoUsername').value;
    const amount = parseFloat(document.getElementById('saldoAmount').value);
    
    if (!username || !amount) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Semua field harus diisi!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    const db = await initDatabase();
    if (!db) return;
    
    const userIndex = db.users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Username tidak ditemukan!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    db.users[userIndex].credit += amount;
    await updateDatabase(db);
    
    Swal.fire({
        icon: 'success',
        title: 'Sukses!',
        text: `Saldo berhasil ditambahkan ke ${username}!`,
        background: 'var(--card-bg)',
        color: 'var(--text)'
    });
    
    // Clear form
    document.getElementById('saldoUsername').value = '';
    document.getElementById('saldoAmount').value = '';
}

// Load admin transactions
async function loadAdminTransactions() {
    const db = await initDatabase();
    if (!db) return;
    
    const transactionsList = document.getElementById('adminTransactionsList');
    transactionsList.innerHTML = '';
    
    db.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    db.transactions.forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        
        let statusClass = '';
        let statusText = '';
        
        switch(transaction.status) {
            case 'approved':
                statusClass = 'status-approved';
                statusText = 'Approved';
                break;
            case 'rejected':
                statusClass = 'status-rejected';
                statusText = 'Rejected';
                break;
            default:
                statusClass = 'status-waiting';
                statusText = 'Waiting';
        }
        
        let actions = '';
        if (transaction.status === 'waiting') {
            actions = `
                <div class="transaction-actions">
                    <button onclick="showApprovePopup('${transaction.id}')" class="approve-btn">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button onclick="rejectTransaction('${transaction.id}')" class="reject-btn">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            `;
        }
        
        transactionItem.innerHTML = `
            <div class="transaction-header">
                <span class="transaction-id">${transaction.id}</span>
                <span class="transaction-status ${statusClass}">${statusText}</span>
            </div>
            <div class="transaction-details">
                <p><strong>User:</strong> ${transaction.userId}</p>
                <p><strong>Product:</strong> ${transaction.product}</p>
                <p><strong>Plan:</strong> ${transaction.price.label}</p>
                <p><strong>Quantity:</strong> ${transaction.quantity}</p>
                <p><strong>Total:</strong> $${transaction.total.toFixed(2)}</p>
                <p><strong>Whatsapp:</strong> ${transaction.whatsapp}</p>
                <p><strong>Tanggal:</strong> ${new Date(transaction.createdAt).toLocaleString()}</p>
                ${transaction.promo ? `<p><strong>Promo:</strong> ${transaction.promo}</p>` : ''}
                ${transaction.keys && transaction.keys.length > 0 ? 
                    `<div class="keys-display">
                        <strong>Keys:</strong><br>
                        ${transaction.keys.map(key => `- ${key}`).join('<br>')}
                    </div>` : ''
                }
            </div>
            ${actions}
        `;
        
        transactionsList.appendChild(transactionItem);
    });
}

// Show approve popup
function showApprovePopup(transactionId) {
    currentTransactionId = transactionId;
    document.getElementById('approveTransactionPopup').style.display = 'flex';
}

// Confirm approve
async function confirmApprove() {
    const keys = document.getElementById('approveKeys').value.split(',').map(k => k.trim()).filter(k => k);
    
    if (keys.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Masukkan minimal 1 key!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
        return;
    }
    
    const db = await initDatabase();
    if (!db) return;
    
    const transactionIndex = db.transactions.findIndex(t => t.id === currentTransactionId);
    
    if (transactionIndex !== -1) {
        db.transactions[transactionIndex].status = 'approved';
        db.transactions[transactionIndex].keys = keys;
        await updateDatabase(db);
        
        closePopup('approveTransactionPopup');
        await loadAdminTransactions();
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Transaksi berhasil diapprove!',
            background: 'var(--card-bg)',
            color: 'var(--text)'
        });
    }
}

// Reject transaction
async function rejectTransaction(transactionId) {
    const result = await Swal.fire({
        title: 'Reject Transaksi',
        text: 'Apakah Anda yakin ingin menolak transaksi ini?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--danger)',
        cancelButtonColor: 'var(--primary)',
        confirmButtonText: 'Ya, reject',
        cancelButtonText: 'Batal',
        background: 'var(--card-bg)',
        color: 'var(--text)'
    });
    
    if (result.isConfirmed) {
        const db = await initDatabase();
        if (!db) return;
        
        const transactionIndex = db.transactions.findIndex(t => t.id === transactionId);
        
        if (transactionIndex !== -1) {
            db.transactions[transactionIndex].status = 'rejected';
            await updateDatabase(db);
            
            await loadAdminTransactions();
            
            Swal.fire({
                icon: 'success',
                title: 'Sukses!',
                text: 'Transaksi berhasil direject!',
                background: 'var(--card-bg)',
                color: 'var(--text)'
            });
        }
    }
}

// Close popup
function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', register);
    }
    
    // Check remembered user
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser && document.getElementById('username')) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
});