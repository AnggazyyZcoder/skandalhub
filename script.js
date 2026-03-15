// script.js
// JSONBin.io Configuration
const JSONBIN_API_KEY = '$2a$10$ldwDDS5thsD8qBEdjcNzc..R6XpeQggFqRrl4a6NNv3pQVEfhYbBq'; // Demo key - ganti dengan key Anda
const JSONBIN_BIN_ID = '69b66b19b7ec241ddc6d56c5'; // Demo bin - ganti dengan bin Anda

// Database helper functions
async function fetchDatabase() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.error('Error fetching database:', error);
        return null;
    }
}

async function updateDatabase(data) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating database:', error);
        return null;
    }
}

// Initialize database structure
async function initializeDatabase() {
    let db = await fetchDatabase();
    if (!db) {
        db = {
            users: [
                { username: 'admin', password: 'admin123', credit: 999999, role: 'admin' }
            ],
            products: [],
            promoCodes: [],
            runningText: { text: 'KODE PROMO TERBARU : DISKON70%', enabled: false },
            resetKeyEnabled: true,
            transactions: []
        };
        await updateDatabase(db);
    }
    return db;
}

// Toggle Password Visibility
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
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

// Popup functions
function showPopup(popupId) {
    document.getElementById(popupId).style.display = 'flex';
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
}

// Register functionality
document.addEventListener('DOMContentLoaded', async function() {
    await initializeDatabase();
    
    if (document.getElementById('registerForm')) {
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPass = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPass) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Password tidak cocok!',
                    background: '#140f1e',
                    color: '#fff'
                });
                return;
            }
            
            const db = await fetchDatabase();
            const userExists = db.users.find(u => u.username === username);
            
            if (userExists) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Username sudah digunakan!',
                    background: '#140f1e',
                    color: '#fff'
                });
                return;
            }
            
            db.users.push({
                username: username,
                password: password,
                credit: 0,
                role: 'user'
            });
            
            await updateDatabase(db);
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Akun berhasil dibuat! Silahkan login.',
                background: '#140f1e',
                color: '#fff'
            }).then(() => {
                window.location.href = 'index.html';
            });
        });
    }
});

// Login functionality
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        
        const db = await fetchDatabase();
        const user = db.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Show loading animation
            const btn = document.getElementById('loginBtn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            btn.disabled = true;
            
            // Simulate loading
            setTimeout(() => {
                Swal.fire({
                    icon: 'success',
                    title: `Welcome ${username}!`,
                    text: 'Redirecting to dashboard...',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#140f1e',
                    color: '#fff'
                }).then(() => {
                    localStorage.setItem('currentUser', JSON.stringify({
                        username: username,
                        credit: user.credit,
                        role: user.role || 'user'
                    }));
                    
                    if (rememberMe) {
                        localStorage.setItem('rememberedUser', username);
                    }
                    
                    if (user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'home.html';
                    }
                });
            }, 2000);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: 'Username atau password salah!',
                background: '#140f1e',
                color: '#fff'
            });
        }
    });
}

// Dashboard initialization
async function initDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Load user data
    const db = await fetchDatabase();
    const user = db.users.find(u => u.username === currentUser.username);
    
    document.getElementById('welcomeUser').textContent = user.username;
    document.getElementById('userCredit').textContent = user.credit || 0;
    
    // Load running text
    if (db.runningText && db.runningText.enabled) {
        document.getElementById('runningTextContainer').style.display = 'block';
        document.getElementById('runningTextContent').textContent = db.runningText.text;
    }
    
    // Load products
    loadProducts(db.products);
    
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', function() {
        document.getElementById('navMenu').classList.add('open');
    });
    
    document.getElementById('closeNav').addEventListener('click', function() {
        document.getElementById('navMenu').classList.remove('open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('navMenu');
        const toggle = document.getElementById('menuToggle');
        if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains('open')) {
            menu.classList.remove('open');
        }
    });
}

// Load products
function loadProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.onclick = () => showProductDetail(product);
        
        const features = product.features.split(',').map(f => f.trim());
        const featureTags = features.map(f => `<span class="feature-tag">${f}</span>`).join('');
        
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200/6b21ff/ffffff?text=Drip+Client'">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            <div class="product-features">${featureTags}</div>
            <div class="product-price">Mulai dari $${Math.min(...product.prices.map(p => parseFloat(p.value)))}</div>
        `;
        
        grid.appendChild(card);
    });
}

// Show product detail
let currentProduct = null;
let selectedPrice = null;
let quantity = 1;
let appliedPromo = null;

function showProductDetail(product) {
    currentProduct = product;
    selectedPrice = null;
    quantity = 1;
    appliedPromo = null;
    
    const content = document.getElementById('productDetailContent');
    const priceOptions = product.prices.map((price, index) => `
        <div class="price-option" onclick="selectPrice(${index}, ${price.value})">
            <input type="radio" name="price" id="price${index}" value="${price.value}">
            <label for="price${index}">${price.label} - $${price.value}</label>
        </div>
    `).join('');
    
    content.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price-selection">
            <h4>Pilih Durasi:</h4>
            ${priceOptions}
        </div>
        <div class="quantity-selector">
            <label>Quantity:</label>
            <button onclick="updateQuantity(-1)"><i class="fas fa-minus"></i></button>
            <span id="quantity">1</span>
            <button onclick="updateQuantity(1)"><i class="fas fa-plus"></i></button>
        </div>
        <div class="promo-section">
            <h4>Kode Promo:</h4>
            <div class="promo-input-group">
                <input type="text" id="promoCode" placeholder="Masukkan kode promo">
                <button onclick="applyPromo()">Apply</button>
            </div>
            <div id="promoMessage" class="promo-message"></div>
        </div>
        <div class="total-price">
            Total: $<span id="totalPrice">0</span>
        </div>
        <div class="whatsapp-input">
            <h4>Nomor Whatsapp:</h4>
            <input type="text" id="waNumber" placeholder="628xxxxxxxxxx">
        </div>
        <button class="buy-btn" onclick="processPurchase()">Buy Now</button>
    `;
    
    showPopup('productDetailPopup');
}

function selectPrice(index, value) {
    selectedPrice = value;
    updateTotal();
}

function updateQuantity(change) {
    quantity = Math.max(1, quantity + change);
    document.getElementById('quantity').textContent = quantity;
    updateTotal();
}

async function applyPromo() {
    const code = document.getElementById('promoCode').value.toUpperCase();
    const messageDiv = document.getElementById('promoMessage');
    
    if (!code) {
        messageDiv.innerHTML = '<span class="error">Masukkan kode promo</span>';
        return;
    }
    
    const db = await fetchDatabase();
    const promo = db.promoCodes.find(p => p.code === code);
    
    if (!promo) {
        messageDiv.innerHTML = '<span class="error">Kode promo tidak valid!</span>';
        appliedPromo = null;
    } else if (promo.used >= promo.max) {
        messageDiv.innerHTML = '<span class="error">Kode promo sudah mencapai batas pemakaian!</span>';
        appliedPromo = null;
    } else {
        messageDiv.innerHTML = `<span class="success">Promo berhasil! Diskon ${promo.percent}%</span>`;
        appliedPromo = promo;
    }
    
    updateTotal();
}

function updateTotal() {
    if (!selectedPrice) return;
    
    let total = selectedPrice * quantity;
    
    if (appliedPromo) {
        total = total * (1 - appliedPromo.percent / 100);
    }
    
    document.getElementById('totalPrice').textContent = total.toFixed(2);
}

async function processPurchase() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const waNumber = document.getElementById('waNumber').value;
    
    if (!selectedPrice) {
        Swal.fire('Pilih durasi terlebih dahulu!', '', 'warning');
        return;
    }
    
    if (!waNumber) {
        Swal.fire('Masukkan nomor Whatsapp!', '', 'warning');
        return;
    }
    
    const total = parseFloat(document.getElementById('totalPrice').textContent);
    
    const db = await fetchDatabase();
    const user = db.users.find(u => u.username === currentUser.username);
    
    if (user.credit < total) {
        Swal.fire({
            icon: 'error',
            title: 'Saldo Tidak Cukup',
            text: `Saldo Anda: $${user.credit}, Dibutuhkan: $${total}`,
            background: '#140f1e',
            color: '#fff'
        });
        return;
    }
    
    // Create transaction
    const transaction = {
        id: 'TRX' + Date.now() + Math.random().toString(36).substr(2, 9),
        username: currentUser.username,
        product: currentProduct.name,
        price: selectedPrice,
        quantity: quantity,
        total: total,
        waNumber: waNumber,
        promo: appliedPromo ? appliedPromo.code : null,
        status: 'waiting',
        date: new Date().toISOString(),
        keys: []
    };
    
    db.transactions.push(transaction);
    
    // Reduce user credit
    user.credit -= total;
    
    // Update promo usage if applied
    if (appliedPromo) {
        const promoIndex = db.promoCodes.findIndex(p => p.code === appliedPromo.code);
        if (promoIndex !== -1) {
            db.promoCodes[promoIndex].used = (db.promoCodes[promoIndex].used || 0) + 1;
        }
    }
    
    await updateDatabase(db);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    Swal.fire({
        icon: 'success',
        title: 'Pembelian Berhasil!',
        text: 'Transaksi sedang diproses. ID Transaksi: ' + transaction.id,
        background: '#140f1e',
        color: '#fff'
    }).then(() => {
        closePopup('productDetailPopup');
        document.getElementById('userCredit').textContent = user.credit;
    });
}

// Reset Key functionality
async function processResetKey() {
    const keyInput = document.getElementById('resetKeyInput').value;
    const responseDiv = document.getElementById('resetResponse');
    const btn = document.getElementById('resetKeyBtn');
    
    if (!keyInput) {
        responseDiv.innerHTML = '<span class="error">Masukkan key!</span>';
        return;
    }
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching Server.....';
    btn.disabled = true;
    
    setTimeout(async () => {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Respone Database.....';
        
        setTimeout(async () => {
            const db = await fetchDatabase();
            
            if (!db.resetKeyEnabled) {
                responseDiv.innerHTML = `
                    <div class="error-response">
                        <i class="fas fa-exclamation-triangle"></i>
                        Maaf fitur ini sedang di nonaktifkan oleh admin atau sedang tidak beroperasi normal, Silahkan coba lagi nanti.
                    </div>
                `;
            } else {
                // Generate random 12 digit key
                const newKey = Math.floor(100000000000 + Math.random() * 900000000000);
                
                responseDiv.innerHTML = `
                    <div class="success-response">
                        <i class="fas fa-check-circle"></i>
                        <h4>✅ Reset Successful</h4>
                        <pre>
Status: 200
Response: {
    "success": true,
    "message": "Token reset successfully",
    "resetsused": 1,
    "resetsmax": 2,
    "nextresettime": "${new Date(Date.now() + 86400000).toISOString().split('T')[0]} 08:06:15"
}

🔑 New Key: ${newKey}
                        </pre>
                    </div>
                `;
            }
            
            btn.innerHTML = '<span>Reset</span><i class="fas fa-sync-alt"></i>';
            btn.disabled = false;
        }, 2000);
    }, 2000);
}

// Show logs popup
async function showLogsPopup() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const db = await fetchDatabase();
    const userLogs = db.transactions.filter(t => t.username === currentUser.username);
    
    const container = document.getElementById('logsContainer');
    
    if (userLogs.length === 0) {
        container.innerHTML = '<p class="no-logs">Belum ada transaksi</p>';
    } else {
        container.innerHTML = userLogs.map(log => `
            <div class="log-item">
                <div class="log-header">
                    <span class="log-id">${log.id}</span>
                    <span class="log-status status-${log.status}">${log.status}</span>
                </div>
                <div class="log-body">
                    <p><strong>Produk:</strong> ${log.product}</p>
                    <p><strong>Total:</strong> $${log.total}</p>
                    <p><strong>Tanggal:</strong> ${new Date(log.date).toLocaleString('id-ID')}</p>
                    ${log.keys && log.keys.length > 0 ? `
                        <div class="log-keys">
                            <strong>Keys:</strong><br>
                            ${log.keys.map(k => k).join('<br>')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
    
    showPopup('logsPopup');
}

// Show reset key popup
function showResetKeyPopup() {
    showPopup('resetKeyPopup');
}

// Show FAQ popup
function showFAQPopup() {
    showPopup('faqPopup');
}

// Logout
function logout() {
    Swal.fire({
        title: 'Logout?',
        text: 'Apakah Anda yakin ingin logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6b21ff',
        cancelButtonColor: '#ff3b5c',
        confirmButtonText: 'Ya, Logout',
        background: '#140f1e',
        color: '#fff'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }
    });
}

// Admin Panel Functions
async function initAdminDashboard() {
    // Load initial data
    await loadAdminData();
    
    // Menu toggle
    document.getElementById('adminMenuToggle').addEventListener('click', function() {
        document.getElementById('adminMenu').classList.add('open');
    });
    
    document.getElementById('closeAdminMenu').addEventListener('click', function() {
        document.getElementById('adminMenu').classList.remove('open');
    });
    
    // Load running text toggle state
    const db = await fetchDatabase();
    document.getElementById('runningToggle').checked = db.runningText?.enabled || false;
    document.getElementById('runningText').value = db.runningText?.text || '';
    document.getElementById('resetKeyToggle').checked = db.resetKeyEnabled || false;
}

function showAdminSection(section) {
    // Update menu active state
    document.querySelectorAll('.admin-menu-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Show section
    document.querySelectorAll('.admin-section').forEach(s => {
        s.classList.remove('active');
    });
    document.getElementById(section + '-section').classList.add('active');
}

async function loadAdminData() {
    const db = await fetchDatabase();
    
    // Load products
    const productsList = document.getElementById('productsList');
    if (productsList) {
        productsList.innerHTML = db.products.map(product => `
            <div class="admin-item">
                <div class="item-info">
                    <img src="${product.image}" alt="${product.name}" width="50">
                    <div>
                        <h4>${product.name}</h4>
                        <p>${product.description}</p>
                    </div>
                </div>
                <div class="item-actions">
                    <button onclick="editProduct('${product.id}')" class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProduct('${product.id}')" class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    
    // Load promos
    const promosList = document.getElementById('promosList');
    if (promosList) {
        promosList.innerHTML = db.promoCodes.map(promo => `
            <div class="admin-item">
                <div>
                    <h4>${promo.code}</h4>
                    <p>Diskon: ${promo.percent}% | Used: ${promo.used || 0}/${promo.max}</p>
                </div>
                <div class="item-actions">
                    <button onclick="deletePromo('${promo.code}')" class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    }
    
    // Load logs
    const logsList = document.getElementById('adminLogsList');
    if (logsList) {
        logsList.innerHTML = db.transactions.map(log => `
            <div class="log-item">
                <div class="log-header">
                    <span class="log-id">${log.id}</span>
                    <span class="log-status status-${log.status}">${log.status}</span>
                </div>
                <div class="log-body">
                    <p><strong>User:</strong> ${log.username}</p>
                    <p><strong>Produk:</strong> ${log.product}</p>
                    <p><strong>Total:</strong> $${log.total}</p>
                    <p><strong>WA:</strong> ${log.waNumber}</p>
                    <p><strong>Tanggal:</strong> ${new Date(log.date).toLocaleString('id-ID')}</p>
                    ${log.keys && log.keys.length > 0 ? `
                        <div class="log-keys">
                            <strong>Keys:</strong><br>
                            ${log.keys.map(k => k).join('<br>')}
                        </div>
                    ` : ''}
                </div>
                ${log.status === 'waiting' ? `
                    <div class="log-actions">
                        <button class="approve-btn" onclick="approveTransaction('${log.id}')"><i class="fas fa-check"></i> Approve</button>
                        <button class="reject-btn" onclick="rejectTransaction('${log.id}')"><i class="fas fa-times"></i> Reject</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
}

async function addProduct() {
    const name = document.getElementById('productName').value;
    const image = document.getElementById('productImage').value;
    const desc = document.getElementById('productDesc').value;
    const features = document.getElementById('productFeatures').value;
    
    // Get price rows
    const priceRows = document.querySelectorAll('.price-row');
    const prices = [];
    priceRows.forEach(row => {
        const label = row.querySelector('.price-label').value;
        const value = row.querySelector('.price-value').value;
        if (label && value) {
            prices.push({ label, value: parseFloat(value) });
        }
    });
    
    if (!name || !image || !desc || !features || prices.length === 0) {
        Swal.fire('Lengkapi semua field!', '', 'warning');
        return;
    }
    
    const db = await fetchDatabase();
    const newProduct = {
        id: 'PROD' + Date.now(),
        name,
        image,
        description: desc,
        features,
        prices
    };
    
    db.products.push(newProduct);
    await updateDatabase(db);
    
    Swal.fire('Berhasil!', 'Produk ditambahkan', 'success');
    await loadAdminData();
}

function addPriceRow() {
    const container = document.getElementById('priceInputs');
    const row = document.createElement('div');
    row.className = 'price-row';
    row.innerHTML = `
        <input type="text" placeholder="Label (1 DAYS)" class="price-label">
        <input type="number" placeholder="Harga ($)" class="price-value">
        <button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
    `;
    container.appendChild(row);
}

async function addPromoCode() {
    const code = document.getElementById('promoCode').value.toUpperCase();
    const percent = parseInt(document.getElementById('promoPercent').value);
    const max = parseInt(document.getElementById('promoMax').value);
    
    if (!code || !percent || !max) {
        Swal.fire('Lengkapi semua field!', '', 'warning');
        return;
    }
    
    const db = await fetchDatabase();
    
    if (db.promoCodes.find(p => p.code === code)) {
        Swal.fire('Kode promo sudah ada!', '', 'error');
        return;
    }
    
    db.promoCodes.push({
        code,
        percent,
        max,
        used: 0
    });
    
    await updateDatabase(db);
    
    Swal.fire('Berhasil!', 'Kode promo ditambahkan', 'success');
    await loadAdminData();
}

async function toggleRunningText() {
    const enabled = document.getElementById('runningToggle').checked;
    const text = document.getElementById('runningText').value;
    
    const db = await fetchDatabase();
    db.runningText = { text, enabled };
    await updateDatabase(db);
}

async function saveRunningText() {
    await toggleRunningText();
    Swal.fire('Berhasil!', 'Running text disimpan', 'success');
}

async function toggleResetKey() {
    const enabled = document.getElementById('resetKeyToggle').checked;
    
    const db = await fetchDatabase();
    db.resetKeyEnabled = enabled;
    await updateDatabase(db);
}

async function addCredit() {
    const username = document.getElementById('creditUsername').value;
    const amount = parseFloat(document.getElementById('creditAmount').value);
    
    if (!username || !amount) {
        Swal.fire('Lengkapi semua field!', '', 'warning');
        return;
    }
    
    const db = await fetchDatabase();
    const user = db.users.find(u => u.username === username);
    
    if (!user) {
        Swal.fire('User tidak ditemukan!', '', 'error');
        return;
    }
    
    user.credit = (user.credit || 0) + amount;
    await updateDatabase(db);
    
    Swal.fire('Berhasil!', `Saldo ${username} sekarang $${user.credit}`, 'success');
    
    // Clear inputs
    document.getElementById('creditUsername').value = '';
    document.getElementById('creditAmount').value = '';
}

let currentTransactionId = null;

function approveTransaction(id) {
    currentTransactionId = id;
    showPopup('approvePopup');
}

async function submitApprove() {
    const keys = document.getElementById('approveKeys').value.split(',').map(k => k.trim());
    
    if (keys.length === 0) {
        Swal.fire('Masukkan minimal 1 key!', '', 'warning');
        return;
    }
    
    const db = await fetchDatabase();
    const transaction = db.transactions.find(t => t.id === currentTransactionId);
    
    if (transaction) {
        transaction.status = 'approved';
        transaction.keys = keys;
        await updateDatabase(db);
        
        Swal.fire('Berhasil!', 'Transaksi di-approve', 'success');
        closePopup('approvePopup');
        document.getElementById('approveKeys').value = '';
        await loadAdminData();
    }
}

async function rejectTransaction(id) {
    const db = await fetchDatabase();
    const transaction = db.transactions.find(t => t.id === id);
    
    if (transaction) {
        transaction.status = 'rejected';
        await updateDatabase(db);
        
        Swal.fire('Transaksi di-reject', '', 'info');
        await loadAdminData();
    }
}

// Animation on scroll
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });
    
    document.querySelectorAll('.product-card, .admin-section, .log-item').forEach(el => {
        observer.observe(el);
    });
});