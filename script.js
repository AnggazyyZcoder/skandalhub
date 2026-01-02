// ===== CONFIGURATION =====
const CONFIG = {
    JSONBIN_ID: '6957a8f8ae596e708fbff5d4', // Ganti dengan ID JSONBin Anda
    JSONBIN_API_KEY: '$2a$10$8ueR8M0Cf0Yf7nsvDMZSKupvmmji6O5V.W988gSb0avOJcn.TdC4q', // Ganti dengan API key JSONBin Anda
    BANNER_ROTATION: {
        gif: { url: 'https://files.catbox.moe/gmd2fk.gif', duration: 15000 },
        jpg: { url: 'https://files.catbox.moe/op6wtn.jpg', duration: 5000 }
    },
    VIDEOS_PER_PAGE: 10,
    MAX_KEY_USES: 30
};

// ===== GLOBAL VARIABLES =====
let currentPage = 1;
let totalPages = 1;
let allVideos = [];
let filteredVideos = [];
let trendingVideos = [];
let currentUserKey = null;
let currentVideoToUnlock = null;
let bannerInterval = null;
let isAdminPage = window.location.pathname.includes('admin.html');

// ===== DOM ELEMENTS =====
const elements = {
    // Loading Screen
    loadingScreen: document.getElementById('loadingScreen'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    
    // Welcome Popup
    welcomePopup: document.getElementById('welcomePopup'),
    closePopup: document.getElementById('closePopup'),
    
    // Search
    searchInput: document.getElementById('searchInput'),
    
    // VIP Modal
    vipModal: document.getElementById('vipModal'),
    closeVipModal: document.getElementById('closeVipModal'),
    vipKeyInput: document.getElementById('vipKeyInput'),
    showKeyBtn: document.getElementById('showKeyBtn'),
    confirmKeyBtn: document.getElementById('confirmKeyBtn'),
    cancelKeyBtn: document.getElementById('cancelKeyBtn'),
    keyMessage: document.getElementById('keyMessage'),
    modalVideoDetails: document.getElementById('modalVideoDetails'),
    keyUsesLeft: document.getElementById('keyUsesLeft'),
    
    // Video Player
    videoPlayerModal: document.getElementById('videoPlayerModal'),
    closePlayer: document.getElementById('closePlayer'),
    mainVideoPlayer: document.getElementById('mainVideoPlayer'),
    playerTitle: document.getElementById('playerTitle'),
    viewsCount: document.getElementById('viewsCount'),
    videoDuration: document.getElementById('videoDuration'),
    likeBtn: document.getElementById('likeBtn'),
    likeCount: document.getElementById('likeCount'),
    
    // Containers
    trendingContainer: document.getElementById('trendingContainer'),
    videosContainer: document.getElementById('videosContainer'),
    adBanner: document.getElementById('adBanner'),
    
    // Pagination
    pagination: document.getElementById('pagination'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    currentPage: document.getElementById('currentPage'),
    totalPages: document.getElementById('totalPages'),
    
    // User Key Status
    userKeyStatus: document.getElementById('userKeyStatus'),
    vipBtn: document.getElementById('vipBtn'),
    
    // Admin Elements
    adminLoading: document.getElementById('adminLoading'),
    logoutBtn: document.getElementById('logoutBtn'),
    uploadForm: document.getElementById('uploadForm'),
    videoName: document.getElementById('videoName'),
    videoLink: document.getElementById('videoLink'),
    videoDurationInput: document.getElementById('videoDuration'),
    videoVIP: document.getElementById('videoVIP'),
    thumbnailLink: document.getElementById('thumbnailLink'),
    submitUpload: document.getElementById('submitUpload'),
    previewTitle: document.getElementById('previewTitle'),
    previewDuration: document.getElementById('previewDuration'),
    previewStatus: document.getElementById('previewStatus'),
    previewThumbnail: document.getElementById('previewThumbnail'),
    previewBadge: document.getElementById('previewBadge'),
    generateKeyBtn: document.getElementById('generateKeyBtn'),
    copyKeyBtn: document.getElementById('copyKeyBtn'),
    keyValue: document.getElementById('keyValue'),
    keysTableBody: document.getElementById('keysTableBody'),
    totalKeys: document.getElementById('totalKeys'),
    totalVideos: document.getElementById('totalVideos'),
    totalViews: document.getElementById('totalViews'),
    totalLikes: document.getElementById('totalLikes'),
    vipVideos: document.getElementById('vipVideos'),
    topVideosList: document.getElementById('topVideosList')
};

// ===== UTILITY FUNCTIONS =====
function showMessage(element, message, type = 'success') {
    element.textContent = message;
    element.className = 'message-container ' + type;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDuration(duration) {
    if (duration.includes('s')) {
        const seconds = parseInt(duration);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return duration;
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

// ===== LOADING SCREEN =====
function initLoadingScreen() {
    if (isAdminPage) {
        setTimeout(() => {
            elements.adminLoading.classList.add('hidden');
        }, 2000);
        return;
    }
    
    let progress = 0;
    const totalFeatures = 30;
    const features = [
        'Menginisialisasi Database Video',
        'Memuat Konten Trending',
        'Menyiapkan Sistem VIP',
        'Mengaktifkan Animasi',
        'Menyiapkan Pencarian',
        'Memuat Banner Iklan',
        'Menyiapkan Video Player',
        'Mengaktifkan Sistem Like',
        'Memuat Konten Baru',
        'Menyiapkan Pagination',
        'Mengaktifkan Responsive Design',
        'Memuat Font & Ikon',
        'Menyiapkan Smooth Scroll',
        'Mengaktifkan Transisi',
        'Memuat Data Pengguna',
        'Menyiapkan LocalStorage',
        'Mengaktifkan Key System',
        'Memuat Popup Welcome',
        'Menyiapkan API Connection',
        'Mengaktifkan Filter Konten',
        'Memuat Thumbnail Video',
        'Menyiapkan Durasi Video',
        'Mengaktifkan Play/Pause',
        'Memuat Statistik',
        'Menyiapkan Admin Panel',
        'Mengaktifkan Upload System',
        'Memuat Generate Key',
        'Menyiapkan Analytics',
        'Mengaktifkan Security',
        'Memuat Footer & Copyright'
    ];
    
    const interval = setInterval(() => {
        progress++;
        const percentage = Math.min((progress / totalFeatures) * 100, 100);
        
        elements.progressFill.style.width = `${percentage}%`;
        elements.progressText.textContent = `Menginisialisasi fitur (${progress}/${totalFeatures})`;
        
        if (progress >= totalFeatures) {
            clearInterval(interval);
            setTimeout(() => {
                elements.loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    elements.welcomePopup.classList.add('active');
                }, 500);
            }, 500);
        }
    }, 150);
}

// ===== WELCOME POPUP =====
function initWelcomePopup() {
    if (elements.closePopup) {
        elements.closePopup.addEventListener('click', () => {
            elements.welcomePopup.classList.remove('active');
            localStorage.setItem('skandalhub_welcome_shown', 'true');
        });
    }
    
    // Cek jika popup sudah pernah ditampilkan
    if (localStorage.getItem('skandalhub_welcome_shown')) {
        elements.welcomePopup.classList.remove('active');
    }
}

// ===== BANNER ROTATION =====
function initBannerRotation() {
    if (!elements.adBanner) return;
    
    const banners = elements.adBanner.querySelectorAll('.banner-img');
    let currentBannerIndex = 0;
    
    function switchBanner() {
        banners.forEach((banner, index) => {
            banner.classList.remove('active');
        });
        
        banners[currentBannerIndex].classList.add('active');
        currentBannerIndex = (currentBannerIndex + 1) % banners.length;
        
        // Set timeout untuk banner berikutnya
        const nextDuration = currentBannerIndex === 0 ? 
            CONFIG.BANNER_ROTATION.gif.duration : 
            CONFIG.BANNER_ROTATION.jpg.duration;
        
        clearInterval(bannerInterval);
        bannerInterval = setTimeout(switchBanner, nextDuration);
    }
    
    // Mulai rotasi
    bannerInterval = setTimeout(switchBanner, CONFIG.BANNER_ROTATION.gif.duration);
}

// ===== JSONBIN API FUNCTIONS =====
async function fetchJSONBinData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_ID}/latest`, {
            headers: {
                'X-Master-Key': CONFIG.JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        
        const data = await response.json();
        return data.record;
    } catch (error) {
        console.error('Error fetching data:', error);
        // Return sample data jika API gagal
        return getSampleData();
    }
}

async function updateJSONBinData(newData) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.JSONBIN_ID}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': CONFIG.JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newData)
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error updating data:', error);
        return false;
    }
}

function getSampleData() {
    return {
        videos: [
            {
                id: 1,
                name: 'ANGGAZYY SERIES EPISODE 1',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=225&fit=crop',
                duration: '1:30',
                vip: true,
                views: 3500,
                likes: 1200,
                uploadDate: '2025-01-15'
            },
            {
                id: 2,
                name: 'PREMIUM CONTENT EXCLUSIVE',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=225&fit=crop',
                duration: '2:15',
                vip: true,
                views: 2800,
                likes: 950,
                uploadDate: '2025-01-14'
            },
            {
                id: 3,
                name: 'GRATIS UNTUK SEMUA - SPECIAL',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=225&fit=crop',
                duration: '45s',
                vip: false,
                views: 5200,
                likes: 2100,
                uploadDate: '2025-01-13'
            },
            {
                id: 4,
                name: 'VIP ONLY - SERIES FINALE',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?w=400&h=225&fit=crop',
                duration: '3:20',
                vip: true,
                views: 1900,
                likes: 800,
                uploadDate: '2025-01-12'
            },
            {
                id: 5,
                name: 'FREE PREVIEW - NEW SERIES',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=400&h=225&fit=crop',
                duration: '1:05',
                vip: false,
                views: 6400,
                likes: 3100,
                uploadDate: '2025-01-11'
            },
            {
                id: 6,
                name: 'EXCLUSIVE VIP CONTENT PART 2',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&h=225&fit=crop',
                duration: '2:45',
                vip: true,
                views: 2200,
                likes: 750,
                uploadDate: '2025-01-10'
            },
            {
                id: 7,
                name: 'GRATIS FULL EPISODE',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=225&fit=crop',
                duration: '1:50',
                vip: false,
                views: 4800,
                likes: 1900,
                uploadDate: '2025-01-09'
            },
            {
                id: 8,
                name: 'VIP SPECIAL EDITION',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=225&fit=crop',
                duration: '4:15',
                vip: true,
                views: 1700,
                likes: 600,
                uploadDate: '2025-01-08'
            },
            {
                id: 9,
                name: 'FREE FOR ALL USERS',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
                duration: '55s',
                vip: false,
                views: 5900,
                likes: 2400,
                uploadDate: '2025-01-07'
            },
            {
                id: 10,
                name: 'VIP ULTIMATE ACCESS',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                thumbnail: 'https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=400&h=225&fit=crop',
                duration: '3:30',
                vip: true,
                views: 2500,
                likes: 900,
                uploadDate: '2025-01-06'
            }
        ],
        keys: [
            {
                key: 'SKH-VIP-2025-ABC123',
                createdAt: '2025-01-01',
                usesLeft: 30,
                isActive: true
            },
            {
                key: 'SKH-VIP-2025-XYZ789',
                createdAt: '2025-01-05',
                usesLeft: 15,
                isActive: true
            }
        ]
    };
}

// ===== VIDEO MANAGEMENT =====
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.dataset.id = video.id;
    
    const isVIP = video.vip;
    const isLocked = isVIP && !currentUserKey;
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail || 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=225&fit=crop'}" 
                 alt="${video.name}" class="thumbnail-img">
            ${isLocked ? '<div class="vip-lock"><i class="fas fa-lock"></i></div>' : ''}
            <div class="video-duration">${formatDuration(video.duration)}</div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.name}</h3>
            <div class="video-stats">
                <div class="stat-item-small">
                    <i class="fas fa-eye"></i>
                    <span>${video.views.toLocaleString()}</span>
                </div>
                <div class="stat-item-small">
                    <i class="fas fa-heart"></i>
                    <span>${video.likes.toLocaleString()}</span>
                </div>
                ${isVIP ? '<div class="vip-badge">VIP</div>' : '<div class="free-badge">FREE</div>'}
            </div>
            <div class="uploaded-by">
                <i class="fas fa-user"></i>
                <span>Uploaded By: <span class="verified">Admin <i class="fas fa-check-circle"></i></span></span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        if (isLocked) {
            showVIPModal(video);
        } else {
            playVideo(video);
        }
    });
    
    // Animasi masuk
    setTimeout(() => {
        card.classList.add('visible');
    }, 100);
    
    return card;
}

function renderVideos() {
    if (!elements.videosContainer) return;
    
    elements.videosContainer.innerHTML = '';
    
    const startIndex = (currentPage - 1) * CONFIG.VIDEOS_PER_PAGE;
    const endIndex = startIndex + CONFIG.VIDEOS_PER_PAGE;
    const videosToShow = filteredVideos.slice(startIndex, endIndex);
    
    videosToShow.forEach(video => {
        elements.videosContainer.appendChild(createVideoCard(video));
    });
    
    updatePagination();
}

function renderTrendingVideos() {
    if (!elements.trendingContainer) return;
    
    elements.trendingContainer.innerHTML = '';
    
    // Urutkan berdasarkan views dan likes
    const trending = [...allVideos]
        .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
        .slice(0, 5);
    
    trending.forEach(video => {
        elements.trendingContainer.appendChild(createVideoCard(video));
    });
}

function updatePagination() {
    if (!elements.pagination) return;
    
    totalPages = Math.ceil(filteredVideos.length / CONFIG.VIDEOS_PER_PAGE);
    
    if (elements.currentPage) elements.currentPage.textContent = currentPage;
    if (elements.totalPages) elements.totalPages.textContent = totalPages;
    if (elements.prevBtn) elements.prevBtn.disabled = currentPage === 1;
    if (elements.nextBtn) elements.nextBtn.disabled = currentPage === totalPages;
}

function searchVideos(query) {
    query = query.toLowerCase().trim();
    
    if (!query) {
        filteredVideos = [...allVideos];
    } else {
        filteredVideos = allVideos.filter(video => 
            video.name.toLowerCase().includes(query)
        );
    }
    
    currentPage = 1;
    renderVideos();
}

// ===== VIP SYSTEM =====
function loadUserKey() {
    currentUserKey = localStorage.getItem('skandalhub_vip_key');
    if (currentUserKey && elements.userKeyStatus) {
        const usesLeft = localStorage.getItem('skandalhub_key_uses') || CONFIG.MAX_KEY_USES;
        elements.userKeyStatus.innerHTML = `
            <i class="fas fa-key"></i>
            <span>Key: ${currentUserKey.substring(0, 8)}... (${usesLeft} uses left)</span>
        `;
    }
}

function showVIPModal(video) {
    currentVideoToUnlock = video;
    
    if (elements.modalVideoDetails) {
        elements.modalVideoDetails.innerHTML = `
            <h3>${video.name}</h3>
            <p>Durasi: <span id="modalDuration">${formatDuration(video.duration)}</span></p>
            <p>Status: <span class="vip-badge">VIP Exclusive</span></p>
        `;
    }
    
    if (elements.vipKeyInput) {
        elements.vipKeyInput.value = currentUserKey || '';
    }
    
    if (elements.keyUsesLeft) {
        const usesLeft = localStorage.getItem('skandalhub_key_uses') || 0;
        elements.keyUsesLeft.textContent = usesLeft;
    }
    
    if (elements.vipModal) {
        elements.vipModal.classList.add('active');
    }
}

function validateVIPKey(key, videoId) {
    // Simulasi validasi key
    // Di implementasi nyata, ini akan memeriksa database JSONBin
    const validKeys = ['SKH-VIP-2025-ABC123', 'SKH-VIP-2025-XYZ789'];
    
    if (!validKeys.includes(key)) {
        return { valid: false, message: 'Key tidak valid!' };
    }
    
    let usesLeft = parseInt(localStorage.getItem('skandalhub_key_uses') || CONFIG.MAX_KEY_USES);
    
    if (usesLeft <= 0) {
        return { valid: false, message: 'Key sudah habis masa pakai!' };
    }
    
    // Kurangi penggunaan key
    usesLeft--;
    localStorage.setItem('skandalhub_key_uses', usesLeft);
    localStorage.setItem('skandalhub_vip_key', key);
    currentUserKey = key;
    
    // Update tampilan key status
    loadUserKey();
    
    return { 
        valid: true, 
        message: 'Key valid! Video sekarang dapat diakses.',
        usesLeft: usesLeft
    };
}

// ===== VIDEO PLAYER =====
function playVideo(video) {
    if (!elements.videoPlayerModal) return;
    
    // Update video info
    if (elements.playerTitle) elements.playerTitle.textContent = video.name;
    if (elements.viewsCount) elements.viewsCount.textContent = video.views.toLocaleString();
    if (elements.videoDuration) elements.videoDuration.textContent = formatDuration(video.duration);
    if (elements.likeCount) elements.likeCount.textContent = video.likes.toLocaleString();
    
    // Set video source
    if (elements.mainVideoPlayer) {
        elements.mainVideoPlayer.src = video.videoUrl;
        elements.mainVideoPlayer.load();
    }
    
    // Update like button state
    const likedVideos = JSON.parse(localStorage.getItem('skandalhub_liked_videos') || '[]');
    const isLiked = likedVideos.includes(video.id);
    
    if (elements.likeBtn) {
        elements.likeBtn.className = isLiked ? 'like-btn liked' : 'like-btn';
        elements.likeBtn.onclick = () => likeVideo(video.id);
    }
    
    // Tambah view count
    video.views++;
    
    // Show player
    elements.videoPlayerModal.classList.add('active');
    
    // Play video
    setTimeout(() => {
        if (elements.mainVideoPlayer) {
            elements.mainVideoPlayer.play().catch(e => console.log('Autoplay prevented:', e));
        }
    }, 500);
}

function likeVideo(videoId) {
    const video = allVideos.find(v => v.id === videoId);
    if (!video) return;
    
    const likedVideos = JSON.parse(localStorage.getItem('skandalhub_liked_videos') || '[]');
    
    if (likedVideos.includes(videoId)) {
        // Unlike
        video.likes--;
        const index = likedVideos.indexOf(videoId);
        likedVideos.splice(index, 1);
        if (elements.likeBtn) elements.likeBtn.classList.remove('liked');
    } else {
        // Like
        video.likes++;
        likedVideos.push(videoId);
        if (elements.likeBtn) elements.likeBtn.classList.add('liked');
    }
    
    localStorage.setItem('skandalhub_liked_videos', JSON.stringify(likedVideos));
    
    // Update like count display
    if (elements.likeCount) {
        elements.likeCount.textContent = video.likes.toLocaleString();
    }
    
    // Update video card
    const videoCard = document.querySelector(`.video-card[data-id="${videoId}"] .stat-item-small:nth-child(2) span`);
    if (videoCard) {
        videoCard.textContent = video.likes.toLocaleString();
    }
    
    // Update trending jika perlu
    renderTrendingVideos();
}

// ===== ADMIN FUNCTIONS =====
function initAdminPage() {
    if (!isAdminPage) return;
    
    // Preview form changes
    if (elements.videoName && elements.previewTitle) {
        elements.videoName.addEventListener('input', () => {
            elements.previewTitle.textContent = elements.videoName.value || 'Nama Video';
        });
    }
    
    if (elements.videoDurationInput && elements.previewDuration) {
        elements.videoDurationInput.addEventListener('input', () => {
            elements.previewDuration.textContent = formatDuration(elements.videoDurationInput.value) || '0:00';
        });
    }
    
    if (elements.videoVIP && elements.previewStatus && elements.previewBadge) {
        elements.videoVIP.addEventListener('change', () => {
            const isVIP = elements.videoVIP.value === 'true';
            elements.previewStatus.textContent = isVIP ? 'VIP Exclusive' : 'Gratis';
            elements.previewBadge.innerHTML = isVIP ? 
                '<span class="vip-badge-preview">VIP</span>' : 
                '<span class="free-badge">FREE</span>';
        });
    }
    
    // Handle form submission
    if (elements.uploadForm) {
        elements.uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newVideo = {
                id: generateUniqueId(),
                name: elements.videoName.value,
                videoUrl: elements.videoLink.value,
                thumbnail: elements.thumbnailLink.value || null,
                duration: elements.videoDurationInput.value,
                vip: elements.videoVIP.value === 'true',
                views: 0,
                likes: 0,
                uploadDate: new Date().toISOString().split('T')[0]
            };
            
            // Tambah ke array videos
            allVideos.unshift(newVideo);
            
            // Reset form
            elements.uploadForm.reset();
            elements.previewTitle.textContent = 'Nama Video';
            elements.previewDuration.textContent = '0:00';
            elements.previewStatus.textContent = 'Gratis';
            elements.previewBadge.innerHTML = '<span class="free-badge">FREE</span>';
            
            // Tampilkan pesan sukses
            alert('Video berhasil diupload!');
            
            // Update analytics
            updateAdminAnalytics();
        });
    }
    
    // Generate key
    if (elements.generateKeyBtn) {
        elements.generateKeyBtn.addEventListener('click', () => {
            const newKey = `SKH-VIP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            
            if (elements.keyValue) {
                elements.keyValue.textContent = newKey;
            }
            
            // Tambah ke daftar keys
            const newKeyObj = {
                key: newKey,
                createdAt: new Date().toISOString().split('T')[0],
                usesLeft: CONFIG.MAX_KEY_USES,
                isActive: true
            };
            
            // Update tampilan
            updateKeysTable(newKeyObj);
        });
    }
    
    // Copy key
    if (elements.copyKeyBtn && elements.keyValue) {
        elements.copyKeyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(elements.keyValue.textContent)
                .then(() => {
                    alert('Key berhasil disalin!');
                })
                .catch(err => {
                    console.error('Gagal menyalin key:', err);
                });
        });
    }
    
    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                window.location.href = 'index.html';
            }
        });
    }
    
    // Load initial data
    updateAdminAnalytics();
    updateKeysTable();
}

function updateAdminAnalytics() {
    if (!isAdminPage) return;
    
    // Hitung statistik
    const totalVideosCount = allVideos.length;
    const totalViewsCount = allVideos.reduce((sum, video) => sum + video.views, 0);
    const totalLikesCount = allVideos.reduce((sum, video) => sum + video.likes, 0);
    const vipVideosCount = allVideos.filter(video => video.vip).length;
    
    // Update tampilan
    if (elements.totalVideos) elements.totalVideos.textContent = totalVideosCount;
    if (elements.totalViews) elements.totalViews.textContent = totalViewsCount.toLocaleString();
    if (elements.totalLikes) elements.totalLikes.textContent = totalLikesCount.toLocaleString();
    if (elements.vipVideos) elements.vipVideos.textContent = vipVideosCount;
    
    // Update top videos
    if (elements.topVideosList) {
        const topVideos = [...allVideos]
            .sort((a, b) => (b.views + b.likes) - (a.views + a.likes))
            .slice(0, 5);
        
        elements.topVideosList.innerHTML = topVideos.map((video, index) => `
            <div class="top-video-item">
                <div class="top-video-rank">${index + 1}</div>
                <div class="top-video-details">
                    <h4>${video.name}</h4>
                    <div class="top-video-stats">
                        <span><i class="fas fa-eye"></i> ${video.views.toLocaleString()} views</span>
                        <span><i class="fas fa-heart"></i> ${video.likes.toLocaleString()} likes</span>
                        <span>${video.vip ? '<i class="fas fa-crown"></i> VIP' : '<i class="fas fa-unlock"></i> FREE'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updateKeysTable(newKey = null) {
    if (!isAdminPage || !elements.keysTableBody) return;
    
    // Simulasi data keys
    const keys = [
        {
            key: 'SKH-VIP-2025-ABC123',
            createdAt: '2025-01-01',
            usesLeft: 30,
            isActive: true
        },
        {
            key: 'SKH-VIP-2025-XYZ789',
            createdAt: '2025-01-05',
            usesLeft: 15,
            isActive: true
        }
    ];
    
    if (newKey) {
        keys.unshift(newKey);
    }
    
    // Update total keys
    if (elements.totalKeys) {
        elements.totalKeys.textContent = keys.length;
    }
    
    // Update tabel
    elements.keysTableBody.innerHTML = keys.map(key => `
        <tr>
            <td><code>${key.key}</code></td>
            <td>${key.createdAt}</td>
            <td>${key.usesLeft}</td>
            <td><span class="${key.isActive ? 'success' : 'error'}">${key.isActive ? 'Aktif' : 'Expired'}</span></td>
        </tr>
    `).join('');
}

// ===== EVENT LISTENERS =====
function initEventListeners() {
    // Search
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce(() => {
            searchVideos(elements.searchInput.value);
        }, 300));
    }
    
    // Pagination
    if (elements.prevBtn) {
        elements.prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderVideos();
            }
        });
    }
    
    if (elements.nextBtn) {
        elements.nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderVideos();
            }
        });
    }
    
    // VIP Modal
    if (elements.closeVipModal) {
        elements.closeVipModal.addEventListener('click', () => {
            elements.vipModal.classList.remove('active');
        });
    }
    
    if (elements.showKeyBtn && elements.vipKeyInput) {
        elements.showKeyBtn.addEventListener('click', () => {
            const type = elements.vipKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
            elements.vipKeyInput.setAttribute('type', type);
            elements.showKeyBtn.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    if (elements.confirmKeyBtn) {
        elements.confirmKeyBtn.addEventListener('click', () => {
            const key = elements.vipKeyInput.value.trim();
            
            if (!key) {
                showMessage(elements.keyMessage, 'Harap masukkan key!', 'error');
                return;
            }
            
            const result = validateVIPKey(key, currentVideoToUnlock?.id);
            
            if (result.valid) {
                showMessage(elements.keyMessage, result.message, 'success');
                
                setTimeout(() => {
                    elements.vipModal.classList.remove('active');
                    if (currentVideoToUnlock) {
                        playVideo(currentVideoToUnlock);
                    }
                }, 1500);
            } else {
                showMessage(elements.keyMessage, result.message, 'error');
            }
        });
    }
    
    if (elements.cancelKeyBtn) {
        elements.cancelKeyBtn.addEventListener('click', () => {
            elements.vipModal.classList.remove('active');
        });
    }
    
    // Video Player
    if (elements.closePlayer) {
        elements.closePlayer.addEventListener('click', () => {
            elements.videoPlayerModal.classList.remove('active');
            if (elements.mainVideoPlayer) {
                elements.mainVideoPlayer.pause();
            }
        });
    }
    
    // VIP Button
    if (elements.vipBtn) {
        elements.vipBtn.addEventListener('click', () => {
            alert('Fitur VIP memberikan akses ke konten eksklusif. Hubungi admin untuk mendapatkan key VIP.');
        });
    }
    
    // Close modals dengan klik di luar
    document.addEventListener('click', (e) => {
        if (elements.vipModal && elements.vipModal.classList.contains('active')) {
            if (e.target === elements.vipModal) {
                elements.vipModal.classList.remove('active');
            }
        }
        
        if (elements.videoPlayerModal && elements.videoPlayerModal.classList.contains('active')) {
            if (e.target === elements.videoPlayerModal) {
                elements.videoPlayerModal.classList.remove('active');
                if (elements.mainVideoPlayer) {
                    elements.mainVideoPlayer.pause();
                }
            }
        }
        
        if (elements.welcomePopup && elements.welcomePopup.classList.contains('active')) {
            if (e.target === elements.welcomePopup) {
                elements.welcomePopup.classList.remove('active');
                localStorage.setItem('skandalhub_welcome_shown', 'true');
            }
        }
    });
}

// ===== INITIALIZATION =====
async function initApp() {
    // Inisialisasi loading screen
    initLoadingScreen();
    
    // Load user key
    loadUserKey();
    
    // Inisialisasi welcome popup
    initWelcomePopup();
    
    // Inisialisasi banner rotation
    initBannerRotation();
    
    // Inisialisasi event listeners
    initEventListeners();
    
    // Load data dari JSONBin
    const data = await fetchJSONBinData();
    allVideos = data.videos || [];
    filteredVideos = [...allVideos];
    
    // Render konten
    renderVideos();
    renderTrendingVideos();
    
    // Inisialisasi admin page jika diperlukan
    if (isAdminPage) {
        initAdminPage();
    }
}

// ===== START APPLICATION =====
document.addEventListener('DOMContentLoaded', initApp);

// ===== FADE IN ANIMATIONS ON SCROLL =====
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
            }
        });
    }, observerOptions);
    
    // Tambahkan class fade-in ke elemen yang diinginkan
    document.querySelectorAll('.video-card, .stat-card, .feature-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Tambahkan CSS untuk fade-in animations
const fadeInStyles = `
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in-visible {
        opacity: 1;
        transform: translateY(0);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = fadeInStyles;
document.head.appendChild(styleSheet);

// Inisialisasi scroll animations setelah halaman dimuat
window.addEventListener('load', () => {
    initScrollAnimations();
});