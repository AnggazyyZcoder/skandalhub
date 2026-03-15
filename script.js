// JSONBin.io Configuration
const JSONBIN_API_KEY = '$2a$10$ldwDDS5thsD8qBEdjcNzc..R6XpeQggFqRrl4a6NNv3pQVEfhYbBq'; // Ganti dengan API Key Anda
const JSONBIN_BIN_ID = '69b66b19b7ec241ddc6d56c5'; // Ganti dengan Bin ID Anda
const BASE_URL = 'https://api.jsonbin.io/v3';

// Database Structure
const defaultDB = {
    users: [
        { username: 'admin', password: 'admin123', credit: 999999, logs: [], resetKeyUsed: 0, resetKeyLastUsed: null }
    ],
    products: [
        {
            id: 'prod1',
            name: 'DRIP CLIENT',
            image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=DRIP+CLIENT',
            description: 'Cheat android with full features',
            fitur: ['Anti Ban', 'Silent Aim', 'ESP', 'Wallhack'],
            prices: [
                { name: '1 Days', price: 1 },
                { name: '3 Days', price: 10 },
                { name: '7 Days', price: 7 },
                { name: '15 Days', price: 15 },
                { name: '1 Bulan', price: 30 }
            ]
        }
    ],
    promos: [
        { code: 'DISKON70', percent: 70, maxUses: 10, used: 0 }
    ],
    settings: {
        runningTeks: {
            text: 'KODE PROMO TERBARU : DISKON70%',
            enabled: true
        },
        resetKeyEnabled: true
    },
    transactions: [],
    logs: []
};

// Initialize Database
async function initDB() {
    try {
        const response = await fetch(`${BASE_URL}/b/${JSONBIN_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        
        if (!response.ok) {
            await createBin();
        }
    } catch (error) {
        console.log('Creating new bin...');
        await createBin();
    }
}

async function createBin() {
    try {
        const response = await fetch(`${BASE_URL}/b`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(defaultDB)
        });
        
        const data = await response.json();
        JSONBIN_BIN_ID = data.metadata.id;
        console.log('Bin created with ID:', JSONBIN_BIN_ID);
    } catch (error) {
        console.error('Error creating bin:', error);
    }
}

async function getDB() {
    try {
        const response = await fetch(`${BASE_URL}/b/${JSONBIN_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.error('Error getting DB:', error);
        return defaultDB;
    }
}

async function updateDB(data) {
    try {
        await fetch(`${BASE_URL}/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error('Error updating DB:', error);
    }
}

// Toggle Password
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

// Login Handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        // Show loading animation
        Swal.fire({
            title: 'Memproses...',
            text: 'Mohon tunggu',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });
        
        try {
            const db = await getDB();
            const user = db.users.find(u => u.username === username && u.password === password);
            
            setTimeout(() => {
                if (user) {
                    // Save session
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    
                    if (document.getElementById('rememberMe').checked) {
                        localStorage.setItem('rememberedUser', username);
                    }
                    
                    Swal.fire({
                        icon: 'success',
                        title: `Welcome ${username}!`,
                        text: 'Login berhasil, mengarahkan ke dashboard...',
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        window.location.href = 'home.html';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Gagal',
                        text: 'Username atau password salah!',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }, 2000);
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Terjadi kesalahan!'
            });
        }
    });
}

// Register Handler
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Password tidak cocok!'
            });
            return;
        }
        
        Swal.fire({
            title: 'Membuat akun...',
            text: 'Mohon tunggu',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });
        
        try {
            const db = await getDB();
            
            if (db.users.some(u => u.username === username)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Username sudah digunakan!'
                });
                return;
            }
            
            db.users.push({
                username: username,
                password: password,
                credit: 0,
                logs: [],
                resetKeyUsed: 0,
                resetKeyLastUsed: null
            });
            
            await updateDB(db);
            
            Swal.fire({
                icon: 'success',
                title: 'Sukses!',
                text: 'Akun berhasil dibuat, silahkan login!',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                window.location.href = 'index.html';
            });
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal membuat akun!'
            });
        }
    });
}

// Dashboard Functions
function initDashboard() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('usernameDisplay').textContent = user.username;
    document.getElementById('userCredit').textContent = user.credit;
    
    loadProducts();
    loadRunningTeks();
    initSidebar();
}

function initSidebar() {
    const hamburger = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('closeSidebar');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.add('open');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });
    }
}

async function loadProducts() {
    try {
        const db = await getDB();
        const grid = document.getElementById('productsGrid');
        
        if (!grid) return;
        
        grid.innerHTML = '';
        
        db.products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('onclick', `openPurchaseModal('${product.id}')`);
            
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <p class="product-features">${product.fitur.join(' • ')}</p>
                <p class="product-price">Mulai dari $${Math.min(...product.prices.map(p => p.price))}</p>
            `;
            
            grid.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadRunningTeks() {
    try {
        const db = await getDB();
        const teksElement = document.getElementById('runningTeks');
        
        if (db.settings.runningTeks.enabled && teksElement) {
            teksElement.innerHTML = `<marquee>${db.settings.runningTeks.text}</marquee>`;
            teksElement.style.display = 'block';
        } else if (teksElement) {
            teksElement.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading running teks:', error);
    }
}

// Reset Key Functions
let currentResetKeyModal = null;

function openResetKeyModal() {
    const modal = document.getElementById('resetKeyModal');
    modal.classList.add('show');
    currentResetKeyModal = modal;
}

async function processResetKey() {
    const input = document.getElementById('resetInput').value;
    const loadingEl = document.getElementById('resetLoading');
    const responseEl = document.getElementById('resetResponse');
    
    if (!input) {
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan',
            text: 'Masukkan key terlebih dahulu!'
        });
        return;
    }
    
    loadingEl.innerHTML = '<div class="loader-progress" style="width:100%"><div class="progress-bar" style="animation: progress 2s"></div></div>';
    responseEl.innerHTML = '';
    
    try {
        const db = await getDB();
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        
        // Check if reset key is enabled
        if (!db.settings.resetKeyEnabled) {
            setTimeout(() => {
                loadingEl.innerHTML = '';
                responseEl.innerHTML = `
                    <div style="color: #ff6b6b; padding: 20px; text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>Maaf fitur ini sedang di nonaktifkan oleh admin atau sedang tidak beroperasi normal, Silahkan coba lagi nanti.</p>
                    </div>
                `;
            }, 2000);
            return;
        }
        
        // Check reset limit (1 per day)
        const lastReset = new Date(user.resetKeyLastUsed);
        const today = new Date();
        const isSameDay = lastReset.toDateString() === today.toDateString();
        
        if (isSameDay && user.resetKeyUsed >= 1) {
            setTimeout(() => {
                loadingEl.innerHTML = '';
                responseEl.innerHTML = `
                    <div style="color: #ff6b6b; padding: 20px; text-align: center;">
                        <i class="fas fa-clock" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>Reset key sudah mencapai batas hari ini. Silahkan coba lagi besok.</p>
                    </div>
                `;
            }, 3000);
            return;
        }
        
        // Simulate processing
        setTimeout(async () => {
            loadingEl.innerHTML = '';
            
            // Generate random 12-digit key
            const newKey = Math.floor(100000000000 + Math.random() * 900000000000);
            
            // Update user reset data
            user.resetKeyUsed = isSameDay ? user.resetKeyUsed + 1 : 1;
            user.resetKeyLastUsed = new Date().toISOString();
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            
            // Update database
            const userIndex = db.users.findIndex(u => u.username === user.username);
            if (userIndex !== -1) {
                db.users[userIndex] = user;
                await updateDB(db);
            }
            
            responseEl.innerHTML = `
                <div style="color: #28a745; padding: 20px; text-align: left; background: rgba(40, 167, 69, 0.1); border-radius: 15px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                        <i class="fas fa-check-circle" style="font-size: 2rem; color: #28a745;"></i>
                        <h3 style="color: #28a745;">✅ Reset Successful</h3>
                    </div>
                    <p><strong>Status:</strong> 200</p>
                    <p><strong>Response:</strong></p>
                    <pre style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; overflow-x: auto;">
{
    "success": true,
    "message": "Token reset successfully",
    "resetsused": ${user.resetKeyUsed},
    "resetsmax": 1,
    "nextresettime": "${new Date(Date.now() + 86400000).toISOString().split('T')[0]}"
}
                    </pre>
                    <p style="margin-top: 15px; font-size: 1.2rem;"><strong>New Key: ${newKey}</strong></p>
                </div>
            `;
        }, 4000);
        
    } catch (error) {
        loadingEl.innerHTML = '';
        responseEl.innerHTML = `
            <div style="color: #ff6b6b; padding: 20px; text-align: center;">
                <i class="fas fa-times-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
                <p>Terjadi kesalahan! Silahkan coba lagi.</p>
            </div>
        `;
    }
}

// Purchase Functions
let currentProduct = null;
let selectedPrice = null;
let currentQuantity = 1;
let appliedPromo = null;

function openPurchaseModal(productId) {
    const modal = document.getElementById('purchaseModal');
    getDB().then(db => {
        currentProduct = db.products.find(p => p.id === productId);
        
        const detailsEl = document.getElementById('purchaseProductDetails');
        detailsEl.innerHTML = `
            <h2>${currentProduct.name}</h2>
            <img src="${currentProduct.image}" style="width: 100%; border-radius: 15px; margin: 15px 0;">
            <p>${currentProduct.description}</p>
            <p style="color: #8b5cf6;">${currentProduct.fitur.join(' • ')}</p>
        `;
        
        const priceOptionsEl = document.getElementById('priceOptions');
        priceOptionsEl.innerHTML = '';
        currentProduct.prices.forEach((price, index) => {
            const btn = document.createElement('button');
            btn.className = 'price-option';
            btn.innerHTML = `${price.name} - $${price.price}`;
            btn.onclick = () => selectPrice(index);
            priceOptionsEl.appendChild(btn);
        });
        
        selectPrice(0);
        updateTotalPrice();
        
        modal.classList.add('show');
    });
}

function selectPrice(index) {
    selectedPrice = currentProduct.prices[index];
    document.querySelectorAll('.price-option').forEach((btn, i) => {
        if (i === index) {
            btn.style.background = 'linear-gradient(135deg, #8b5cf6, #a855f7)';
        } else {
            btn.style.background = 'rgba(139, 92, 246, 0.1)';
        }
    });
    updateTotalPrice();
}

function updateQuantity(change) {
    currentQuantity = Math.max(1, currentQuantity + change);
    document.getElementById('quantity').textContent = currentQuantity;
    updateTotalPrice();
}

async function updateTotalPrice() {
    if (!selectedPrice) return;
    
    let total = selectedPrice.price * currentQuantity;
    
    // Apply promo if any
    if (appliedPromo) {
        total = total - (total * appliedPromo.percent / 100);
    }
    
    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
    
    // Check promo code
    const promoInput = document.getElementById('promoCode');
    if (promoInput) {
        promoInput.addEventListener('input', debounce(async () => {
            const code = promoInput.value.toUpperCase();
            const messageEl = document.getElementById('promoMessage');
            
            if (code.length < 3) {
                messageEl.textContent = '';
                appliedPromo = null;
                updateTotalPrice();
                return;
            }
            
            const db = await getDB();
            const promo = db.promos.find(p => p.code === code);
            
            if (promo && promo.used < promo.maxUses) {
                messageEl.innerHTML = `<span style="color: #28a745;">✓ Promo valid! Diskon ${promo.percent}%</span>`;
                appliedPromo = promo;
            } else if (promo && promo.used >= promo.maxUses) {
                messageEl.innerHTML = `<span style="color: #dc3545;">✗ Promo sudah mencapai batas penggunaan!</span>`;
                appliedPromo = null;
            } else {
                messageEl.innerHTML = `<span style="color: #dc3545;">✗ Kode promo tidak valid!</span>`;
                appliedPromo = null;
            }
            
            updateTotalPrice();
        }, 500));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function processPurchase() {
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    const whatsapp = document.getElementById('whatsappNumber').value;
    
    if (!whatsapp) {
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan',
            text: 'Masukkan nomor WhatsApp terlebih dahulu!'
        });
        return;
    }
    
    let total = selectedPrice.price * currentQuantity;
    if (appliedPromo) {
        total = total - (total * appliedPromo.percent / 100);
    }
    
    if (user.credit < total) {
        Swal.fire({
            icon: 'error',
            title: 'Saldo Tidak Cukup',
            text: `Saldo Anda: $${user.credit}, Dibutuhkan: $${total.toFixed(2)}`
        });
        return;
    }
    
    Swal.fire({
        title: 'Memproses Pembelian...',
        text: 'Mohon tunggu',
        allowOutsideClick: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        const db = await getDB();
        
        // Update user credit
        user.credit -= total;
        const userIndex = db.users.findIndex(u => u.username === user.username);
        db.users[userIndex].credit = user.credit;
        
        // Create transaction
        const transaction = {
            id: 'TRX' + Date.now() + Math.random().toString(36).substr(2, 9),
            userId: user.username,
            product: currentProduct.name,
            option: selectedPrice.name,
            quantity: currentQuantity,
            price: total,
            promo: appliedPromo ? appliedPromo.code : null,
            whatsapp: whatsapp,
            date: new Date().toISOString(),
            status: 'waiting',
            keys: []
        };
        
        db.transactions.push(transaction);
        
        // Update promo usage
        if (appliedPromo) {
            const promoIndex = db.promos.findIndex(p => p.code === appliedPromo.code);
            db.promos[promoIndex].used++;
        }
        
        await updateDB(db);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        Swal.fire({
            icon: 'success',
            title: 'Pembelian Berhasil!',
            text: `Pembelian Anda sedang diproses. ID Transaksi: ${transaction.id}`,
            confirmButtonColor: '#8b5cf6'
        });
        
        // Close modal
        document.getElementById('purchaseModal').classList.remove('show');
        
        // Update credit display
        document.getElementById('userCredit').textContent = user.credit;
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal memproses pembelian!'
        });
    }
}

// Logs Functions
async function openLogsModal() {
    const modal = document.getElementById('logsModal');
    const user = JSON.parse(sessionStorage.getItem('currentUser'));
    
    try {
        const db = await getDB();
        const userTransactions = db.transactions.filter(t => t.userId === user.username);
        
        const logsContainer = document.getElementById('logsContainer');
        logsContainer.innerHTML = '';
        
        if (userTransactions.length === 0) {
            logsContainer.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">Belum ada transaksi</p>';
        } else {
            userTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            userTransactions.forEach(trx => {
                const statusClass = trx.status === 'approved' ? 'status-approved' : 
                                  trx.status === 'rejected' ? 'status-rejected' : 'status-waiting';
                
                const trxEl = document.createElement('div');
                trxEl.className = 'transaction-item';
                trxEl.innerHTML = `
                    <div class="transaction-header">
                        <span class="transaction-id">${trx.id}</span>
                        <span class="transaction-status ${statusClass}">${trx.status.toUpperCase()}</span>
                    </div>
                    <div class="transaction-details">
                        <p><strong>Produk:</strong> ${trx.product}</p>
                        <p><strong>Paket:</strong> ${trx.option}</p>
                        <p><strong>Quantity:</strong> ${trx.quantity}</p>
                        <p><strong>Total:</strong> $${trx.price.toFixed(2)}</p>
                        <p><strong>Tanggal:</strong> ${new Date(trx.date).toLocaleString()}</p>
                        ${trx.keys && trx.keys.length ? `<p><strong>Keys:</strong> ${trx.keys.join(', ')}</p>` : ''}
                    </div>
                `;
                
                logsContainer.appendChild(trxEl);
            });
        }
        
        modal.classList.add('show');
    } catch (error) {
        console.error('Error loading logs:', error);
    }
}

// FAQ Functions
function openFAQModal() {
    const modal = document.getElementById('faqModal');
    modal.classList.add('show');
    
    // Add FAQ interactions
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');
            
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// Close Modals
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-modal') || e.target.closest('.close-modal')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Admin Panel Functions
function initAdminPanel() {
    loadAdminProducts();
    loadAdminTransactions();
    loadAdminSettings();
}

async function loadAdminProducts() {
    try {
        const db = await getDB();
        const listEl = document.getElementById('adminProductsList');
        
        if (!listEl) return;
        
        listEl.innerHTML = '';
        
        db.products.forEach((product, index) => {
            const productEl = document.createElement('div');
            productEl.className = 'admin-product-item';
            productEl.style.cssText = `
                background: rgba(255,255,255,0.05);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 15px;
            `;
            
            productEl.innerHTML = `
                <div style="display: flex; gap: 20px; align-items: start;">
                    <img src="${product.image}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
                    <div style="flex: 1;">
                        <input type="text" id="editName_${index}" value="${product.name}" class="form-control" style="margin-bottom: 10px;">
                        <textarea id="editDesc_${index}" class="form-control" style="margin-bottom: 10px;">${product.description}</textarea>
                        <input type="text" id="editFitur_${index}" value="${product.fitur.join(',')}" class="form-control" style="margin-bottom: 10px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap: 10px; margin-bottom: 10px;">
                            ${product.prices.map((price, i) => `
                                <div>
                                    <input type="text" id="editPriceName_${index}_${i}" value="${price.name}" placeholder="Nama">
                                    <input type="number" id="editPriceValue_${index}_${i}" value="${price.price}" placeholder="Harga">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="updateProduct('${product.id}', ${index})" class="admin-btn" style="padding: 10px;">Save</button>
                        <button onclick="deleteProduct('${product.id}')" class="admin-btn" style="background: #dc3545; padding: 10px;">Delete</button>
                    </div>
                </div>
            `;
            
            listEl.appendChild(productEl);
        });
        
    } catch (error) {
        console.error('Error loading admin products:', error);
    }
}

async function updateProduct(productId, index) {
    const name = document.getElementById(`editName_${index}`).value;
    const desc = document.getElementById(`editDesc_${index}`).value;
    const fitur = document.getElementById(`editFitur_${index}`).value.split(',').map(f => f.trim());
    
    const prices = [];
    let i = 0;
    while (document.getElementById(`editPriceName_${index}_${i}`)) {
        const priceName = document.getElementById(`editPriceName_${index}_${i}`).value;
        const priceValue = parseFloat(document.getElementById(`editPriceValue_${index}_${i}`).value);
        if (priceName && priceValue) {
            prices.push({ name: priceName, price: priceValue });
        }
        i++;
    }
    
    try {
        const db = await getDB();
        const productIndex = db.products.findIndex(p => p.id === productId);
        
        db.products[productIndex] = {
            ...db.products[productIndex],
            name,
            description: desc,
            fitur,
            prices
        };
        
        await updateDB(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Produk berhasil diupdate',
            timer: 1500,
            showConfirmButton: false
        });
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal mengupdate produk!'
        });
    }
}

async function deleteProduct(productId) {
    const confirm = await Swal.fire({
        title: 'Yakin ingin menghapus?',
        text: 'Produk akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    });
    
    if (confirm.isConfirmed) {
        try {
            const db = await getDB();
            db.products = db.products.filter(p => p.id !== productId);
            await updateDB(db);
            
            loadAdminProducts();
            
            Swal.fire({
                icon: 'success',
                title: 'Terhapus!',
                text: 'Produk berhasil dihapus',
                timer: 1500,
                showConfirmButton: false
            });
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal menghapus produk!'
            });
        }
    }
}

async function addProduct() {
    const name = document.getElementById('productName').value;
    const image = document.getElementById('productImage').value;
    const desc = document.getElementById('productDesc').value;
    const fitur = document.getElementById('productFitur').value.split(',').map(f => f.trim());
    
    const prices = [
        { name: document.getElementById('priceOptions1').value.split('=')[0], price: parseFloat(document.getElementById('priceOptions1').value.split('=')[1]) },
        { name: document.getElementById('priceOptions2').value.split('=')[0], price: parseFloat(document.getElementById('priceOptions2').value.split('=')[1]) },
        { name: document.getElementById('priceOptions3').value.split('=')[0], price: parseFloat(document.getElementById('priceOptions3').value.split('=')[1]) }
    ].filter(p => p.name && !isNaN(p.price));
    
    if (!name || !image || !desc || prices.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan',
            text: 'Semua field harus diisi!'
        });
        return;
    }
    
    try {
        const db = await getDB();
        
        const newProduct = {
            id: 'prod' + Date.now(),
            name,
            image,
            description: desc,
            fitur,
            prices
        };
        
        db.products.push(newProduct);
        await updateDB(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Produk berhasil ditambahkan',
            timer: 1500,
            showConfirmButton: false
        });
        
        // Clear form
        document.getElementById('productName').value = '';
        document.getElementById('productImage').value = '';
        document.getElementById('productDesc').value = '';
        document.getElementById('productFitur').value = '';
        document.getElementById('priceOptions1').value = '';
        document.getElementById('priceOptions2').value = '';
        document.getElementById('priceOptions3').value = '';
        
        loadAdminProducts();
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal menambah produk!'
        });
    }
}

async function addPromo() {
    const code = document.getElementById('promoCode').value.toUpperCase();
    const percent = parseInt(document.getElementById('promoPercent').value);
    const maxUses = parseInt(document.getElementById('promoMax').value);
    
    if (!code || !percent || !maxUses) {
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan',
            text: 'Semua field harus diisi!'
        });
        return;
    }
    
    try {
        const db = await getDB();
        
        db.promos.push({
            code,
            percent,
            maxUses,
            used: 0
        });
        
        await updateDB(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Promo berhasil ditambahkan',
            timer: 1500,
            showConfirmButton: false
        });
        
        // Clear form
        document.getElementById('promoCode').value = '';
        document.getElementById('promoPercent').value = '';
        document.getElementById('promoMax').value = '';
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal menambah promo!'
        });
    }
}

async function saveRunningTeks() {
    const text = document.getElementById('runningTeks').value;
    const enabled = document.getElementById('runningTeksToggle').checked;
    
    try {
        const db = await getDB();
        
        db.settings.runningTeks = {
            text,
            enabled
        };
        
        await updateDB(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Running teks berhasil disimpan',
            timer: 1500,
            showConfirmButton: false
        });
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal menyimpan running teks!'
        });
    }
}

async function transferSaldo() {
    const username = document.getElementById('saldoUsername').value;
    const amount = parseFloat(document.getElementById('saldoAmount').value);
    
    if (!username || !amount) {
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan',
            text: 'Semua field harus diisi!'
        });
        return;
    }
    
    try {
        const db = await getDB();
        const userIndex = db.users.findIndex(u => u.username === username);
        
        if (userIndex === -1) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Username tidak ditemukan!'
            });
            return;
        }
        
        db.users[userIndex].credit += amount;
        await updateDB(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: `Saldo berhasil ditambahkan ke ${username}`,
            timer: 1500,
            showConfirmButton: false
        });
        
        // Clear form
        document.getElementById('saldoUsername').value = '';
        document.getElementById('saldoAmount').value = '';
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal transfer saldo!'
        });
    }
}

async function saveResetKeySetting() {
    const enabled = document.getElementById('resetKeyToggle').checked;
    
    try {
        const db = await getDB();
        
        db.settings.resetKeyEnabled = enabled;
        await updateDB(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Setting reset key berhasil disimpan',
            timer: 1500,
            showConfirmButton: false
        });
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal menyimpan setting!'
        });
    }
}

async function loadAdminSettings() {
    try {
        const db = await getDB();
        
        // Load running teks settings
        const runningTeksToggle = document.getElementById('runningTeksToggle');
        const runningTeksInput = document.getElementById('runningTeks');
        
        if (runningTeksToggle && runningTeksInput) {
            runningTeksToggle.checked = db.settings.runningTeks.enabled;
            runningTeksInput.value = db.settings.runningTeks.text;
        }
        
        // Load reset key settings
        const resetKeyToggle = document.getElementById('resetKeyToggle');
        if (resetKeyToggle) {
            resetKeyToggle.checked = db.settings.resetKeyEnabled;
        }
        
    } catch (error) {
        console.error('Error loading admin settings:', error);
    }
}

async function loadAdminTransactions() {
    try {
        const db = await getDB();
        const listEl = document.getElementById('transactionsList');
        
        if (!listEl) return;
        
        listEl.innerHTML = '';
        
        if (db.transactions.length === 0) {
            listEl.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">Belum ada transaksi</p>';
            return;
        }
        
        // Sort by date descending
        db.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        db.transactions.forEach(trx => {
            const statusClass = trx.status === 'approved' ? 'status-approved' : 
                              trx.status === 'rejected' ? 'status-rejected' : 'status-waiting';
            
            const trxEl = document.createElement('div');
            trxEl.className = 'transaction-item';
            trxEl.innerHTML = `
                <div class="transaction-header">
                    <span class="transaction-id">${trx.id}</span>
                    <span class="transaction-status ${statusClass}">${trx.status.toUpperCase()}</span>
                </div>
                <div class="transaction-details">
                    <p><strong>User:</strong> ${trx.userId}</p>
                    <p><strong>Produk:</strong> ${trx.product}</p>
                    <p><strong>Paket:</strong> ${trx.option}</p>
                    <p><strong>Quantity:</strong> ${trx.quantity}</p>
                    <p><strong>Total:</strong> $${trx.price.toFixed(2)}</p>
                    <p><strong>WhatsApp:</strong> ${trx.whatsapp}</p>
                    <p><strong>Tanggal:</strong> ${new Date(trx.date).toLocaleString()}</p>
                    ${trx.promo ? `<p><strong>Promo:</strong> ${trx.promo}</p>` : ''}
                    ${trx.keys && trx.keys.length ? `<p><strong>Keys:</strong> ${trx.keys.join(', ')}</p>` : ''}
                </div>
                ${trx.status === 'waiting' ? `
                    <div class="transaction-actions">
                        <button onclick="approveTransaction('${trx.id}')" class="approve-btn">Approve</button>
                        <button onclick="rejectTransaction('${trx.id}')" class="reject-btn">Reject</button>
                    </div>
                ` : ''}
            `;
            
            listEl.appendChild(trxEl);
        });
        
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

let currentTransactionId = null;

function approveTransaction(trxId) {
    currentTransactionId = trxId;
    const modal = document.getElementById('approveModal');
    modal.classList.add('show');
}

async function submitApprove() {
    const keys = document.getElementById('approveKeys').value.split(',').map(k => k.trim());
    
    if (!keys.length) {
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan',
            text: 'Masukkan minimal 1 key!'
        });
        return;
    }
    
    try {
        const db = await getDB();
        const trxIndex = db.transactions.findIndex(t => t.id === currentTransactionId);
        
        db.transactions[trxIndex].status = 'approved';
        db.transactions[trxIndex].keys = keys;
        
        await updateDB(db);
        
        Swal.fire({
            icon: 'success',
            title: 'Sukses!',
            text: 'Transaksi berhasil diapprove',
            timer: 1500,
            showConfirmButton: false
        });
        
        document.getElementById('approveModal').classList.remove('show');
        document.getElementById('approveKeys').value = '';
        loadAdminTransactions();
        
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Gagal approve transaksi!'
        });
    }
}

async function rejectTransaction(trxId) {
    const confirm = await Swal.fire({
        title: 'Yakin ingin reject?',
        text: 'Transaksi akan ditolak!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Ya, reject!',
        cancelButtonText: 'Batal'
    });
    
    if (confirm.isConfirmed) {
        try {
            const db = await getDB();
            const trxIndex = db.transactions.findIndex(t => t.id === trxId);
            
            db.transactions[trxIndex].status = 'rejected';
            
            await updateDB(db);
            
            Swal.fire({
                icon: 'success',
                title: 'Sukses!',
                text: 'Transaksi berhasil direject',
                timer: 1500,
                showConfirmButton: false
            });
            
            loadAdminTransactions();
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal reject transaksi!'
            });
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initDB();
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
    
    // Check if user is logged in on protected pages
    const protectedPages = ['home.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && currentPage !== 'admin.html') {
        const user = sessionStorage.getItem('currentUser');
        if (!user) {
            window.location.href = 'index.html';
        }
    }
});