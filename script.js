// Konfigurasi
const CONFIG = {
    API_KEY: '$2a$10$8ueR8M0Cf0Yf7nsvDMZSKupvmmji6O5V.W988gSb0avOJcn.TdC4q',
    BIN_ID: '6957be4ed0ea881f404f8a0a',
    BIN_URL: 'https://api.jsonbin.io/v3/b/67fcbb61e41b4d34e4f1cfa7',
    DEFAULT_THUMBNAIL: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    BANNER_GIF: 'https://files.catbox.moe/gmd2fk.gif',
    BANNER_IMAGE: 'https://files.catbox.moe/op6wtn.jpg'
};

// State aplikasi
let appState = {
    videos: [],
    keys: [],
    currentVideoPage: 1,
    videosPerPage: 10,
    currentVIPVideo: null,
    userKey: localStorage.getItem('skandalhub_vip_key') || null,
    keyUses: parseInt(localStorage.getItem('skandalhub_key_uses')) || 30,
    likedVideos: JSON.parse(localStorage.getItem('skandalhub_liked_videos')) || [],
    currentAdminSection: 'upload'
};

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    // Cek apakah kita di halaman admin atau utama
    if (window.location.pathname.includes('admin.html')) {
        initAdmin();
    } else {
        initMain();
    }
});

// ===== FUNGSI UTAMA =====

async function initMain() {
    // Simulasi loading screen
    simulateLoading();
    
    // Load data dari JSONBin
    await loadData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup banner rotation
    setupBannerRotation();
    
    // Tampilkan popup welcome setelah loading
    setTimeout(() => {
        document.getElementById('welcomePopup').classList.add('active');
    }, 600);
}

async function initAdmin() {
    // Admin loading
    setTimeout(() => {
        document.getElementById('adminLoading').style.display = 'none';
        document.getElementById('adminContainer').style.opacity = 1;
    }, 1500);
    
    // Load data
    await loadData();
    
    // Setup admin event listeners
    setupAdminEventListeners();
    
    // Tampilkan section upload pertama
    showAdminSection('upload');
    
    // Load data untuk admin
    loadAdminData();
}

// ===== LOADING SCREEN =====

function simulateLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const featureCounter = document.getElementById('featureCounter');
    const progressBar = document.getElementById('progressBar');
    const featuresList = document.getElementById('featuresList');
    
    // Daftar fitur untuk loading
    const features = [
        'Sistem Video Streaming',
        'Database Konten VIP',
        'Player Video HD',
        'Sistem Like & Views',
        'Search Engine',
        'Responsive Design',
        'Animasi Smooth',
        'Dark Mode Purple',
        'User Authentication',
        'Video Thumbnail',
        'Trending Algorithm',
        'Pagination System',
        'Key Management',
        'Admin Dashboard',
        'JSONBin API Integration',
        'Local Storage',
        'Mobile Optimization',
        'WhatsApp Integration',
        'Banner Rotator',
        'Loading Animation',
        'Popup Notification',
        'Video Filter System',
        'VIP Access Control',
        'Video Upload System',
        'Key Generation',
        'Usage Tracking',
        'Statistics Dashboard',
        'Content Management',
        'User Interface',
        'Security Features'
    ];
    
    let loadedFeatures = 0;
    const totalFeatures = features.length;
    
    // Tambahkan fitur ke list
    features.forEach(feature => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-spinner fa-pulse"></i> ${feature}`;
        featuresList.appendChild(li);
    });
    
    // Animasikan loading
    const interval = setInterval(() => {
        loadedFeatures++;
        const progressPercent = (loadedFeatures / totalFeatures) * 100;
        
        // Update counter
        featureCounter.textContent = `${loadedFeatures}/${totalFeatures}`;
        
        // Update progress bar
        progressBar.style.width = `${progressPercent}%`;
        
        // Update feature list
        const featureItems = featuresList.querySelectorAll('li');
        if (featureItems[loadedFeatures - 1]) {
            featureItems[loadedFeatures - 1].innerHTML = `<i class="fas fa-check"></i> ${features[loadedFeatures - 1]}`;
            featureItems[loadedFeatures - 1].classList.add('loaded');
        }
        
        // Selesai loading
        if (loadedFeatures === totalFeatures) {
            clearInterval(interval);
            
            // Tutup loading screen setelah delay
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.visibility = 'hidden';
                
                // Tampilkan main container
                document.getElementById('mainContainer').style.opacity = '1';
                
                // Render video
                renderTrendingVideos();
                renderNewVideos();
            }, 800);
        }
    }, 150);
}

// ===== DATA MANAGEMENT =====

async function loadData() {
    try {
        console.log('Loading data from JSONBin...');
        const response = await fetch(`${CONFIG.BIN_URL}/latest`, {
            headers: {
                'X-Master-Key': CONFIG.API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data loaded from JSONBin:', data);
        
        // Pastikan data memiliki struktur yang benar
        if (!data.record) {
            throw new Error('No record found in JSONBin');
        }
        
        const record = data.record;
        
        // Inisialisasi jika kosong
        if (!record.videos || !Array.isArray(record.videos)) {
            record.videos = [];
            console.log('Videos array initialized as empty');
        }
        
        if (!record.keys || !Array.isArray(record.keys)) {
            record.keys = [];
            console.log('Keys array initialized as empty');
        }
        
        if (!record.lastUpdated) {
            record.lastUpdated = new Date().toISOString();
        }
        
        appState.videos = record.videos;
        appState.keys = record.keys;
        
        console.log(`Loaded ${appState.videos.length} videos and ${appState.keys.length} keys`);
        
        // Simpan untuk admin jika di halaman admin
        if (window.location.pathname.includes('admin.html')) {
            window.adminData = record;
        }
        
        return record;
    } catch (error) {
        console.error('Error loading data from JSONBin:', error);
        
        // Coba load data default dari JSONBin sekali lagi dengan metode berbeda
        try {
            console.log('Trying alternative method to load data...');
            const response = await fetch(CONFIG.BIN_URL, {
                headers: {
                    'X-Master-Key': CONFIG.API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Data loaded with alternative method:', data);
                
                if (data.record) {
                    appState.videos = data.record.videos || [];
                    appState.keys = data.record.keys || [];
                    return data.record;
                }
            }
        } catch (secondError) {
            console.error('Second attempt failed:', secondError);
        }
        
        // Jika masih gagal, gunakan array kosong
        console.log('Using empty arrays as fallback');
        appState.videos = [];
        appState.keys = [];
        
        return { videos: [], keys: [], lastUpdated: new Date().toISOString() };
    }
}

async function saveData() {
    try {
        const data = {
            videos: appState.videos,
            keys: appState.keys,
            lastUpdated: new Date().toISOString()
        };
        
        console.log('Saving data to JSONBin:', data);
        
        const response = await fetch(CONFIG.BIN_URL, {
            method: 'PUT',
            headers: {
                'X-Master-Key': CONFIG.API_KEY,
                'Content-Type': 'application/json',
                'X-Bin-Versioning': 'false'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to save data: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Data saved successfully:', result);
        return true;
    } catch (error) {
        console.error('Error saving data to JSONBin:', error);
        
        // Show error notification
        if (window.location.pathname.includes('admin.html')) {
            showUploadStatus(`Gagal menyimpan ke database: ${error.message}`, 'error');
        } else {
            showNotification(`Gagal menyimpan data: ${error.message}`, 'error');
        }
        
        return false;
    }
}

// ===== VIDEO RENDERING =====

function renderTrendingVideos() {
    const container = document.getElementById('trendingVideos');
    if (!container) return;
    
    // Urutkan video berdasarkan views (trending)
    const trendingVideos = [...appState.videos]
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    
    container.innerHTML = '';
    
    if (trendingVideos.length === 0) {
        container.innerHTML = `
            <div class="no-videos-message">
                <i class="fas fa-video-slash"></i>
                <h3>Belum ada video</h3>
                <p>Upload video pertama Anda dari panel admin</p>
                <a href="admin.html" target="_blank" class="admin-link">
                    <i class="fas fa-user-shield"></i> Buka Admin Panel
                </a>
            </div>
        `;
        return;
    }
    
    trendingVideos.forEach(video => {
        const videoCard = createVideoCard(video);
        container.appendChild(videoCard);
    });
    
    // Update pagination
    updatePagination();
}

function renderNewVideos() {
    const container = document.getElementById('newVideos');
    if (!container) return;
    
    // Filter berdasarkan halaman saat ini
    const startIndex = (appState.currentVideoPage - 1) * appState.videosPerPage;
    const endIndex = startIndex + appState.videosPerPage;
    const pageVideos = appState.videos.slice(startIndex, endIndex);
    
    container.innerHTML = '';
    
    if (pageVideos.length === 0) {
        container.innerHTML = `
            <div class="no-videos-message">
                <i class="fas fa-film"></i>
                <h3>Belum ada konten</h3>
                <p>Tambahkan video baru untuk memulai</p>
            </div>
        `;
        return;
    }
    
    pageVideos.forEach(video => {
        const videoCard = createVideoCard(video);
        container.appendChild(videoCard);
    });
    
    // Update pagination info
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (currentPageEl && totalPagesEl) {
        const totalPages = Math.max(1, Math.ceil(appState.videos.length / appState.videosPerPage));
        currentPageEl.textContent = appState.currentVideoPage;
        totalPagesEl.textContent = totalPages;
        
        // Enable/disable pagination buttons
        if (prevPageBtn) {
            prevPageBtn.disabled = appState.currentVideoPage === 1;
        }
        if (nextPageBtn) {
            nextPageBtn.disabled = appState.currentVideoPage >= totalPages;
        }
    }
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card fade-in';
    card.dataset.id = video.id;
    card.dataset.vip = video.vip;
    
    const isLiked = appState.likedVideos.includes(video.id);
    const likeIcon = isLiked ? 'fas fa-heart' : 'far fa-heart';
    
    // Format durasi
    let durationDisplay = video.duration;
    if (video.duration && video.duration.includes('s')) {
        const seconds = video.duration.replace('s', '');
        durationDisplay = `0:${seconds.padStart(2, '0')}`;
    }
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail || CONFIG.DEFAULT_THUMBNAIL}" alt="${video.name}" onerror="this.src='${CONFIG.DEFAULT_THUMBNAIL}'">
            ${video.vip ? `
                <div class="vip-overlay">
                    <i class="fas fa-lock"></i>
                    <p>VIP CONTENT</p>
                </div>
            ` : ''}
            <div class="video-duration">${durationDisplay || '0:00'}</div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.name || 'Untitled Video'}</h3>
            <div class="video-meta">
                <span class="video-views">
                    <i class="fas fa-eye"></i> ${(video.views || 0).toLocaleString()} views
                </span>
                <span class="video-likes">
                    <i class="${likeIcon}"></i> ${(video.likes || 0).toLocaleString()}
                </span>
            </div>
            <div class="video-uploader">
                <img src="https://ui-avatars.com/api/?name=Admin&background=7c3aed&color=fff" alt="Admin">
                <div>
                    <p>Uploaded By: <strong>Admin</strong> <i class="fas fa-check-circle verified"></i></p>
                </div>
            </div>
            <div class="video-actions">
                <button class="watch-btn" data-action="watch" data-id="${video.id}">
                    <i class="fas fa-play"></i> Watch Now
                </button>
                ${video.vip ? `
                    <button class="vip-btn" data-action="vip" data-id="${video.id}">
                        <i class="fas fa-crown"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// ===== EVENT LISTENERS =====

function setupEventListeners() {
    // Hamburger menu
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navbar = document.getElementById('navbar');
    
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            navbar.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
        });
    }
    
    // Close popup welcome
    const closePopup = document.getElementById('closePopup');
    const welcomePopup = document.getElementById('welcomePopup');
    
    if (closePopup && welcomePopup) {
        closePopup.addEventListener('click', () => {
            welcomePopup.classList.remove('active');
        });
    }
    
    // VIP Access buttons
    document.querySelectorAll('#vipAccess, #vipAccessFooter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            showVIPPopup(null);
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Pagination
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (appState.currentVideoPage > 1) {
                appState.currentVideoPage--;
                renderNewVideos();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(appState.videos.length / appState.videosPerPage);
            if (appState.currentVideoPage < totalPages) {
                appState.currentVideoPage++;
                renderNewVideos();
            }
        });
    }
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter videos
            const filter = this.dataset.filter;
            filterVideos(filter);
        });
    });
    
    // VIP popup close
    const closeVipPopup = document.getElementById('closeVipPopup');
    const vipPopup = document.getElementById('vipPopup');
    
    if (closeVipPopup && vipPopup) {
        closeVipPopup.addEventListener('click', () => {
            vipPopup.classList.remove('active');
        });
    }
    
    // Confirm key button
    const confirmKeyBtn = document.getElementById('confirmKeyBtn');
    if (confirmKeyBtn) {
        confirmKeyBtn.addEventListener('click', validateVIPKey);
    }
    
    // Video modal close
    const closeModal = document.getElementById('closeModal');
    const videoModal = document.getElementById('videoModal');
    
    if (closeModal && videoModal) {
        closeModal.addEventListener('click', () => {
            videoModal.classList.remove('active');
            const videoPlayer = document.getElementById('videoPlayer');
            if (videoPlayer) {
                videoPlayer.pause();
            }
        });
    }
    
    // Like button
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', toggleLike);
    }
    
    // VIP key input enter key
    const vipKeyInput = document.getElementById('vipKeyInput');
    if (vipKeyInput) {
        vipKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                validateVIPKey();
            }
        });
    }
}

// Delegasi event untuk video cards
document.addEventListener('click', function(e) {
    // Watch button
    if (e.target.closest('.watch-btn')) {
        const button = e.target.closest('.watch-btn');
        const videoId = parseInt(button.dataset.id);
        watchVideo(videoId);
    }
    
    // VIP button
    if (e.target.closest('.vip-btn')) {
        const button = e.target.closest('.vip-btn');
        const videoId = parseInt(button.dataset.id);
        showVIPPopup(videoId);
    }
    
    // Video card click (untuk membuka video)
    if (e.target.closest('.video-card') && !e.target.closest('button')) {
        const card = e.target.closest('.video-card');
        const videoId = parseInt(card.dataset.id);
        const isVIP = card.dataset.vip === 'true';
        
        if (isVIP) {
            showVIPPopup(videoId);
        } else {
            watchVideo(videoId);
        }
    }
});

// ===== FUNGSI UTILITAS =====

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        renderNewVideos();
        return;
    }
    
    const filteredVideos = appState.videos.filter(video => 
        video.name && video.name.toLowerCase().includes(query)
    );
    
    const container = document.getElementById('newVideos');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (filteredVideos.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Video tidak ditemukan</h3>
                <p>Coba dengan kata kunci lain</p>
            </div>
        `;
        return;
    }
    
    filteredVideos.forEach(video => {
        const videoCard = createVideoCard(video);
        container.appendChild(videoCard);
    });
    
    // Hide pagination when searching
    const sectionFooter = document.querySelector('.section-footer');
    if (sectionFooter) {
        sectionFooter.style.display = 'none';
    }
}

function filterVideos(filter) {
    const container = document.getElementById('newVideos');
    if (!container) return;
    
    let filteredVideos;
    
    switch(filter) {
        case 'free':
            filteredVideos = appState.videos.filter(video => !video.vip);
            break;
        case 'vip':
            filteredVideos = appState.videos.filter(video => video.vip);
            break;
        default:
            filteredVideos = appState.videos;
    }
    
    container.innerHTML = '';
    
    if (filteredVideos.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-filter"></i>
                <h3>Tidak ada video ${filter === 'vip' ? 'VIP' : 'gratis'}</h3>
                <p>${filter === 'vip' ? 'Upload video VIP dari panel admin' : 'Semua video saat ini adalah VIP'}</p>
            </div>
        `;
        return;
    }
    
    filteredVideos.forEach(video => {
        const videoCard = createVideoCard(video);
        container.appendChild(videoCard);
    });
    
    // Show/hide pagination based on filter
    const sectionFooter = document.querySelector('.section-footer');
    if (sectionFooter) {
        sectionFooter.style.display = filter === 'all' ? 'block' : 'none';
    }
}

function updatePagination() {
    const totalPages = Math.max(1, Math.ceil(appState.videos.length / appState.videosPerPage));
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (currentPageEl) currentPageEl.textContent = appState.currentVideoPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;
    
    // Enable/disable buttons
    if (prevPageBtn) prevPageBtn.disabled = appState.currentVideoPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = appState.currentVideoPage >= totalPages;
}

function watchVideo(videoId) {
    const video = appState.videos.find(v => v.id === videoId);
    if (!video) {
        showNotification('Video tidak ditemukan', 'error');
        return;
    }
    
    // Increment view count
    video.views = (video.views || 0) + 1;
    
    // Save to database
    saveData();
    
    // Update video modal
    const modalTitle = document.getElementById('modalVideoTitle');
    const modalViewCount = document.getElementById('modalViewCount');
    const modalLikeCount = document.getElementById('modalLikeCount');
    
    if (modalTitle) modalTitle.textContent = video.name;
    if (modalViewCount) modalViewCount.textContent = (video.views || 0).toLocaleString();
    if (modalLikeCount) modalLikeCount.textContent = (video.likes || 0).toLocaleString();
    
    // Set video source
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer) {
        videoPlayer.src = video.videoUrl;
    }
    
    // Check if liked
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        const isLiked = appState.likedVideos.includes(videoId);
        if (isLiked) {
            likeBtn.classList.add('liked');
            likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span id="modalLikeCount">${(video.likes || 0).toLocaleString()}</span>`;
        } else {
            likeBtn.classList.remove('liked');
            likeBtn.innerHTML = `<i class="far fa-heart"></i> <span id="modalLikeCount">${(video.likes || 0).toLocaleString()}</span>`;
        }
    }
    
    // Show modal
    const videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.classList.add('active');
    }
    
    // Play video
    setTimeout(() => {
        if (videoPlayer) {
            videoPlayer.play().catch(e => console.log('Autoplay prevented:', e));
        }
    }, 300);
}

function showVIPPopup(videoId) {
    const vipPopup = document.getElementById('vipPopup');
    const videoDetails = document.getElementById('vipVideoDetails');
    
    if (videoId) {
        const video = appState.videos.find(v => v.id === videoId);
        if (!video) {
            showNotification('Video tidak ditemukan', 'error');
            return;
        }
        
        appState.currentVIPVideo = video;
        
        // Update video details
        if (videoDetails) {
            videoDetails.innerHTML = `
                <h3>${video.name}</h3>
                <p><i class="fas fa-clock"></i> Durasi: ${video.duration || '0:00'}</p>
                <p><i class="fas fa-eye"></i> Views: ${(video.views || 0).toLocaleString()}</p>
            `;
        }
    } else {
        appState.currentVIPVideo = null;
        if (videoDetails) {
            videoDetails.innerHTML = `
                <h3>Akses VIP Penuh</h3>
                <p>Dapatkan akses ke semua konten VIP dengan memasukkan kunci Anda</p>
            `;
        }
    }
    
    // Update key usage
    updateKeyUsageDisplay();
    
    // Clear error message
    const errorMessage = document.getElementById('keyErrorMessage');
    if (errorMessage) {
        errorMessage.textContent = '';
    }
    
    // Clear input
    const vipKeyInput = document.getElementById('vipKeyInput');
    if (vipKeyInput) {
        vipKeyInput.value = '';
    }
    
    // Show popup
    if (vipPopup) {
        vipPopup.classList.add('active');
    }
}

function updateKeyUsageDisplay() {
    const remainingUses = appState.keyUses || 0;
    const remainingUsesEl = document.getElementById('remainingUses');
    const usageFillEl = document.getElementById('usageFill');
    const keyStatusEl = document.getElementById('keyStatus');
    
    if (remainingUsesEl) remainingUsesEl.textContent = remainingUses;
    if (usageFillEl) usageFillEl.style.width = `${(remainingUses / 30) * 100}%`;
    
    // Update key status message
    if (keyStatusEl) {
        if (remainingUses <= 0) {
            keyStatusEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Kunci Anda telah habis. Silakan minta kunci baru.`;
            keyStatusEl.style.background = 'rgba(255, 71, 87, 0.2)';
            keyStatusEl.style.color = '#ff4757';
        } else if (remainingUses <= 10) {
            keyStatusEl.innerHTML = `<i class="fas fa-info-circle"></i> Sisa penggunaan: ${remainingUses} dari 30. Segera minta kunci baru.`;
            keyStatusEl.style.background = 'rgba(255, 193, 7, 0.2)';
            keyStatusEl.style.color = '#ffc107';
        } else {
            keyStatusEl.innerHTML = `<i class="fas fa-info-circle"></i> Setiap kunci dapat digunakan untuk membuka 30 video VIP`;
            keyStatusEl.style.background = 'rgba(29, 161, 242, 0.2)';
            keyStatusEl.style.color = '#1da1f2';
        }
    }
}

function validateVIPKey() {
    const keyInput = document.getElementById('vipKeyInput');
    const errorMessage = document.getElementById('keyErrorMessage');
    
    if (!keyInput || !errorMessage) return;
    
    const key = keyInput.value.trim();
    
    // Clear previous error
    errorMessage.textContent = '';
    
    if (!key) {
        errorMessage.textContent = 'Masukkan kunci VIP Anda';
        return;
    }
    
    // Check if key exists in database
    const validKey = appState.keys.find(k => k.key === key && (k.uses || 0) > 0);
    
    if (!validKey) {
        errorMessage.textContent = 'Kunci tidak valid atau sudah habis';
        return;
    }
    
    // Save key to local storage
    localStorage.setItem('skandalhub_vip_key', key);
    
    // Set usage
    appState.userKey = key;
    appState.keyUses = validKey.uses || 0;
    localStorage.setItem('skandalhub_key_uses', appState.keyUses);
    
    // Update key usage in database
    validKey.uses = (validKey.uses || 0) - 1;
    saveData();
    
    // Update display
    updateKeyUsageDisplay();
    
    // If there's a video to unlock, unlock it
    if (appState.currentVIPVideo) {
        unlockVIPVideo(appState.currentVIPVideo.id);
    } else {
        // Just close popup if no specific video
        const vipPopup = document.getElementById('vipPopup');
        if (vipPopup) {
            vipPopup.classList.remove('active');
        }
        showNotification('Kunci VIP berhasil divalidasi!', 'success');
    }
}

function unlockVIPVideo(videoId) {
    // Decrement key uses
    appState.keyUses = Math.max(0, (appState.keyUses || 0) - 1);
    localStorage.setItem('skandalhub_key_uses', appState.keyUses);
    
    // Update key in database
    const keyIndex = appState.keys.findIndex(k => k.key === appState.userKey);
    if (keyIndex !== -1) {
        appState.keys[keyIndex].uses = appState.keyUses;
        
        // Remove key if uses is 0
        if (appState.keyUses <= 0) {
            appState.keys.splice(keyIndex, 1);
            localStorage.removeItem('skandalhub_vip_key');
            localStorage.removeItem('skandalhub_key_uses');
            appState.userKey = null;
            appState.keyUses = 30;
        }
        
        saveData();
    }
    
    // Close VIP popup
    const vipPopup = document.getElementById('vipPopup');
    if (vipPopup) {
        vipPopup.classList.remove('active');
    }
    
    // Watch the video
    watchVideo(videoId);
}

function toggleLike() {
    const likeBtn = document.getElementById('likeBtn');
    const videoTitle = document.getElementById('modalVideoTitle');
    
    if (!likeBtn || !videoTitle) return;
    
    const videoName = videoTitle.textContent;
    
    // Find video by name
    const video = appState.videos.find(v => v.name === videoName);
    if (!video) return;
    
    const videoId = video.id;
    const isLiked = appState.likedVideos.includes(videoId);
    
    if (isLiked) {
        // Unlike
        video.likes = Math.max(0, (video.likes || 0) - 1);
        appState.likedVideos = appState.likedVideos.filter(id => id !== videoId);
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = `<i class="far fa-heart"></i> <span id="modalLikeCount">${(video.likes || 0).toLocaleString()}</span>`;
    } else {
        // Like
        video.likes = (video.likes || 0) + 1;
        appState.likedVideos.push(videoId);
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span id="modalLikeCount">${(video.likes || 0).toLocaleString()}</span>`;
    }
    
    // Save to localStorage
    localStorage.setItem('skandalhub_liked_videos', JSON.stringify(appState.likedVideos));
    
    // Save to database
    saveData();
    
    // Update trending videos
    renderTrendingVideos();
}

function setupBannerRotation() {
    const bannerImage = document.getElementById('bannerImage');
    if (!bannerImage) return;
    
    let isGif = true;
    
    setInterval(() => {
        if (isGif) {
            // Switch to image after 15 seconds
            bannerImage.src = CONFIG.BANNER_IMAGE;
            isGif = false;
        } else {
            // Switch back to gif after 5 seconds
            bannerImage.src = CONFIG.BANNER_GIF;
            isGif = true;
        }
    }, isGif ? 15000 : 5000);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(90deg, #7c3aed, #9d4edd);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                transform: translateX(120%);
                transition: transform 0.3s ease;
            }
            
            .notification-success {
                background: linear-gradient(90deg, #27ae60, #2ecc71);
            }
            
            .notification-error {
                background: linear-gradient(90deg, #ff4757, #ff6b81);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1rem;
                margin-left: 1rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// ===== ADMIN FUNCTIONS =====

function setupAdminEventListeners() {
    // Admin menu navigation
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showAdminSection(sectionId);
            
            // Update active menu item
            document.querySelectorAll('.admin-menu li').forEach(li => li.classList.remove('active'));
            this.parentElement.classList.add('active');
        });
    });
    
    // Upload form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
    
    // VIP toggle
    const toggleFree = document.getElementById('toggleFree');
    const toggleVIP = document.getElementById('toggleVIP');
    const vipHiddenInput = document.getElementById('videoVIP');
    
    if (toggleFree && toggleVIP) {
        toggleFree.addEventListener('click', () => {
            toggleFree.classList.add('active');
            toggleVIP.classList.remove('active');
            if (vipHiddenInput) vipHiddenInput.value = 'false';
        });
        
        toggleVIP.addEventListener('click', () => {
            toggleVIP.classList.add('active');
            toggleFree.classList.remove('active');
            if (vipHiddenInput) vipHiddenInput.value = 'true';
        });
    }
    
    // Generate key button
    const generateKeyBtn = document.getElementById('generateKeyBtn');
    if (generateKeyBtn) {
        generateKeyBtn.addEventListener('click', generateKey);
    }
    
    // Copy key button
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    if (copyKeyBtn) {
        copyKeyBtn.addEventListener('click', copyKey);
    }
    
    // Search content
    const searchContent = document.getElementById('searchContent');
    if (searchContent) {
        searchContent.addEventListener('input', filterAdminContent);
    }
    
    // Filter content type
    const filterType = document.getElementById('filterType');
    if (filterType) {
        filterType.addEventListener('change', filterAdminContent);
    }
    
    // Search key
    const searchKey = document.getElementById('searchKey');
    if (searchKey) {
        searchKey.addEventListener('input', filterAdminKeys);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

function showAdminSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        appState.currentAdminSection = sectionId;
        
        // Load section-specific data
        if (sectionId === 'manage') {
            loadContentTable();
        } else if (sectionId === 'keys') {
            loadKeysTable();
        } else if (sectionId === 'stats') {
            loadStats();
        }
    }
}

async function handleUpload(e) {
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('videoName')?.value;
    const videoUrl = document.getElementById('videoLink')?.value;
    const duration = document.getElementById('videoDuration')?.value;
    const vipHiddenInput = document.getElementById('videoVIP');
    const isVIP = vipHiddenInput ? vipHiddenInput.value === 'true' : false;
    const thumbnail = document.getElementById('thumbnailLink')?.value || CONFIG.DEFAULT_THUMBNAIL;
    
    // Validation
    if (!name || !videoUrl || !duration) {
        showUploadStatus('Semua field wajib diisi!', 'error');
        return;
    }
    
    // Generate new ID
    const newId = appState.videos.length > 0 
        ? Math.max(...appState.videos.map(v => v.id)) + 1 
        : 1;
    
    // Create new video object
    const newVideo = {
        id: newId,
        name: name,
        videoUrl: videoUrl,
        thumbnail: thumbnail,
        duration: duration,
        vip: isVIP,
        views: 0,
        likes: 0,
        uploadDate: new Date().toISOString().split('T')[0]
    };
    
    // Add to videos array
    appState.videos.unshift(newVideo);
    
    // Save to database
    const success = await saveData();
    
    if (success) {
        showUploadStatus(`Video "${name}" berhasil diupload!`, 'success');
        
        // Reset form
        e.target.reset();
        
        // Reset VIP toggle
        const toggleFree = document.getElementById('toggleFree');
        const toggleVIP = document.getElementById('toggleVIP');
        if (toggleFree && toggleVIP) {
            toggleFree.classList.add('active');
            toggleVIP.classList.remove('active');
        }
        if (vipHiddenInput) {
            vipHiddenInput.value = 'false';
        }
        
        // Update content table if visible
        if (appState.currentAdminSection === 'manage') {
            loadContentTable();
        }
        
        // Update stats if visible
        if (appState.currentAdminSection === 'stats') {
            loadStats();
        }
    } else {
        showUploadStatus('Gagal menyimpan video. Coba lagi.', 'error');
    }
}

function showUploadStatus(message, type) {
    const uploadStatus = document.getElementById('uploadStatus');
    if (!uploadStatus) return;
    
    uploadStatus.innerHTML = `
        <div class="status-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        </div>
    `;
    
    uploadStatus.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        uploadStatus.style.display = 'none';
    }, 5000);
}

function generateKey() {
    // Generate random key
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    
    for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Format key for display (XXXX-XXXX-XXXX-XXXX)
    const formattedKey = key.match(/.{1,4}/g).join('-');
    
    // Display key
    const keyValueEl = document.getElementById('keyValue');
    if (keyValueEl) {
        keyValueEl.textContent = formattedKey;
    }
    
    // Add to keys array
    const newKey = {
        key: formattedKey,
        created: new Date().toISOString(),
        uses: 30,
        active: true
    };
    
    appState.keys.push(newKey);
    
    // Save to database
    saveData();
    
    // Update keys table
    loadKeysTable();
    
    // Show notification
    showNotification('Kunci VIP baru berhasil dibuat!', 'success');
}

function copyKey() {
    const keyValueEl = document.getElementById('keyValue');
    if (!keyValueEl) return;
    
    const keyValue = keyValueEl.textContent;
    
    if (keyValue && !keyValue.includes('Klik')) {
        navigator.clipboard.writeText(keyValue)
            .then(() => {
                showNotification('Kunci berhasil disalin!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy:', err);
                showNotification('Gagal menyalin kunci', 'error');
            });
    }
}

function loadAdminData() {
    // Load content table
    loadContentTable();
    
    // Load keys table
    loadKeysTable();
    
    // Load stats
    loadStats();
}

function loadContentTable() {
    const tableBody = document.getElementById('contentTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (appState.videos.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-film" style="font-size: 2rem; color: #9d4edd; margin-bottom: 1rem; display: block;"></i>
                    <p>Belum ada video. Upload video pertama Anda!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    appState.videos.forEach(video => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${video.id || ''}</td>
            <td>${video.name || 'Untitled'}</td>
            <td>${video.duration || '0:00'}</td>
            <td><span class="${video.vip ? 'vip-badge' : 'free-badge'}">${video.vip ? 'VIP' : 'FREE'}</span></td>
            <td>${(video.views || 0).toLocaleString()}</td>
            <td>${(video.likes || 0).toLocaleString()}</td>
            <td class="table-actions">
                <button class="action-btn edit-btn" data-id="${video.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${video.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update stats
    const totalVideosEl = document.getElementById('totalVideos');
    const totalVIPEl = document.getElementById('totalVIP');
    const totalFreeEl = document.getElementById('totalFree');
    
    if (totalVideosEl) totalVideosEl.textContent = appState.videos.length;
    if (totalVIPEl) totalVIPEl.textContent = appState.videos.filter(v => v.vip).length;
    if (totalFreeEl) totalFreeEl.textContent = appState.videos.filter(v => !v.vip).length;
    
    // Add event listeners for action buttons
    tableBody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const videoId = parseInt(this.dataset.id);
            editVideo(videoId);
        });
    });
    
    tableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const videoId = parseInt(this.dataset.id);
            deleteVideo(videoId);
        });
    });
}

function filterAdminContent() {
    const searchContent = document.getElementById('searchContent');
    const filterType = document.getElementById('filterType');
    
    if (!searchContent || !filterType) return;
    
    const searchQuery = searchContent.value.toLowerCase();
    const filterValue = filterType.value;
    
    const tableBody = document.getElementById('contentTableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const name = row.cells[1]?.textContent?.toLowerCase() || '';
        const typeCell = row.cells[3];
        const type = typeCell?.querySelector('span')?.textContent?.trim() || '';
        
        let matchesSearch = true;
        let matchesType = true;
        
        if (searchQuery) {
            matchesSearch = name.includes(searchQuery);
        }
        
        if (filterValue !== 'all') {
            const typeText = filterValue === 'vip' ? 'VIP' : 'FREE';
            matchesType = type === typeText;
        }
        
        row.style.display = matchesSearch && matchesType ? '' : 'none';
    });
}

function editVideo(videoId) {
    // Find video
    const video = appState.videos.find(v => v.id === videoId);
    if (!video) return;
    
    // Switch to upload section and populate form
    showAdminSection('upload');
    
    // Populate form
    const videoNameInput = document.getElementById('videoName');
    const videoLinkInput = document.getElementById('videoLink');
    const videoDurationInput = document.getElementById('videoDuration');
    const thumbnailLinkInput = document.getElementById('thumbnailLink');
    
    if (videoNameInput) videoNameInput.value = video.name || '';
    if (videoLinkInput) videoLinkInput.value = video.videoUrl || '';
    if (videoDurationInput) videoDurationInput.value = video.duration || '';
    if (thumbnailLinkInput) thumbnailLinkInput.value = video.thumbnail || '';
    
    // Set VIP toggle
    const toggleFree = document.getElementById('toggleFree');
    const toggleVIP = document.getElementById('toggleVIP');
    const vipHiddenInput = document.getElementById('videoVIP');
    
    if (video.vip) {
        if (toggleVIP) toggleVIP.click();
    } else {
        if (toggleFree) toggleFree.click();
    }
    
    // Scroll to form
    const uploadSection = document.getElementById('upload');
    if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Show message
    showUploadStatus(`Mengedit video "${video.name}". Ubah dan submit untuk memperbarui.`, 'info');
}

async function deleteVideo(videoId) {
    if (!confirm('Apakah Anda yakin ingin menghapus video ini?')) {
        return;
    }
    
    // Remove video from array
    const videoIndex = appState.videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) return;
    
    const videoName = appState.videos[videoIndex].name;
    appState.videos.splice(videoIndex, 1);
    
    // Save to database
    const success = await saveData();
    
    if (success) {
        // Reload table
        loadContentTable();
        
        // Update stats
        loadStats();
        
        showNotification(`Video "${videoName}" berhasil dihapus!`, 'success');
    } else {
        showNotification('Gagal menghapus video', 'error');
    }
}

function loadKeysTable() {
    const tableBody = document.getElementById('keysTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (appState.keys.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem;">
                    <i class="fas fa-key" style="font-size: 2rem; color: #9d4edd; margin-bottom: 1rem; display: block;"></i>
                    <p>Belum ada kunci VIP. Generate kunci baru!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    appState.keys.forEach(key => {
        const row = document.createElement('tr');
        const createdDate = key.created ? new Date(key.created).toLocaleDateString('id-ID') : 'N/A';
        const uses = key.uses || 0;
        const status = uses > 0 ? 'active' : 'expired';
        
        row.innerHTML = `
            <td>${key.key || ''}</td>
            <td>${createdDate}</td>
            <td>${uses}/30</td>
            <td><span class="${status}-key">${status === 'active' ? 'AKTIF' : 'HABIS'}</span></td>
            <td class="table-actions">
                <button class="action-btn delete-btn" data-key="${key.key}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners for delete buttons
    tableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const keyValue = this.dataset.key;
            deleteKey(keyValue);
        });
    });
}

function filterAdminKeys() {
    const searchKeyInput = document.getElementById('searchKey');
    if (!searchKeyInput) return;
    
    const searchQuery = searchKeyInput.value.toLowerCase();
    
    const tableBody = document.getElementById('keysTableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const key = row.cells[0]?.textContent?.toLowerCase() || '';
        const matchesSearch = searchQuery ? key.includes(searchQuery) : true;
        row.style.display = matchesSearch ? '' : 'none';
    });
}

async function deleteKey(keyValue) {
    if (!confirm('Apakah Anda yakin ingin menghapus kunci ini?')) {
        return;
    }
    
    // Remove key from array
    const keyIndex = appState.keys.findIndex(k => k.key === keyValue);
    if (keyIndex === -1) return;
    
    appState.keys.splice(keyIndex, 1);
    
    // Save to database
    const success = await saveData();
    
    if (success) {
        // Reload table
        loadKeysTable();
        showNotification('Kunci berhasil dihapus!', 'success');
    } else {
        showNotification('Gagal menghapus kunci', 'error');
    }
}

function loadStats() {
    // Update stat cards
    const totalVideosStatEl = document.getElementById('totalVideosStat');
    const totalViewsEl = document.getElementById('totalViews');
    const totalLikesEl = document.getElementById('totalLikes');
    const totalVIPStatEl = document.getElementById('totalVIPStat');
    
    if (totalVideosStatEl) totalVideosStatEl.textContent = appState.videos.length;
    
    const totalViews = appState.videos.reduce((sum, video) => sum + (video.views || 0), 0);
    if (totalViewsEl) totalViewsEl.textContent = totalViews.toLocaleString();
    
    const totalLikes = appState.videos.reduce((sum, video) => sum + (video.likes || 0), 0);
    if (totalLikesEl) totalLikesEl.textContent = totalLikes.toLocaleString();
    
    const totalVIP = appState.videos.filter(v => v.vip).length;
    if (totalVIPStatEl) totalVIPStatEl.textContent = totalVIP;
    
    // Create charts
    createTrendingChart();
    createTypeChart();
}

function createTrendingChart() {
    const ctx = document.getElementById('trendingChart');
    if (!ctx) return;
    
    // Get top 5 trending videos
    const trendingVideos = [...appState.videos]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
    
    // Jika tidak ada video, tampilkan chart kosong
    if (trendingVideos.length === 0) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Views',
                    data: [0],
                    backgroundColor: ['rgba(157, 78, 221, 0.8)'],
                    borderColor: ['rgba(157, 78, 221, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e0aaff'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#c77dff'
                        },
                        grid: {
                            color: 'rgba(157, 78, 221, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#c77dff'
                        },
                        grid: {
                            color: 'rgba(157, 78, 221, 0.1)'
                        }
                    }
                }
            }
        });
        return;
    }
    
    const labels = trendingVideos.map(v => {
        const name = v.name || 'Untitled';
        return name.length > 15 ? name.substring(0, 15) + '...' : name;
    });
    const views = trendingVideos.map(v => v.views || 0);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Views',
                data: views,
                backgroundColor: [
                    'rgba(157, 78, 221, 0.8)',
                    'rgba(124, 58, 237, 0.8)',
                    'rgba(199, 125, 255, 0.8)',
                    'rgba(224, 170, 255, 0.8)',
                    'rgba(245, 230, 255, 0.8)'
                ],
                borderColor: [
                    'rgba(157, 78, 221, 1)',
                    'rgba(124, 58, 237, 1)',
                    'rgba(199, 125, 255, 1)',
                    'rgba(224, 170, 255, 1)',
                    'rgba(245, 230, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e0aaff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#c77dff'
                    },
                    grid: {
                        color: 'rgba(157, 78, 221, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#c77dff'
                    },
                    grid: {
                        color: 'rgba(157, 78, 221, 0.1)'
                    }
                }
            }
        }
    });
}

function createTypeChart() {
    const ctx = document.getElementById('typeChart');
    if (!ctx) return;
    
    const vipCount = appState.videos.filter(v => v.vip).length;
    const freeCount = appState.videos.length - vipCount;
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['VIP', 'Gratis'],
            datasets: [{
                data: [vipCount, freeCount],
                backgroundColor: [
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(37, 211, 102, 0.8)'
                ],
                borderColor: [
                    'rgba(255, 215, 0, 1)',
                    'rgba(37, 211, 102, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e0aaff'
                    }
                }
            }
        }
    });
}