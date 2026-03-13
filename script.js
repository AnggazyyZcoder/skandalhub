// Konfigurasi JSONBin.io
const JSONBIN_API_KEY = '$2a$10$FrRFp7JmBmpnrWofdI2GyOHCeiMwzhvrVQ.Hh2H3FaBCiFlkxh4c6'; // Ganti dengan API Key Anda
const JSONBIN_BIN_ID = '69b3d8deb7ec241ddc656351'; // Ganti dengan Bin ID Anda
const BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Inisialisasi data default
let users = [];
let products = [];
let promoCodes = [];
let settings = {
    runningText: {
        text: "KODE PROMO TERBARU : DISKON70%",
        enabled: false
    },
    resetKeySystem: {
        enabled: true
    }
};

// Loading Screen Handler
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContent = document.getElementById('mainContent');
        
        if (loadingScreen && mainContent) {
            loadingScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Initialize page based on current page
            initPage();
        }
    }, 3000);
});

// Page Initialization
function initPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    loadData().then(() => {
        switch(currentPage) {
            case 'index.html':
            case '':
                initLoginPage();
                break;
            case 'register.html':
                initRegisterPage();
                break;
            case 'home.html':
                initHomePage();
                break;
            case 'admin.html':
                initAdminPage();
                break;
        }
    });
}

// Load data from JSONBin
async function loadData() {
    try {
        const response = await fetch(`${BASE_URL}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            users = data.record.users || [];
            products = data.record.products || [];
            promoCodes = data.record.promoCodes || [];
            settings = data.record.settings || settings;
        } else {
            // Initialize with default data if bin is empty
            await saveData();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize with default data
        await saveData();
    }
}

// Save data to JSONBin
async function saveData() {
    try {
        const data = {
            users,
            products,
            promoCodes,
            settings
        };
        
        const response = await fetch(BASE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(data)
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Toggle Password Visibility
window.togglePassword = function(inputId) {
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
};

// Login Page Initialization
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Find user
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Show loading animation
            Swal.fire({
                title: `Welcome ${username}!`,
                text: 'Mengalihkan ke dashboard...',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
                background: '#1a0b2e',
                color: '#fff',
                icon: 'success'
            }).then(() => {
                if (rememberMe) {
                    localStorage.setItem('dripUser', JSON.stringify(user));
                } else {
                    sessionStorage.setItem('dripUser', JSON.stringify(user));
                }
                window.location.href = 'home.html';
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Username atau password salah',
                icon: 'error',
                background: '#1a0b2e',
                color: '#fff',
                confirmButtonColor: '#9b4dff'
            });
        }
    });
}

// Register Page Initialization
function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            Swal.fire({
                title: 'Error!',
                text: 'Password tidak cocok',
                icon: 'error',
                background: '#1a0b2e',
                color: '#fff',
                confirmButtonColor: '#9b4dff'
            });
            return;
        }
        
        // Check if username exists
        if (users.some(u => u.username === username)) {
            Swal.fire({
                title: 'Error!',
                text: 'Username sudah digunakan',
                icon: 'error',
                background: '#1a0b2e',
                color: '#fff',
                confirmButtonColor: '#9b4dff'
            });
            return;
        }
        
        // Add new user
        const newUser = {
            id: Date.now().toString(),
            username,
            password,
            createdAt: new Date().toISOString(),
            keys: []
        };
        
        users.push(newUser);
        
        if (await saveData()) {
            Swal.fire({
                title: 'Sukses!',
                text: 'Akun berhasil dibuat',
                icon: 'success',
                background: '#1a0b2e',
                color: '#fff',
                confirmButtonColor: '#9b4dff'
            }).then(() => {
                window.location.href = 'index.html';
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Gagal membuat akun',
                icon: 'error',
                background: '#1a0b2e',
                color: '#fff',
                confirmButtonColor: '#9b4dff'
            });
        }
    });
}

// Home Page Initialization
function initHomePage() {
    // Get current user
    const user = JSON.parse(localStorage.getItem('dripUser')) || JSON.parse(sessionStorage.getItem('dripUser'));
    
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Display username
    document.getElementById('usernameDisplay').textContent = user.username;
    
    // Initialize hamburger menu
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navbar = document.getElementById('navbar');
    const closeNavbar = document.getElementById('closeNavbar');
    const overlay = document.getElementById('overlay');
    
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            navbar.classList.add('open');
            overlay.classList.add('show');
        });
    }
    
    if (closeNavbar) {
        closeNavbar.addEventListener('click', () => {
            navbar.classList.remove('open');
            overlay.classList.remove('show');
        });
    }
    
    if (overlay) {
        overlay.addEventListener('click', () => {
            navbar.classList.remove('open');
            overlay.classList.remove('show');
            document.querySelectorAll('.modal.show').forEach(modal => {
                modal.classList.remove('show');
            });
        });
    }
    
    // Initialize running text
    if (settings.runningText.enabled) {
        document.getElementById('runningTextContainer').style.display = 'block';
        document.getElementById('runningTextContent').textContent = settings.runningText.text;
    }
    
    // Display products
    displayProducts();
    
    // Initialize FAQ
    initFAQ();
    
    // Initialize reset key button
    const resetKeyBtn = document.getElementById('resetKeyBtn');
    if (resetKeyBtn) {
        resetKeyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('resetKeyModal').classList.add('show');
            overlay.classList.add('show');
        });
    }
    
    // Close modal button
    const closeModal = document.getElementById('closeResetModal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('resetKeyModal').classList.remove('show');
            overlay.classList.remove('show');
        });
    }
    
    // Process reset key
    const processResetBtn = document.getElementById('processResetBtn');
    if (processResetBtn) {
        processResetBtn.addEventListener('click', processResetKey);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('dripUser');
            sessionStorage.removeItem('dripUser');
            window.location.href = 'index.html';
        });
    }
}

// Display Products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card fade-in';
        productCard.style.animationDelay = `${index * 0.1}s`;
        
        // Parse features
        const features = product.features ? product.features.split(',').map(f => f.trim()) : [];
        
        // Parse prices
        const prices = {};
        if (product.prices) {
            product.prices.split(',').forEach(price => {
                const [key, value] = price.split(':');
                prices[key.trim()] = parseInt(value.trim());
            });
        }
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x200'}" alt="${product.name}">
            </div>
            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc">${product.description || ''}</p>
            <ul class="product-features">
                ${features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
            </ul>
            <div class="product-price">
                <select class="price-select" id="priceSelect_${product.id}">
                    ${Object.entries(prices).map(([key, value]) => 
                        `<option value="${value}">${key} - Rp ${value.toLocaleString()}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="promo-input">
                <input type="text" placeholder="Kode Promo" id="promo_${product.id}">
                <button class="apply-promo" onclick="applyPromo('${product.id}')">Apply</button>
            </div>
            <button class="buy-now" onclick="buyNow('${product.id}')">
                <i class="fas fa-shopping-cart"></i>
                Buy Now
            </button>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Apply Promo
window.applyPromo = function(productId) {
    const promoInput = document.getElementById(`promo_${productId}`);
    const promoCode = promoInput.value.trim().toUpperCase();
    
    const promo = promoCodes.find(p => p.code === promoCode);
    
    if (promo) {
        // Check usage limit
        if (promo.usedCount >= promo.maxUse) {
            Swal.fire({
                title: 'Promo Expired!',
                text: 'Maaf, promo sudah mencapai batas pemakaian',
                icon: 'error',
                background: '#1a0b2e',
                color: '#fff',
                confirmButtonColor: '#9b4dff'
            });
            return;
        }
        
        // Store applied promo in session
        sessionStorage.setItem(`promo_${productId}`, JSON.stringify(promo));
        
        // Calculate discount
        const priceSelect = document.getElementById(`priceSelect_${productId}`);
        const originalPrice = parseInt(priceSelect.value);
        const discount = originalPrice * (promo.percent / 100);
        const finalPrice = originalPrice - discount;
        
        Swal.fire({
            title: 'Promo Applied!',
            html: `
                <div style="text-align: left;">
                    <p>Kode: ${promo.code}</p>
                    <p>Diskon: ${promo.percent}%</p>
                    <p>Harga Asli: Rp ${originalPrice.toLocaleString()}</p>
                    <p style="color: #9b4dff;">Harga Setelah Diskon: Rp ${finalPrice.toLocaleString()}</p>
                </div>
            `,
            icon: 'success',
            background: '#1a0b2e',
            color: '#fff',
            confirmButtonColor: '#9b4dff'
        });
    } else {
        sessionStorage.removeItem(`promo_${productId}`);
        Swal.fire({
            title: 'Invalid Promo!',
            text: 'Kode promo tidak valid',
            icon: 'error',
            background: '#1a0b2e',
            color: '#fff',
            confirmButtonColor: '#9b4dff'
        });
    }
};

// Buy Now
window.buyNow = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const priceSelect = document.getElementById(`priceSelect_${productId}`);
    const selectedPrice = priceSelect.options[priceSelect.selectedIndex];
    const selectedDuration = selectedPrice.text.split(' - ')[0];
    const price = parseInt(priceSelect.value);
    
    const promoData = sessionStorage.getItem(`promo_${productId}`);
    let promoInfo = '';
    let finalPrice = price;
    
    if (promoData) {
        const promo = JSON.parse(promoData);
        const discount = price * (promo.percent / 100);
        finalPrice = price - discount;
        promoInfo = `, Code Promo: ${promo.code} (Diskon ${promo.percent}%)`;
    }
    
    // Generate WhatsApp message
    const message = `Halo%20Mau%20Beli%20${encodeURIComponent(product.name)}%20-%20${encodeURIComponent(selectedDuration)}%20(Rp%20${finalPrice.toLocaleString()})${encodeURIComponent(promoInfo)}`;
    
    window.open(`https://wa.me/6288804148639?text=${message}`, '_blank');
    
    // Update promo usage if applied
    if (promoData) {
        const promo = JSON.parse(promoData);
        promo.usedCount = (promo.usedCount || 0) + 1;
        const promoIndex = promoCodes.findIndex(p => p.code === promo.code);
        if (promoIndex !== -1) {
            promoCodes[promoIndex] = promo;
            saveData();
        }
        sessionStorage.removeItem(`promo_${productId}`);
    }
};

// Process Reset Key
async function processResetKey() {
    const resetLog = document.getElementById('resetLog');
    const input = document.getElementById('resetKeyInput').value.trim();
    
    if (!input) {
        Swal.fire({
            title: 'Error!',
            text: 'Masukkan key lama',
            icon: 'error',
            background: '#1a0b2e',
            color: '#fff',
            confirmButtonColor: '#9b4dff'
        });
        return;
    }
    
    resetLog.innerHTML = '🔄 Fetching Server.....';
    
    setTimeout(() => {
        resetLog.innerHTML += '\n📡 Respone Database....';
    }, 1000);
    
    setTimeout(() => {
        if (!settings.resetKeySystem.enabled) {
            resetLog.innerHTML += '\n\n❌ Maaf fitur ini sedang di nonaktifkan oleh admin atau sedang tidak beroperasi normal, Silahkan coba lagi nanti.';
            return;
        }
        
        // Get user
        const user = JSON.parse(localStorage.getItem('dripUser')) || JSON.parse(sessionStorage.getItem('dripUser'));
        
        // Check reset limit (1x per day)
        const today = new Date().toDateString();
        if (user.lastReset === today) {
            resetLog.innerHTML += '\n\n❌ Anda sudah melakukan reset hari ini. Maksimal 1x reset per hari.';
            return;
        }
        
        // Generate new key
        const newKey = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        
        // Update user data
        user.lastReset = today;
        user.keys = user.keys || [];
        user.keys.push({
            oldKey: input,
            newKey: newKey,
            date: new Date().toISOString()
        });
        
        // Update in users array
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
            users[userIndex] = user;
            saveData();
        }
        
        // Update storage
        if (localStorage.getItem('dripUser')) {
            localStorage.setItem('dripUser', JSON.stringify(user));
        } else {
            sessionStorage.setItem('dripUser', JSON.stringify(user));
        }
        
        resetLog.innerHTML += '\n\n✅ Reset Successful\n\n';
        resetLog.innerHTML += 'Status: 200\n';
        resetLog.innerHTML += `Response: {"success":true,"message":"Token reset successfully","newkey":"${newKey}","resetsused":1,"resetsmax":2,"nextresettime":"${new Date(Date.now() + 86400000).toISOString()}"}\n\n`;
        resetLog.innerHTML += `🎯 New Key: ${newKey}`;
        
    }, 2000);
}

// Initialize FAQ
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            item.classList.toggle('active');
        });
    });
}

// Admin Page Initialization
function initAdminPage() {
    // Check if user is admin (you can add admin check here)
    
    // Load current settings
    document.getElementById('runningText').value = settings.runningText.text || '';
    document.getElementById('runningTextToggle').checked = settings.runningText.enabled || false;
    document.getElementById('resetKeyToggle').checked = settings.resetKeySystem.enabled !== false;
    
    // Add Product Form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newProduct = {
                id: Date.now().toString(),
                name: document.getElementById('productName').value,
                image: document.getElementById('productImage').value,
                description: document.getElementById('productDesc').value,
                features: document.getElementById('productFeatures').value,
                prices: document.getElementById('productPrices').value
            };
            
            products.push(newProduct);
            
            if (await saveData()) {
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Produk berhasil ditambahkan',
                    icon: 'success',
                    background: '#1a0b2e',
                    color: '#fff',
                    confirmButtonColor: '#9b4dff'
                });
                addProductForm.reset();
                displayProductList();
            }
        });
    }
    
    // Add Promo Form
    const addPromoForm = document.getElementById('addPromoForm');
    if (addPromoForm) {
        addPromoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newPromo = {
                id: Date.now().toString(),
                code: document.getElementById('promoCode').value.toUpperCase(),
                percent: parseInt(document.getElementById('promoPercent').value),
                maxUse: parseInt(document.getElementById('promoMaxUse').value),
                usedCount: 0
            };
            
            promoCodes.push(newPromo);
            
            if (await saveData()) {
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Kode promo berhasil ditambahkan',
                    icon: 'success',
                    background: '#1a0b2e',
                    color: '#fff',
                    confirmButtonColor: '#9b4dff'
                });
                addPromoForm.reset();
            }
        });
    }
    
    // Running Text Form
    const runningTextForm = document.getElementById('runningTextForm');
    if (runningTextForm) {
        runningTextForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            settings.runningText.text = document.getElementById('runningText').value;
            settings.runningText.enabled = document.getElementById('runningTextToggle').checked;
            
            if (await saveData()) {
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Running text berhasil diupdate',
                    icon: 'success',
                    background: '#1a0b2e',
                    color: '#fff',
                    confirmButtonColor: '#9b4dff'
                });
            }
        });
    }
    
    // Save Reset Key Status
    const saveResetKeyStatus = document.getElementById('saveResetKeyStatus');
    if (saveResetKeyStatus) {
        saveResetKeyStatus.addEventListener('click', async () => {
            settings.resetKeySystem.enabled = document.getElementById('resetKeyToggle').checked;
            
            if (await saveData()) {
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Status reset key berhasil diupdate',
                    icon: 'success',
                    background: '#1a0b2e',
                    color: '#fff',
                    confirmButtonColor: '#9b4dff'
                });
            }
        });
    }
    
    // Display product list
    displayProductList();
}

// Display Product List in Admin
function displayProductList() {
    const productList = document.getElementById('productList');
    if (!productList) return;
    
    productList.innerHTML = '';
    
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        
        productItem.innerHTML = `
            <img src="${product.image || 'https://via.placeholder.com/50'}" alt="${product.name}">
            <div class="product-item-info">
                <h4>${product.name}</h4>
                <p>${product.description || ''}</p>
            </div>
            <div class="product-item-actions">
                <button class="edit-product" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-product" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        productList.appendChild(productItem);
    });
}

// Edit Product
window.editProduct = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // You can implement edit modal here
    Swal.fire({
        title: 'Edit Product',
        html: `
            <input id="editName" class="swal2-input" placeholder="Nama Product" value="${product.name}">
            <input id="editImage" class="swal2-input" placeholder="Image Link" value="${product.image || ''}">
            <textarea id="editDesc" class="swal2-textarea" placeholder="Deskripsi">${product.description || ''}</textarea>
            <input id="editFeatures" class="swal2-input" placeholder="Fitur (pisahkan dengan koma)" value="${product.features || ''}">
            <input id="editPrices" class="swal2-input" placeholder="Harga" value="${product.prices || ''}">
        `,
        showCancelButton: true,
        confirmButtonText: 'Save',
        confirmButtonColor: '#9b4dff',
        cancelButtonColor: '#ff4d4d',
        background: '#1a0b2e',
        color: '#fff',
        preConfirm: async () => {
            product.name = document.getElementById('editName').value;
            product.image = document.getElementById('editImage').value;
            product.description = document.getElementById('editDesc').value;
            product.features = document.getElementById('editFeatures').value;
            product.prices = document.getElementById('editPrices').value;
            
            if (await saveData()) {
                displayProductList();
                return true;
            }
            return false;
        }
    });
};

// Delete Product
window.deleteProduct = async function(productId) {
    const result = await Swal.fire({
        title: 'Hapus Product?',
        text: 'Product akan dihapus permanen',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4d',
        cancelButtonColor: '#9b4dff',
        confirmButtonText: 'Hapus',
        background: '#1a0b2e',
        color: '#fff'
    });
    
    if (result.isConfirmed) {
        products = products.filter(p => p.id !== productId);
        
        if (await saveData()) {
            Swal.fire({
                title: 'Sukses!',
                text: 'Product berhasil dihapus',
                icon: 'success',
                background: '#1a0b2e',
                color: '#fff',
                confirmButtonColor: '#9b4dff'
            });
            displayProductList();
        }
    }
};