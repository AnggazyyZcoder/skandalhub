// Configuration
const CONFIG = {
    API_KEY: '$2a$10$EG.QfA7ThwjokzPkTJ4hKuO6pCKkBd6wjKDK2LzLvR/pFm0OE6nVm',
    BIN_ID: '6957d2b9ae596e708fc03eca', // You need to create this in JSONBin
    API_URL: 'https://api.jsonbin.io/v3/b',
    DEFAULT_BIN: {
        videos: [],
        keys: [],
        settings: {
            lastUpdated: new Date().toISOString(),
            totalViews: 0,
            totalLikes: 0
        }
    }
};

// State Management
let state = {
    videos: [],
    keys: [],
    currentPage: 1,
    itemsPerPage: 10,
    userKey: localStorage.getItem('skandalhub_key') || null,
    keyUsage: JSON.parse(localStorage.getItem('key_usage') || '{}'),
    currentVideoId: null
};

// DOM Elements
let elements = {};

// Initialize App
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize DOM elements based on current page
    if (document.querySelector('.loading-screen')) {
        initializeIndexPage();
    } else if (document.querySelector('.admin-loading')) {
        initializeAdminPage();
    }
});

// ===== INDEX PAGE FUNCTIONS =====
async function initializeIndexPage() {
    elements = {
        loadingScreen: document.getElementById('loadingScreen'),
        progressCount: document.getElementById('progressCount'),
        progressFill: document.getElementById('progressFill'),
        featuresList: document.getElementById('featuresList'),
        welcomePopup: document.getElementById('welcomePopup'),
        closePopup: document.getElementById('closePopup'),
        mainContainer: document.getElementById('mainContainer'),
        menuToggle: document.getElementById('menuToggle'),
        closeNav: document.getElementById('closeNav'),
        mobileNav: document.getElementById('mobileNav'),
        adContainer: document.getElementById('adContainer'),
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        trendingGrid: document.getElementById('trendingGrid'),
        newGrid: document.getElementById('newGrid'),
        prevTrending: document.getElementById('prevTrending'),
        nextTrending: document.getElementById('nextTrending'),
        prevNew: document.getElementById('prevNew'),
        nextNew: document.getElementById('nextNew'),
        vipModal: document.getElementById('vipModal'),
        vipVideoInfo: document.getElementById('vipVideoInfo'),
        vipKey: document.getElementById('vipKey'),
        keyStatus: document.getElementById('keyStatus'),
        confirmKey: document.getElementById('confirmKey'),
        closeVipModal: document.getElementById('closeVipModal'),
        cancelVip: document.getElementById('cancelVip'),
        keyRemaining: document.getElementById('keyRemaining'),
        vipAccessBtn: document.getElementById('vipAccessBtn')
    };

    // Start loading sequence
    await startLoadingSequence();
    
    // Load data
    await loadData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize ad rotation
    initializeAdRotation();
    
    // Check and show welcome popup
    if (!localStorage.getItem('welcome_shown')) {
        setTimeout(() => {
            elements.welcomePopup.style.display = 'block';
        }, 1000);
    }
}

async function startLoadingSequence() {
    const features = [
        'Video Player System',
        'VIP Access Control',
        'Database Connection',
        'JSONBin API Sync',
        'User Authentication',
        'Video Streaming',
        'Like System',
        'View Counter',
        'Search Functionality',
        'Trending Algorithm',
        'Responsive Design',
        'Mobile Optimization',
        'Loading Animations',
        'Smooth Transitions',
        'Ad Management',
        'Key Generation',
        'User Interface',
        'Admin Dashboard',
        'Video Upload',
        'Content Management',
        'Security System',
        'Data Validation',
        'Error Handling',
        'Local Storage',
        'Session Management',
        'Performance Optimization',
        'Cache System',
        'Real-time Updates',
        'Analytics Tracking',
        'Backup System'
    ];

    let progress = 0;
    
    // Animate features
    features.forEach((feature, index) => {
        setTimeout(() => {
            const featureItem = document.createElement('div');
            featureItem.className = 'feature-item';
            featureItem.textContent = `✓ ${feature}`;
            featureItem.style.animationDelay = `${index * 100}ms`;
            elements.featuresList.appendChild(featureItem);
            
            // Update progress
            progress = Math.floor(((index + 1) / features.length) * 100);
            elements.progressCount.textContent = `${index + 1}`;
            elements.progressFill.style.width = `${progress}%`;
            
            // Check if loading is complete
            if (index === features.length - 1) {
                setTimeout(() => {
                    elements.loadingScreen.style.opacity = '0';
                    elements.loadingScreen.style.visibility = 'hidden';
                    elements.mainContainer.style.display = 'block';
                }, 1000);
            }
        }, index * 100);
    });
}

async function loadData() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/${CONFIG.BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': CONFIG.API_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        
        const data = await response.json();
        state.videos = data.videos || [];
        state.keys = data.keys || [];
        
        // Render videos
        renderVideos();
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to sample data if API fails
        state.videos = getSampleVideos();
        renderVideos();
    }
}

function renderVideos() {
    // Sort videos by views for trending
    const trendingVideos = [...state.videos]
        .sort((a, b) => b.countClick - a.countClick)
        .slice(0, 10);
    
    // Sort videos by ID (newest first) for new content
    const newVideos = [...state.videos]
        .sort((a, b) => b.id - a.id)
        .slice(0, 10);
    
    // Render trending videos
    renderVideoGrid(trendingVideos, elements.trendingGrid);
    
    // Render new videos
    renderVideoGrid(newVideos, elements.newGrid);
}

function renderVideoGrid(videos, container) {
    container.innerHTML = '';
    
    videos.forEach(video => {
        const videoCard = createVideoCard(video);
        container.appendChild(videoCard);
    });
}

function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card fade-in';
    card.dataset.id = video.id;
    
    const isVip = video.vip === true || video.vip === 'true';
    const views = video.countClick || 0;
    const likes = video.likes || 0;
    
    card.innerHTML = `
        <div class="video-thumbnail">
            ${isVip ? `
                <div class="vip-lock">
                    <i class="fas fa-lock"></i>
                    <p>VIP Only</p>
                </div>
            ` : ''}
            <img src="https://files.catbox.moe/placeholder.jpg" alt="${video.nama}" onerror="this.src='https://via.placeholder.com/300x200?text=Video+Thumbnail'">
        </div>
        <div class="video-info">
            <div class="video-title">
                <span>${video.nama}</span>
                ${isVip ? '<span class="vip-badge">VIP</span>' : ''}
            </div>
            <div class="video-meta">
                <div class="duration">
                    <i class="fas fa-clock"></i> ${video.durasi || 'N/A'}
                </div>
                <div class="views">
                    <i class="fas fa-eye"></i> ${formatNumber(views)}
                </div>
            </div>
            <div class="uploader">
                <span>Uploaded By: Admin</span>
                <i class="fas fa-check-circle verified"></i>
            </div>
        </div>
    `;
    
    // Add click event
    card.addEventListener('click', () => handleVideoClick(video));
    
    return card;
}

function handleVideoClick(video) {
    if (video.vip === true || video.vip === 'true') {
        // Show VIP unlock modal
        state.currentVideoId = video.id;
        elements.vipVideoInfo.innerHTML = `
            <h4>${video.nama}</h4>
            <p>Duration: ${video.durasi}</p>
            <p>Views: ${formatNumber(video.countClick || 0)}</p>
        `;
        
        // Check if user has key and remaining uses
        if (state.userKey && state.keyUsage[state.userKey]) {
            elements.keyRemaining.textContent = state.keyUsage[state.userKey];
            elements.vipKey.value = state.userKey;
        } else {
            elements.keyRemaining.textContent = '0';
            elements.vipKey.value = '';
        }
        
        elements.vipModal.classList.add('active');
    } else {
        // Direct access to free video
        window.location.href = `video.html?id=${video.id}`;
    }
}

function setupEventListeners() {
    // Close welcome popup
    elements.closePopup?.addEventListener('click', () => {
        elements.welcomePopup.style.animation = 'slideInDown 0.5s ease reverse';
        setTimeout(() => {
            elements.welcomePopup.style.display = 'none';
            localStorage.setItem('welcome_shown', 'true');
        }, 500);
    });

    // Mobile menu toggle
    elements.menuToggle?.addEventListener('click', () => {
        elements.mobileNav.classList.add('active');
    });

    elements.closeNav?.addEventListener('click', () => {
        elements.mobileNav.classList.remove('active');
    });

    // Close modal when clicking outside
    elements.vipModal?.addEventListener('click', (e) => {
        if (e.target === elements.vipModal) {
            closeVipModal();
        }
    });

    elements.closeVipModal?.addEventListener('click', closeVipModal);
    elements.cancelVip?.addEventListener('click', closeVipModal);

    // Confirm VIP key
    elements.confirmKey?.addEventListener('click', async () => {
        const key = elements.vipKey.value.trim();
        if (!key) {
            showKeyStatus('Please enter a key', 'error');
            return;
        }

        // Check if key exists and has remaining uses
        const keyData = state.keys.find(k => k.key === key);
        if (!keyData) {
            showKeyStatus('Invalid key', 'error');
            return;
        }

        if (keyData.remaining <= 0) {
            showKeyStatus('Key has expired', 'error');
            // Remove expired key
            state.keys = state.keys.filter(k => k.key !== key);
            await updateDatabase();
            return;
        }

        // Valid key - decrement remaining uses
        keyData.remaining--;
        state.userKey = key;
        state.keyUsage[key] = keyData.remaining;
        
        // Save to localStorage
        localStorage.setItem('skandalhub_key', key);
        localStorage.setItem('key_usage', JSON.stringify(state.keyUsage));
        
        // Update database
        await updateDatabase();
        
        // Show success and redirect to video
        showKeyStatus('Access granted! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = `video.html?id=${state.currentVideoId}`;
        }, 1000);
    });

    // Search functionality
    elements.searchBtn?.addEventListener('click', handleSearch);
    elements.searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Pagination buttons
    elements.prevTrending?.addEventListener('click', () => navigatePage('trending', -1));
    elements.nextTrending?.addEventListener('click', () => navigatePage('trending', 1));
    elements.prevNew?.addEventListener('click', () => navigatePage('new', -1));
    elements.nextNew?.addEventListener('click', () => navigatePage('new', 1));

    // VIP access button
    elements.vipAccessBtn?.addEventListener('click', () => {
        alert('Please contact admin for VIP access key');
    });
}

function closeVipModal() {
    elements.vipModal.classList.remove('active');
    elements.keyStatus.textContent = '';
    elements.vipKey.value = '';
}

function showKeyStatus(message, type) {
    elements.keyStatus.textContent = message;
    elements.keyStatus.className = 'key-status ' + type;
}

function handleSearch() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    if (!searchTerm) return;

    const filteredVideos = state.videos.filter(video =>
        video.nama.toLowerCase().includes(searchTerm)
    );

    // Clear current grids and show search results
    elements.trendingGrid.innerHTML = '<h3>Search Results</h3>';
    renderVideoGrid(filteredVideos, elements.trendingGrid);
}

function navigatePage(section, direction) {
    // Implement pagination logic here
    console.log(`Navigate ${section} page ${direction > 0 ? 'forward' : 'backward'}`);
}

function initializeAdRotation() {
    const ads = [
        { type: 'gif', src: 'https://files.catbox.moe/gmd2fk.gif', duration: 15000 },
        { type: 'image', src: 'https://files.catbox.moe/op6wtn.jpg', duration: 5000 }
    ];
    
    let currentAdIndex = 0;
    
    function showNextAd() {
        const ad = ads[currentAdIndex];
        elements.adContainer.innerHTML = `
            <img src="${ad.src}" alt="Advertisement" 
                 style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;">
        `;
        
        currentAdIndex = (currentAdIndex + 1) % ads.length;
        setTimeout(showNextAd, ad.duration);
    }
    
    showNextAd();
}

// ===== ADMIN PAGE FUNCTIONS =====
async function initializeAdminPage() {
    elements = {
        adminLoading: document.getElementById('adminLoading'),
        adminContainer: document.getElementById('adminContainer'),
        totalVideos: document.getElementById('totalVideos'),
        vipVideos: document.getElementById('vipVideos'),
        totalViews: document.getElementById('totalViews'),
        activeKeys: document.getElementById('activeKeys'),
        uploadForm: document.getElementById('uploadForm'),
        videoName: document.getElementById('videoName'),
        videoLink: document.getElementById('videoLink'),
        videoDuration: document.getElementById('videoDuration'),
        isVip: document.getElementById('isVip'),
        vipStatusText: document.getElementById('vipStatusText'),
        uploadBtn: document.getElementById('uploadBtn'),
        resetForm: document.getElementById('resetForm'),
        generateKeyBtn: document.getElementById('generateKeyBtn'),
        keyCount: document.getElementById('keyCount'),
        keysList: document.getElementById('keysList'),
        searchVideos: document.getElementById('searchVideos'),
        filterVip: document.getElementById('filterVip'),
        videosTableBody: document.getElementById('videosTableBody'),
        successModal: document.getElementById('successModal'),
        errorModal: document.getElementById('errorModal'),
        successMessage: document.getElementById('successMessage'),
        errorMessage: document.getElementById('errorMessage'),
        closeSuccessModal: document.getElementById('closeSuccessModal'),
        closeErrorModal: document.getElementById('closeErrorModal'),
        okSuccessBtn: document.getElementById('okSuccessBtn'),
        okErrorBtn: document.getElementById('okErrorBtn'),
        goHome: document.getElementById('goHome'),
        logoutBtn: document.getElementById('logoutBtn'),
        lastUpdated: document.getElementById('lastUpdated')
    };

    // Load admin data
    await loadAdminData();
    
    // Setup admin event listeners
    setupAdminEventListeners();
    
    // Hide loading screen
    elements.adminLoading.style.display = 'none';
    elements.adminContainer.style.display = 'block';
}

async function loadAdminData() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/${CONFIG.BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': CONFIG.API_KEY,
                'X-Bin-Meta': 'false'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load admin data');
        }
        
        const data = await response.json();
        state.videos = data.videos || [];
        state.keys = data.keys || [];
        
        // Update stats
        updateAdminStats();
        
        // Render videos table
        renderVideosTable();
        
        // Update last updated time
        elements.lastUpdated.textContent = new Date().toLocaleTimeString();
    } catch (error) {
        console.error('Error loading admin data:', error);
        showError('Failed to load data from JSONBin');
    }
}

function updateAdminStats() {
    const totalVideos = state.videos.length;
    const vipVideos = state.videos.filter(v => v.vip === true || v.vip === 'true').length;
    const totalViews = state.videos.reduce((sum, video) => sum + (video.countClick || 0), 0);
    const activeKeys = state.keys.filter(k => k.remaining > 0).length;
    
    elements.totalVideos.textContent = totalVideos;
    elements.vipVideos.textContent = vipVideos;
    elements.totalViews.textContent = formatNumber(totalViews);
    elements.activeKeys.textContent = activeKeys;
}

function renderVideosTable() {
    elements.videosTableBody.innerHTML = '';
    
    state.videos.forEach(video => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${video.id}</td>
            <td>${video.nama}</td>
            <td>${video.durasi}</td>
            <td class="${video.vip ? 'vip-true' : 'vip-false'}">
                ${video.vip ? 'VIP' : 'Free'}
            </td>
            <td>${formatNumber(video.countClick || 0)}</td>
            <td>${formatNumber(video.likes || 0)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" data-id="${video.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${video.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        elements.videosTableBody.appendChild(row);
    });
}

function setupAdminEventListeners() {
    // VIP toggle
    elements.isVip?.addEventListener('change', function() {
        elements.vipStatusText.textContent = this.checked ? 'VIP' : 'Free';
    });

    // Upload form
    elements.uploadForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const videoData = {
            id: state.videos.length > 0 ? Math.max(...state.videos.map(v => v.id)) + 1 : 1,
            nama: elements.videoName.value,
            linkvideo: elements.videoLink.value,
            durasi: elements.videoDuration.value,
            vip: elements.isVip.checked,
            countClick: 0,
            likes: 0,
            uploadedAt: new Date().toISOString()
        };
        
        try {
            // Add to state
            state.videos.push(videoData);
            
            // Update database
            await updateDatabase();
            
            // Reset form
            elements.uploadForm.reset();
            elements.vipStatusText.textContent = 'Free';
            
            // Update UI
            updateAdminStats();
            renderVideosTable();
            
            showSuccess('Video uploaded successfully!');
        } catch (error) {
            showError('Failed to upload video: ' + error.message);
        }
    });

    // Reset form
    elements.resetForm?.addEventListener('click', () => {
        elements.uploadForm.reset();
        elements.vipStatusText.textContent = 'Free';
    });

    // Generate keys
    elements.generateKeyBtn?.addEventListener('click', async () => {
        const count = parseInt(elements.keyCount.value) || 1;
        
        for (let i = 0; i < count; i++) {
            const key = generateKey();
            const keyData = {
                key: key,
                remaining: 30,
                generatedAt: new Date().toISOString(),
                generatedBy: 'Admin'
            };
            
            state.keys.push(keyData);
            
            // Display key
            const keyItem = document.createElement('div');
            keyItem.className = 'key-item';
            keyItem.innerHTML = `
                <span>${key}</span>
                <button class="copy-key" data-key="${key}">
                    <i class="fas fa-copy"></i> Copy
                </button>
            `;
            elements.keysList.appendChild(keyItem);
            
            // Add copy functionality
            keyItem.querySelector('.copy-key').addEventListener('click', function() {
                navigator.clipboard.writeText(this.dataset.key);
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            });
        }
        
        // Update database
        await updateDatabase();
        updateAdminStats();
        
        showSuccess(`${count} key(s) generated successfully!`);
    });

    // Search and filter videos
    elements.searchVideos?.addEventListener('input', filterVideosTable);
    elements.filterVip?.addEventListener('change', filterVideosTable);

    // Table actions
    elements.videosTableBody?.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const videoId = parseInt(btn.dataset.id);
        const action = btn.classList.contains('edit') ? 'edit' : 'delete';
        
        if (action === 'delete') {
            if (confirm('Are you sure you want to delete this video?')) {
                deleteVideo(videoId);
            }
        } else if (action === 'edit') {
            editVideo(videoId);
        }
    });

    // Modal controls
    elements.closeSuccessModal?.addEventListener('click', () => {
        elements.successModal.classList.remove('active');
    });
    
    elements.closeErrorModal?.addEventListener('click', () => {
        elements.errorModal.classList.remove('active');
    });
    
    elements.okSuccessBtn?.addEventListener('click', () => {
        elements.successModal.classList.remove('active');
    });
    
    elements.okErrorBtn?.addEventListener('click', () => {
        elements.errorModal.classList.remove('active');
    });

    // Navigation
    elements.goHome?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    elements.logoutBtn?.addEventListener('click', () => {
        // Clear admin session
        localStorage.removeItem('admin_session');
        window.location.href = 'index.html';
    });
}

function filterVideosTable() {
    const searchTerm = elements.searchVideos.value.toLowerCase();
    const filterValue = elements.filterVip.value;
    
    const filteredVideos = state.videos.filter(video => {
        const matchesSearch = video.nama.toLowerCase().includes(searchTerm);
        const matchesFilter = filterValue === 'all' || 
                             (filterValue === 'vip' && video.vip) ||
                             (filterValue === 'free' && !video.vip);
        return matchesSearch && matchesFilter;
    });
    
    // Re-render table with filtered videos
    elements.videosTableBody.innerHTML = '';
    filteredVideos.forEach(video => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${video.id}</td>
            <td>${video.nama}</td>
            <td>${video.durasi}</td>
            <td class="${video.vip ? 'vip-true' : 'vip-false'}">
                ${video.vip ? 'VIP' : 'Free'}
            </td>
            <td>${formatNumber(video.countClick || 0)}</td>
            <td>${formatNumber(video.likes || 0)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" data-id="${video.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${video.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        elements.videosTableBody.appendChild(row);
    });
}

async function deleteVideo(videoId) {
    try {
        state.videos = state.videos.filter(v => v.id !== videoId);
        await updateDatabase();
        
        updateAdminStats();
        renderVideosTable();
        
        showSuccess('Video deleted successfully!');
    } catch (error) {
        showError('Failed to delete video: ' + error.message);
    }
}

function editVideo(videoId) {
    const video = state.videos.find(v => v.id === videoId);
    if (!video) return;
    
    // Populate form with video data
    elements.videoName.value = video.nama;
    elements.videoLink.value = video.linkvideo;
    elements.videoDuration.value = video.durasi;
    elements.isVip.checked = video.vip;
    elements.vipStatusText.textContent = video.vip ? 'VIP' : 'Free';
    
    // Scroll to form
    elements.uploadForm.scrollIntoView({ behavior: 'smooth' });
}

async function updateDatabase() {
    const data = {
        videos: state.videos,
        keys: state.keys,
        settings: {
            lastUpdated: new Date().toISOString(),
            totalViews: state.videos.reduce((sum, v) => sum + (v.countClick || 0), 0),
            totalLikes: state.videos.reduce((sum, v) => sum + (v.likes || 0), 0)
        }
    };
    
    try {
        const response = await fetch(`${CONFIG.API_URL}/${CONFIG.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': CONFIG.API_KEY
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update database');
        }
        
        console.log('Database updated successfully');
    } catch (error) {
        console.error('Error updating database:', error);
        throw error;
    }
}

function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'SKH-';
    for (let i = 0; i < 12; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

function showSuccess(message) {
    elements.successMessage.textContent = message;
    elements.successModal.classList.add('active');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorModal.classList.add('active');
}

// ===== UTILITY FUNCTIONS =====
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getSampleVideos() {
    return [
        {
            id: 1,
            nama: 'ANGGAZYY SERIES',
            linkvideo: 'https://example.com/video1.mp4',
            durasi: '1:30',
            vip: true,
            countClick: 3000,
            likes: 3000
        },
        {
            id: 2,
            nama: 'PREMIUM CONTENT',
            linkvideo: 'https://example.com/video2.mp4',
            durasi: '2:15',
            vip: false,
            countClick: 1500,
            likes: 1200
        },
        {
            id: 3,
            nama: 'EXCLUSIVE VIDEO',
            linkvideo: 'https://example.com/video3.mp4',
            durasi: '0:45',
            vip: true,
            countClick: 4500,
            likes: 3800
        }
    ];
}

// ===== VIDEO PLAYER PAGE =====
// Note: You'll need to create video.html separately for the video player functionality

console.log('SKANDALHUB initialized successfully!');