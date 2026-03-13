// Konfigurasi JSONBin.io
const JSONBIN_API_KEY = '$2a$10$FrRFp7JmBmpnrWofdI2GyOHCeiMwzhvrVQ.Hh2H3FaBCiFlkxh4c6'; // Ganti dengan API Key Anda
const JSONBIN_BIN_ID = '69b3d8deb7ec241ddc656351'; // Ganti dengan Bin ID Anda
const BASE_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Inisialisasi data default
const defaultData = {
    users: [],
    products: [],
    promoCodes: [],
    settings: {
        runningText: {
            text: "KODE PROMO TERBARU : DISKON70%",
            enabled: false
        }
    }
};

// Helper Functions
async function fetchData() {
    try {
        const response = await fetch(BASE_URL, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.error('Error fetching data:', error);
        return defaultData;
    }
}

async function updateData(newData) {
    try {
        const response = await fetch(BASE_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(newData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating data:', error);
        return null;
    }
}

// SweetAlert wrapper
function showAlert(type, title, message) {
    Swal.fire({
        icon: type,
        title: title,
        text: message,
        background: 'var(--card-bg)',
        color: 'var(--text-primary)',
        confirmButtonColor: 'var(--purple-secondary)',
        timer: type === 'success' ? 3000 : undefined
    });
}

// Loading screen helper
function showLoading(containerId) {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                document.getElementById(containerId).style.display = 'block';
            }, 1000);
        }, 3000);
    }
}

// ==================== LOGIN PAGE FUNCTIONS ====================
async function handleLogin(username, password, rememberMe) {
    if (!username || !password) {
        showAlert('error', 'Error', 'Username dan password harus diisi!');
        return false;
    }

    try {
        const data = await fetchData();
        const user = data.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Show welcome animation
            const loadingScreen = document.createElement('div');
            loadingScreen.className = 'loading-screen';
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="loading-logo">
                        <img src="https://cdn-uploads.huggingface.co/production/uploads/noauth/8W2qfrJxJ0G0EplunCycM.jpeg" alt="Drip Client Logo">
                    </div>
                    <div class="loading-text">
                        <span>W</span>
                        <span>E</span>
                        <span>L</span>
                        <span>C</span>
                        <span>O</span>
                        <span>M</span>
                        <span>E</span>
                        <span>&nbsp;</span>
                        <span>${username.toUpperCase()}</span>
                    </div>
                    <div class="loading-progress">
                        <div class="loading-bar" style="animation: loadingBar 3s ease;"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(loadingScreen);

            if (rememberMe) {
                localStorage.setItem('rememberedUser', username);
            }
            
            localStorage.setItem('currentUser', username);
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 3000);
            
            return true;
        } else {
            showAlert('error', 'Login Gagal', 'Username atau password salah!');
            return false;
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('error', 'Error', 'Terjadi kesalahan saat login');
        return false;
    }
}

// ==================== REGISTER PAGE FUNCTIONS ====================
async function handleRegister(username, password, confirmPassword) {
    if (!username || !password || !confirmPassword) {
        showAlert('error', 'Error', 'Semua field harus diisi!');
        return false;
    }

    if (password !== confirmPassword) {
        showAlert('error', 'Error', 'Password tidak cocok!');
        return false;
    }

    if (password.length < 6) {
        showAlert('error', 'Error', 'Password minimal 6 karakter!');
        return false;
    }

    try {
        const data = await fetchData();
        
        // Check if username already exists
        if (data.users.some(u => u.username === username)) {
            showAlert('error', 'Error', 'Username sudah digunakan!');
            return false;
        }

        // Add new user
        data.users.push({
            username: username,
            password: password,
            createdAt: new Date().toISOString()
        });

        await updateData(data);
        
        showAlert('success', 'Berhasil!', 'Akun berhasil dibuat! Silakan login.');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
        return true;
    } catch (error) {
        console.error('Register error:', error);
        showAlert('error', 'Error', 'Terjadi kesalahan saat registrasi');
        return false;
    }
}

// ==================== DASHBOARD FUNCTIONS ====================
const dashboardFunctions = {
    async loadProducts() {
        try {
            const data = await fetchData();
            const productsGrid = document.getElementById('productsGrid');
            if (!productsGrid) return;

            productsGrid.innerHTML = '';

            data.products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card fade-in';
                
                const features = product.features.split(',').map(f => f.trim());
                const priceOptions = product.prices.map(p => 
                    `<option value="${p.value}">${p.label} - Rp ${p.value.toLocaleString()}</option>`
                ).join('');

                productCard.innerHTML = `
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}">
                    </div>
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-desc">${product.description}</p>
                    <ul class="product-features">
                        ${features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}
                    </ul>
                    <div class="price-select">
                        <select class="price-select-${product.id}">
                            ${priceOptions}
                        </select>
                    </div>
                    <div class="promo-input">
                        <input type="text" placeholder="Code Promo" id="promo-${product.id}">
                        <button onclick="dashboardFunctions.applyPromo('${product.id}')">Cek</button>
                    </div>
                    <button class="buy-now-btn" onclick="dashboardFunctions.buyProduct('${product.id}')">
                        <span>Buy Now</span>
                        <i class="fas fa-whatsapp"></i>
                    </button>
                `;
                
                productsGrid.appendChild(productCard);
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },

    async loadRunningText() {
        try {
            const data = await fetchData();
            const runningTextContainer = document.getElementById('runningTextContainer');
            const runningTextContent = document.getElementById('runningTextContent');
            
            if (data.settings?.runningText?.enabled && data.settings.runningText.text) {
                runningTextContent.textContent = data.settings.runningText.text;
                runningTextContainer.style.display = 'block';
            } else {
                runningTextContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading running text:', error);
        }
    },

    async applyPromo(productId) {
        const promoInput = document.getElementById(`promo-${productId}`);
        const promoCode = promoInput.value.trim().toUpperCase();
        
        if (!promoCode) {
            showAlert('info', 'Info', 'Masukkan kode promo');
            return;
        }

        try {
            const data = await fetchData();
            const promo = data.promoCodes.find(p => p.code === promoCode);
            
            if (!promo) {
                showAlert('error', 'Error', 'Kode promo tidak valid!');
                return;
            }

            if (promo.usedCount >= promo.maxUse) {
                showAlert('error', 'Error', 'Kode promo sudah mencapai batas penggunaan!');
                return;
            }

            // Store selected promo in localStorage
            localStorage.setItem('selectedPromo', JSON.stringify({
                code: promo.code,
                discount: promo.discount,
                productId: productId
            }));

            showAlert('success', 'Berhasil!', `Diskon ${promo.discount}% berhasil diterapkan!`);
        } catch (error) {
            console.error('Error applying promo:', error);
            showAlert('error', 'Error', 'Terjadi kesalahan');
        }
    },

    async buyProduct(productId) {
        try {
            const data = await fetchData();
            const product = data.products.find(p => p.id === productId);
            const priceSelect = document.querySelector(`.price-select-${productId}`);
            const selectedPrice = priceSelect?.value;
            const selectedLabel = priceSelect?.options[priceSelect.selectedIndex]?.text.split(' - ')[0];
            
            if (!selectedPrice) {
                showAlert('error', 'Error', 'Pilih durasi terlebih dahulu!');
                return;
            }

            let message = `Halo saya ingin membeli:\n\n`;
            message += `Produk: ${product.name}\n`;
            message += `Durasi: ${selectedLabel}\n`;
            message += `Harga: Rp ${parseInt(selectedPrice).toLocaleString()}\n`;

            // Check for promo
            const selectedPromo = JSON.parse(localStorage.getItem('selectedPromo') || 'null');
            if (selectedPromo && selectedPromo.productId === productId) {
                const discountAmount = (parseInt(selectedPrice) * selectedPromo.discount) / 100;
                const finalPrice = parseInt(selectedPrice) - discountAmount;
                message += `Kode Promo: ${selectedPromo.code} (${selectedPromo.discount}%)\n`;
                message += `Diskon: Rp ${discountAmount.toLocaleString()}\n`;
                message += `Total: Rp ${finalPrice.toLocaleString()}`;
                
                // Update promo usage count
                const promo = data.promoCodes.find(p => p.code === selectedPromo.code);
                if (promo) {
                    promo.usedCount = (promo.usedCount || 0) + 1;
                    await updateData(data);
                }
                
                // Clear promo after use
                localStorage.removeItem('selectedPromo');
            } else {
                message += `Total: Rp ${parseInt(selectedPrice).toLocaleString()}`;
            }

            // Encode message for WhatsApp
            const encodedMessage = encodeURIComponent(message);
            const waUrl = `https://wa.me/6288804148639?text=${encodedMessage}`;
            
            window.open(waUrl, '_blank');
        } catch (error) {
            console.error('Error buying product:', error);
            showAlert('error', 'Error', 'Terjadi kesalahan');
        }
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    },

    initFaq() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
    }
};

// ==================== ADMIN FUNCTIONS ====================
const adminFunctions = {
    async addProduct() {
        const name = document.getElementById('productName').value;
        const image = document.getElementById('productImage').value;
        const description = document.getElementById('productDesc').value;
        const features = document.getElementById('productFeatures').value;
        
        // Get price fields
        const priceFields = document.querySelectorAll('.price-field');
        const prices = [];
        priceFields.forEach(field => {
            const label = field.querySelector('.price-label').value;
            const value = field.querySelector('.price-value').value;
            if (label && value) {
                prices.push({
                    label: label,
                    value: parseInt(value)
                });
            }
        });

        if (!name || !image || !description || !features || prices.length === 0) {
            showAlert('error', 'Error', 'Semua field harus diisi!');
            return;
        }

        try {
            const data = await fetchData();
            const newProduct = {
                id: Date.now().toString(),
                name: name,
                image: image,
                description: description,
                features: features,
                prices: prices,
                createdAt: new Date().toISOString()
            };

            data.products.push(newProduct);
            await updateData(data);

            showAlert('success', 'Berhasil!', 'Produk berhasil ditambahkan');
            
            // Clear form
            document.getElementById('productName').value = '';
            document.getElementById('productImage').value = '';
            document.getElementById('productDesc').value = '';
            document.getElementById('productFeatures').value = '';
            document.querySelectorAll('.price-field').forEach(f => f.remove());
            
            this.loadAdminProducts();
        } catch (error) {
            console.error('Error adding product:', error);
            showAlert('error', 'Error', 'Gagal menambahkan produk');
        }
    },

    async addPromo() {
        const code = document.getElementById('promoCode').value.toUpperCase();
        const discount = parseInt(document.getElementById('promoPercent').value);
        const maxUse = parseInt(document.getElementById('promoMaxUse').value);

        if (!code || !discount || !maxUse) {
            showAlert('error', 'Error', 'Semua field harus diisi!');
            return;
        }

        if (discount < 1 || discount > 100) {
            showAlert('error', 'Error', 'Diskon harus antara 1-100%');
            return;
        }

        try {
            const data = await fetchData();
            
            // Check if code already exists
            if (data.promoCodes.some(p => p.code === code)) {
                showAlert('error', 'Error', 'Kode promo sudah ada!');
                return;
            }

            const newPromo = {
                code: code,
                discount: discount,
                maxUse: maxUse,
                usedCount: 0,
                createdAt: new Date().toISOString()
            };

            data.promoCodes.push(newPromo);
            await updateData(data);

            showAlert('success', 'Berhasil!', 'Kode promo berhasil ditambahkan');
            
            // Clear form
            document.getElementById('promoCode').value = '';
            document.getElementById('promoPercent').value = '';
            document.getElementById('promoMaxUse').value = '';
            
            this.loadAdminPromos();
        } catch (error) {
            console.error('Error adding promo:', error);
            showAlert('error', 'Error', 'Gagal menambahkan kode promo');
        }
    },

    async saveRunningText() {
        const text = document.getElementById('runningText').value;
        const enabled = document.getElementById('runningTextToggle').checked;

        if (!text) {
            showAlert('error', 'Error', 'Teks running tidak boleh kosong!');
            return;
        }

        try {
            const data = await fetchData();
            data.settings = data.settings || {};
            data.settings.runningText = {
                text: text,
                enabled: enabled
            };

            await updateData(data);
            showAlert('success', 'Berhasil!', 'Running text berhasil disimpan');
        } catch (error) {
            console.error('Error saving running text:', error);
            showAlert('error', 'Error', 'Gagal menyimpan running text');
        }
    },

    async loadAdminProducts() {
        try {
            const data = await fetchData();
            const productsList = document.getElementById('adminProductsList');
            if (!productsList) return;

            productsList.innerHTML = '';

            data.products.forEach(product => {
                const productItem = document.createElement('div');
                productItem.className = 'admin-list-item';
                productItem.innerHTML = `
                    <div class="item-info">
                        <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; border-radius: 10px; object-fit: cover;">
                        <div>
                            <h4>${product.name}</h4>
                            <p>${product.prices.length} harga tersedia</p>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button onclick="adminFunctions.deleteProduct('${product.id}')" class="admin-btn delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                productsList.appendChild(productItem);
            });
        } catch (error) {
            console.error('Error loading admin products:', error);
        }
    },

    async loadAdminPromos() {
        try {
            const data = await fetchData();
            const promosList = document.getElementById('adminPromoList');
            if (!promosList) return;

            promosList.innerHTML = '';

            data.promoCodes.forEach(promo => {
                const promoItem = document.createElement('div');
                promoItem.className = 'admin-list-item';
                promoItem.innerHTML = `
                    <div class="item-info">
                        <i class="fas fa-tag" style="color: var(--purple-secondary); font-size: 24px;"></i>
                        <div>
                            <h4>${promo.code}</h4>
                            <p>Diskon ${promo.discount}% | Penggunaan: ${promo.usedCount || 0}/${promo.maxUse}</p>
                        </div>
                    </div>
                    <div class="item-actions">
                        <button onclick="adminFunctions.deletePromo('${promo.code}')" class="admin-btn delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                promosList.appendChild(promoItem);
            });
        } catch (error) {
            console.error('Error loading admin promos:', error);
        }
    },

    async deleteProduct(productId) {
        const result = await Swal.fire({
            title: 'Hapus Produk?',
            text: 'Produk akan dihapus permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--error-color)',
            cancelButtonColor: 'var(--purple-secondary)',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                const data = await fetchData();
                data.products = data.products.filter(p => p.id !== productId);
                await updateData(data);
                
                showAlert('success', 'Berhasil!', 'Produk berhasil dihapus');
                this.loadAdminProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                showAlert('error', 'Error', 'Gagal menghapus produk');
            }
        }
    },

    async deletePromo(promoCode) {
        const result = await Swal.fire({
            title: 'Hapus Promo?',
            text: 'Kode promo akan dihapus permanen!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--error-color)',
            cancelButtonColor: 'var(--purple-secondary)',
            confirmButtonText: 'Ya, Hapus!'
        });

        if (result.isConfirmed) {
            try {
                const data = await fetchData();
                data.promoCodes = data.promoCodes.filter(p => p.code !== promoCode);
                await updateData(data);
                
                showAlert('success', 'Berhasil!', 'Kode promo berhasil dihapus');
                this.loadAdminPromos();
            } catch (error) {
                console.error('Error deleting promo:', error);
                showAlert('error', 'Error', 'Gagal menghapus kode promo');
            }
        }
    },

    addPriceField() {
        const container = document.getElementById('priceFields');
        const newField = document.createElement('div');
        newField.className = 'price-field';
        newField.innerHTML = `
            <input type="text" placeholder="Label (contoh: 1 DAYS)" class="price-label">
            <input type="number" placeholder="Harga (Rp)" class="price-value">
            <button class="remove-price" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(newField);
    }
};

// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function() {
    // Load SweetAlert
    const sweetAlertScript = document.createElement('script');
    sweetAlertScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    document.head.appendChild(sweetAlertScript);

    // Check current page and initialize accordingly
    const currentPage = window.location.pathname.split('/').pop();

    // Login page
    if (currentPage === 'index.html' || currentPage === '') {
        document.getElementById('loginBtn')?.addEventListener('click', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            
            await handleLogin(username, password, rememberMe);
        });

        // Enter key press
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('loginBtn')?.click();
            }
        });

        // Check for remembered user
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            document.getElementById('username').value = rememberedUser;
            document.getElementById('rememberMe').checked = true;
        }
    }

    // Register page
    if (currentPage === 'register.html') {
        document.getElementById('registerBtn')?.addEventListener('click', async function(e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            await handleRegister(username, password, confirmPassword);
        });
    }

    // Home page
    if (currentPage === 'home.html') {
        const username = localStorage.getItem('currentUser');
        if (username) {
            document.getElementById('usernameDisplay').textContent = username;
        }

        // Initialize dashboard functions
        window.dashboardFunctions = dashboardFunctions;
        
        // Load data
        dashboardFunctions.loadProducts();
        dashboardFunctions.loadRunningText();
        dashboardFunctions.initFaq();

        // Hamburger menu
        document.getElementById('hamburgerMenu')?.addEventListener('click', function() {
            dashboardFunctions.toggleSidebar();
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
            e.preventDefault();
            Swal.fire({
                title: 'Logout?',
                text: 'Anda akan keluar dari dashboard',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: 'var(--purple-secondary)',
                cancelButtonColor: 'var(--error-color)',
                confirmButtonText: 'Ya, Logout'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('currentUser');
                    window.location.href = 'index.html';
                }
            });
        });
    }

    // Admin page
    if (currentPage === 'admin.html') {
        window.adminFunctions = adminFunctions;
        
        // Load admin data
        adminFunctions.loadAdminProducts();
        adminFunctions.loadAdminPromos();

        // Add price field button
        document.getElementById('addPriceField')?.addEventListener('click', function() {
            adminFunctions.addPriceField();
        });

        // Add product button
        document.getElementById('addProductBtn')?.addEventListener('click', function() {
            adminFunctions.addProduct();
        });

        // Add promo button
        document.getElementById('addPromoBtn')?.addEventListener('click', function() {
            adminFunctions.addPromo();
        });

        // Save running text button
        document.getElementById('saveRunningTextBtn')?.addEventListener('click', function() {
            adminFunctions.saveRunningText();
        });

        // Load current running text
        fetchData().then(data => {
            if (data.settings?.runningText) {
                document.getElementById('runningText').value = data.settings.runningText.text || '';
                document.getElementById('runningTextToggle').checked = data.settings.runningText.enabled || false;
            }
        });

        // Logout admin
        document.getElementById('logoutAdminBtn')?.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const hamburger = document.getElementById('hamburgerMenu');
        
        if (sidebar?.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !hamburger?.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card, .faq-item, .admin-card').forEach(el => {
        observer.observe(el);
    });
});