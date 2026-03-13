// Konfigurasi JSONBin
const JSONBIN_API_KEY = '$2a$10$FrRFp7JmBmpnrWofdI2GyOHCeiMwzhvrVQ.Hh2H3FaBCiFlkxh4c6'; // Ganti dengan API key Anda
const JSONBIN_BIN_ID = '69b3d8deb7ec241ddc656351'; // Ganti dengan bin ID Anda
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Inisialisasi data default
let appData = {
    users: [],
    products: [],
    promos: [],
    settings: {
        runningText: {
            enabled: false,
            text: "KODE PROMO TERBARU : DISKON70%"
        }
    },
    faq: [
        {
            question: "Apa itu Drip Client?",
            answer: "Drip Client adalah cheat android dengan fitur lengkap dan anti ban."
        },
        {
            question: "Apakah aman digunakan?",
            answer: "Ya, kami menggunakan sistem proteksi terbaru untuk menghindari deteksi."
        },
        {
            question: "Bagaimana cara pembelian?",
            answer: "Pilih produk, gunakan promo jika ada, lalu klik Buy Now untuk chat WhatsApp."
        },
        {
            question: "Apada garansi?",
            answer: "Ya, kami memberikan garansi 7 hari jika terjadi masalah."
        }
    ]
};

// Loading Screen Handler
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hide');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                const mainContent = document.getElementById('mainContent');
                if (mainContent) {
                    mainContent.style.display = 'block';
                    initPage();
                }
            }, 500);
        }
    }, 3000);
});

// Inisialisasi setiap halaman
function initPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Load data dari JSONBin
    loadData().then(() => {
        switch(currentPage) {
            case 'index.html':
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
    
    // Inisialisasi scroll animations
    initScrollAnimations();
    
    // Inisialisasi particles
    initParticles();
}

// Load data dari JSONBin
async function loadData() {
    try {
        const response = await fetch(`${JSONBIN_URL}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            appData = data.record;
        } else {
            // Jika bin tidak ada, buat baru
            await saveData();
        }
    } catch (error) {
        console.log('Menggunakan data default');
        await saveData();
    }
}

// Simpan data ke JSONBin
async function saveData() {
    try {
        const response = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(appData)
        });
        
        if (!response.ok) {
            console.error('Gagal menyimpan data');
        }
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// Inisialisasi particles
function initParticles() {
    const particles = document.querySelector('.particles');
    if (particles) {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '2px';
            particle.style.height = '2px';
            particle.style.background = 'var(--primary)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animation = `float ${5 + Math.random() * 10}s linear infinite`;
            particle.style.animationDelay = Math.random() * 5 + 's';
            particles.appendChild(particle);
        }
    }
}

// Inisialisasi scroll animations
function initScrollAnimations() {
    const elements = document.querySelectorAll('.product-card, .faq-item, .admin-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-scroll', 'visible');
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => observer.observe(el));
}

// Login Page
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Cari user
        const user = appData.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Loading animation
            Swal.fire({
                title: 'Welcome!',
                text: `Selamat datang ${username}!`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                background: 'var(--glass-dark)',
                color: 'var(--light)'
            });
            
            // Simpan session
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
            }
            
            // Redirect ke home
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Username atau password salah!',
                icon: 'error',
                background: 'var(--glass-dark)',
                color: 'var(--light)',
                confirmButtonColor: 'var(--primary)'
            });
        }
    });
}

// Register Page
function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        
        // Validasi
        if (password !== confirmPassword) {
            Swal.fire({
                title: 'Error!',
                text: 'Password tidak cocok!',
                icon: 'error',
                background: 'var(--glass-dark)',
                color: 'var(--light)'
            });
            return;
        }
        
        // Cek username sudah ada
        if (appData.users.some(u => u.username === username)) {
            Swal.fire({
                title: 'Error!',
                text: 'Username sudah digunakan!',
                icon: 'error',
                background: 'var(--glass-dark)',
                color: 'var(--light)'
            });
            return;
        }
        
        // Tambah user baru
        const newUser = {
            id: Date.now(),
            username,
            email,
            password,
            registeredAt: new Date().toISOString()
        };
        
        appData.users.push(newUser);
        await saveData();
        
        Swal.fire({
            title: 'Sukses!',
            text: 'Akun berhasil dibuat! Silakan login.',
            icon: 'success',
            background: 'var(--glass-dark)',
            color: 'var(--light)',
            confirmButtonColor: 'var(--primary)'
        }).then(() => {
            window.location.href = 'index.html';
        });
    });
}

// Home Page
function initHomePage() {
    // Ambil user data
    const user = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Tampilkan username
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = user.username;
    }
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.add('active');
        });
    }
    
    if (closeSidebar && sidebar) {
        closeSidebar.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
    
    // Tampilkan running text
    const runningTextContainer = document.getElementById('runningTextContainer');
    const runningTextContent = document.getElementById('runningTextContent');
    
    if (appData.settings.runningText.enabled && runningTextContainer && runningTextContent) {
        runningTextContainer.style.display = 'block';
        runningTextContent.textContent = appData.settings.runningText.text;
    }
    
    // Tampilkan produk
    displayProducts();
    
    // Tampilkan FAQ
    displayFAQ();
}

// Display Products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    appData.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card fade-in-scroll';
        
        // Generate features HTML
        const features = product.features.split(',').map(f => f.trim());
        const featuresHTML = features.map(f => `
            <li>
                <i class="fas fa-check-circle"></i>
                ${f}
            </li>
        `).join('');
        
        // Generate price options
        const priceOptions = product.prices.map((price, index) => {
            const [name, value] = price.split('|');
            return `<option value="${value}" ${index === 0 ? 'selected' : ''}>${name} - Rp ${formatRupiah(value)}</option>`;
        }).join('');
        
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            <ul class="product-features">
                ${featuresHTML}
            </ul>
            <select class="product-select" id="price-${product.id}">
                ${priceOptions}
            </select>
            <input type="text" class="promo-input" id="promo-${product.id}" placeholder="Masukkan Code Promo (Opsional)">
            <div class="price-display" id="priceDisplay-${product.id}">
                <span class="original-price" id="originalPrice-${product.id}">Rp ${formatRupiah(product.prices[0].split('|')[1])}</span>
                <span class="final-price" id="finalPrice-${product.id}">Rp ${formatRupiah(product.prices[0].split('|')[1])}</span>
            </div>
            <button class="buy-btn" onclick="buyProduct('${product.id}')">
                <i class="fab fa-whatsapp"></i>
                Buy Now
            </button>
        `;
        
        productsGrid.appendChild(productCard);
        
        // Add event listeners
        const priceSelect = document.getElementById(`price-${product.id}`);
        const promoInput = document.getElementById(`promo-${product.id}`);
        
        priceSelect.addEventListener('change', () => updatePrice(product.id));
        promoInput.addEventListener('input', () => updatePrice(product.id));
    });
}

// Update price with promo
function updatePrice(productId) {
    const product = appData.products.find(p => p.id == productId);
    if (!product) return;
    
    const priceSelect = document.getElementById(`price-${productId}`);
    const promoInput = document.getElementById(`promo-${productId}`);
    const originalPriceSpan = document.getElementById(`originalPrice-${productId}`);
    const finalPriceSpan = document.getElementById(`finalPrice-${productId}`);
    
    const selectedPrice = parseInt(priceSelect.value);
    const promoCode = promoInput.value.trim();
    
    originalPriceSpan.textContent = `Rp ${formatRupiah(selectedPrice)}`;
    
    if (promoCode) {
        const promo = appData.promos.find(p => p.code === promoCode);
        if (promo && promo.usedCount < promo.maxUse) {
            const discount = (selectedPrice * promo.percent) / 100;
            const finalPrice = selectedPrice - discount;
            finalPriceSpan.textContent = `Rp ${formatRupiah(finalPrice)}`;
            finalPriceSpan.style.color = 'var(--success)';
        } else {
            finalPriceSpan.textContent = `Rp ${formatRupiah(selectedPrice)}`;
            finalPriceSpan.style.color = 'var(--secondary)';
            if (promoCode) {
                Swal.fire({
                    title: 'Promo Tidak Valid!',
                    text: promo ? 'Promo sudah mencapai batas penggunaan!' : 'Kode promo tidak ditemukan!',
                    icon: 'warning',
                    background: 'var(--glass-dark)',
                    color: 'var(--light)',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        }
    } else {
        finalPriceSpan.textContent = `Rp ${formatRupiah(selectedPrice)}`;
        finalPriceSpan.style.color = 'var(--secondary)';
    }
}

// Buy product
window.buyProduct = async function(productId) {
    const product = appData.products.find(p => p.id == productId);
    if (!product) return;
    
    const priceSelect = document.getElementById(`price-${productId}`);
    const promoInput = document.getElementById(`promo-${productId}`);
    const selectedOption = priceSelect.options[priceSelect.selectedIndex].text;
    const promoCode = promoInput.value.trim();
    
    let message = `Halo, saya mau membeli ${product.name} - ${selectedOption}`;
    
    if (promoCode) {
        const promo = appData.promos.find(p => p.code === promoCode);
        if (promo && promo.usedCount < promo.maxUse) {
            message += `\nMenggunakan kode promo: ${promoCode}`;
            
            // Update promo usage
            promo.usedCount++;
            await saveData();
        }
    } else {
        message += '\nTanpa promo';
    }
    
    const whatsappUrl = `https://wa.me/6288804148639?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Display FAQ
function displayFAQ() {
    const faqGrid = document.getElementById('faqGrid');
    if (!faqGrid) return;
    
    faqGrid.innerHTML = '';
    
    appData.faq.forEach((item, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item fade-in-scroll';
        faqItem.innerHTML = `
            <div class="faq-question">
                <i class="fas fa-plus-circle"></i>
                <span>${item.question}</span>
            </div>
            <div class="faq-answer">
                ${item.answer}
            </div>
        `;
        
        faqItem.addEventListener('click', () => {
            faqItem.classList.toggle('active');
        });
        
        faqGrid.appendChild(faqItem);
    });
}

// Admin Page
function initAdminPage() {
    // Tampilkan produk
    displayAdminProducts();
    
    // Tampilkan promo
    displayAdminPromos();
    
    // Running text form
    const runningTextForm = document.getElementById('runningTextForm');
    if (runningTextForm) {
        document.getElementById('runningText').value = appData.settings.runningText.text;
        document.getElementById('runningTextToggle').checked = appData.settings.runningText.enabled;
        
        runningTextForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            appData.settings.runningText.text = document.getElementById('runningText').value;
            appData.settings.runningText.enabled = document.getElementById('runningTextToggle').checked;
            
            await saveData();
            
            Swal.fire({
                title: 'Sukses!',
                text: 'Running text berhasil diperbarui!',
                icon: 'success',
                background: 'var(--glass-dark)',
                color: 'var(--light)',
                confirmButtonColor: 'var(--primary)'
            });
        });
    }
    
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const priceInputs = document.querySelectorAll('.price-option');
            const prices = Array.from(priceInputs).map(input => input.value).filter(v => v.trim());
            
            const newProduct = {
                id: Date.now(),
                name: document.getElementById('productName').value,
                image: document.getElementById('productImage').value,
                description: document.getElementById('productDesc').value,
                features: document.getElementById('productFeatures').value,
                prices: prices
            };
            
            appData.products.push(newProduct);
            await saveData();
            
            Swal.fire({
                title: 'Sukses!',
                text: 'Produk berhasil ditambahkan!',
                icon: 'success',
                background: 'var(--glass-dark)',
                color: 'var(--light)',
                confirmButtonColor: 'var(--primary)'
            });
            
            addProductForm.reset();
            displayAdminProducts();
        });
    }
    
    // Add promo form
    const addPromoForm = document.getElementById('addPromoForm');
    if (addPromoForm) {
        addPromoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newPromo = {
                id: Date.now(),
                code: document.getElementById('promoCode').value.toUpperCase(),
                percent: parseInt(document.getElementById('promoPercent').value),
                maxUse: parseInt(document.getElementById('promoMaxUse').value),
                usedCount: 0
            };
            
            appData.promos.push(newPromo);
            await saveData();
            
            Swal.fire({
                title: 'Sukses!',
                text: 'Kode promo berhasil ditambahkan!',
                icon: 'success',
                background: 'var(--glass-dark)',
                color: 'var(--light)',
                confirmButtonColor: 'var(--primary)'
            });
            
            addPromoForm.reset();
            displayAdminPromos();
        });
    }
}

// Display admin products
function displayAdminProducts() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    
    productsList.innerHTML = '';
    
    appData.products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <h4>${product.name}</h4>
            <p>Harga: ${product.prices.length} opsi</p>
            <p>Fitur: ${product.features}</p>
            <div class="delete-btn" onclick="deleteProduct(${product.id})">
                <i class="fas fa-trash"></i>
            </div>
        `;
        
        productsList.appendChild(item);
    });
}

// Display admin promos
function displayAdminPromos() {
    const promosList = document.getElementById('promosList');
    if (!promosList) return;
    
    promosList.innerHTML = '';
    
    appData.promos.forEach(promo => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <h4>${promo.code}</h4>
            <p>Diskon: ${promo.percent}%</p>
            <p>Digunakan: ${promo.usedCount}/${promo.maxUse}</p>
            <div class="delete-btn" onclick="deletePromo(${promo.id})">
                <i class="fas fa-trash"></i>
            </div>
        `;
        
        promosList.appendChild(item);
    });
}

// Delete product
window.deleteProduct = async function(productId) {
    const result = await Swal.fire({
        title: 'Hapus Produk?',
        text: 'Produk akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--danger)',
        cancelButtonColor: 'var(--primary)',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        background: 'var(--glass-dark)',
        color: 'var(--light)'
    });
    
    if (result.isConfirmed) {
        appData.products = appData.products.filter(p => p.id !== productId);
        await saveData();
        displayAdminProducts();
        
        Swal.fire({
            title: 'Terhapus!',
            text: 'Produk berhasil dihapus.',
            icon: 'success',
            background: 'var(--glass-dark)',
            color: 'var(--light)',
            timer: 1500,
            showConfirmButton: false
        });
    }
};

// Delete promo
window.deletePromo = async function(promoId) {
    const result = await Swal.fire({
        title: 'Hapus Promo?',
        text: 'Kode promo akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--danger)',
        cancelButtonColor: 'var(--primary)',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        background: 'var(--glass-dark)',
        color: 'var(--light)'
    });
    
    if (result.isConfirmed) {
        appData.promos = appData.promos.filter(p => p.id !== promoId);
        await saveData();
        displayAdminPromos();
        
        Swal.fire({
            title: 'Terhapus!',
            text: 'Kode promo berhasil dihapus.',
            icon: 'success',
            background: 'var(--glass-dark)',
            color: 'var(--light)',
            timer: 1500,
            showConfirmButton: false
        });
    }
};

// Add price option
window.addPriceOption = function() {
    const priceInputs = document.getElementById('priceInputs');
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'price-option';
    newInput.placeholder = '1 Bulan|200000';
    newInput.style.marginTop = '10px';
    priceInputs.appendChild(newInput);
};

// Format Rupiah
function formatRupiah(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.getElementById('hamburgerMenu');
    
    if (sidebar && sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !hamburger.contains(e.target)) {
        sidebar.classList.remove('active');
    }
});