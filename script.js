// JSONBin Configuration
const JSONBIN_API_KEY = '$2a$10$8ueR8M0Cf0Yf7nsvDMZSKupvmmji6O5V.W988gSb0avOJcn.TdC4q';
const JSONBIN_BIN_ID = '6957afe9ae596e708fc00027'; // You'll need to create your own bin and update this ID
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

// Application State
let videos = [];
let keys = [];
let currentUserKey = localStorage.getItem('skandalhub_vip_key') || null;
let remainingUnlocks = parseInt(localStorage.getItem('skandalhub_remaining_unlocks')) || 0;
let currentPage = 1;
let videosPerPage = 10;
let currentFilter = 'trending';
let currentVideoId = null;
let isKeyVisible = false;

// DOM Elements
const elements = {
    // Loading Screen
    loadingScreen: document.getElementById('loading-screen'),
    currentProgress: document.getElementById('current-progress'),
    progressFill: document.querySelector('.progress-fill'),
    progressSteps: document.querySelectorAll('.step'),
    
    // Welcome Popup
    welcomePopup: document.getElementById('welcome-popup'),
    closePopupBtn: document.getElementById('close-popup-btn'),
    
    // Banner Ad
    adImage: document.getElementById('ad-image'),
    
    // Video Grid
    videoGrid: document.getElementById('video-grid'),
    noResults: document.getElementById('no-results'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    
    // Pagination
    prevPageBtn: document.getElementById('prev-page'),
    nextPageBtn: document.getElementById('next-page'),
    currentPageSpan: document.getElementById('current-page'),
    totalPagesSpan: document.getElementById('total-pages'),
    pageIndicator: document.getElementById('page-indicator'),
    
    // Navigation Tabs
    navTabs: document.querySelectorAll('.main-nav a'),
    
    // Video Modal
    videoModal: document.getElementById('video-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    videoPlayer: document.getElementById('video-player'),
    videoLocked: document.getElementById('video-locked'),
    unlockBtn: document.getElementById('unlock-btn'),
    videoModalTitle: document.getElementById('video-modal-title'),
    videoModalDuration: document.getElementById('video-modal-duration'),
    videoModalViews: document.getElementById('video-modal-views'),
    videoModalLikes: document.getElementById('video-modal-likes'),
    uploadDate: document.getElementById('upload-date'),
    likeBtn: document.getElementById('like-btn'),
    likeCount: document.getElementById('like-count'),
    
    // VIP Modal
    vipModal: document.getElementById('vip-modal'),
    closeVipModalBtn: document.getElementById('close-vip-modal-btn'),
    vipKeyInput: document.getElementById('vip-key-input'),
    showKeyBtn: document.getElementById('show-key-btn'),
    keyError: document.getElementById('key-error'),
    remainingUnlocksSpan: document.getElementById('remaining-unlocks'),
    confirmKeyBtn: document.getElementById('confirm-key-btn'),
    cancelKeyBtn: document.getElementById('cancel-key-btn'),
    vipVideoTitle: document.getElementById('vip-video-title'),
    
    // Admin Elements
    adminLoading: document.getElementById('admin-loading'),
    adminSections: document.querySelectorAll('.admin-section'),
    adminNavLinks: document.querySelectorAll('.admin-nav a'),
    adminSectionTitle: document.getElementById('admin-section-title'),
    
    // Upload Form
    uploadForm: document.getElementById('upload-form'),
    uploadVideoBtn: document.getElementById('upload-video-btn'),
    uploadStatus: document.getElementById('upload-status'),
    
    // Keys Management
    generateKeyBtn: document.getElementById('generate-key-btn'),
    generatedKeyValue: document.getElementById('generated-key-value'),
    copyKeyBtn: document.getElementById('copy-key-btn'),
    keysTableBody: document.getElementById('keys-table-body'),
    noKeys: document.getElementById('no-keys'),
    
    // Videos Management
    adminVideoSearch: document.getElementById('admin-video-search'),
    adminSearchBtn: document.getElementById('admin-search-btn'),
    videoFilter: document.getElementById('video-filter'),
    videosTableBody: document.getElementById('videos-table-body'),
    noVideos: document.getElementById('no-videos'),
    
    // Analytics
    totalVideos: document.getElementById('total-videos'),
    totalKeys: document.getElementById('total-keys'),
    totalViews: document.getElementById('total-views'),
    analyticsViews: document.getElementById('analytics-views'),
    analyticsLikes: document.getElementById('analytics-likes'),
    analyticsVip: document.getElementById('analytics-vip'),
    analyticsKeys: document.getElementById('analytics-keys'),
    topVideosBody: document.getElementById('top-videos-body'),
    
    // Success & Delete Modals
    successModal: document.getElementById('success-modal'),
    successMessage: document.getElementById('success-message'),
    closeSuccessModal: document.getElementById('close-success-modal'),
    deleteModal: document.getElementById('delete-modal'),
    deleteMessage: document.getElementById('delete-message'),
    confirmDelete: document.getElementById('confirm-delete'),
    cancelDelete: document.getElementById('cancel-delete'),
    refreshData: document.getElementById('refresh-data')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on admin page or main page
    const isAdminPage = window.location.pathname.includes('admin.html');
    
    if (isAdminPage) {
        initAdminPage();
    } else {
        initMainPage();
    }
    
    // Initialize animations
    initAnimations();
});

// ===== MAIN PAGE FUNCTIONS =====
function initMainPage() {
    // Start loading screen animation
    startLoadingAnimation();
    
    // Load data from JSONBin
    loadData().then(() => {
        // Setup event listeners
        setupEventListeners();
        
        // Initialize banner ad rotation
        initBannerAd();
        
        // Display videos
        displayVideos();
        
        // Show welcome popup after a delay
        setTimeout(() => {
            elements.welcomePopup.classList.add('active');
        }, 1000);
    }).catch(error => {
        console.error('Error loading data:', error);
        // Still set up event listeners even if data fails to load
        setupEventListeners();
        showNotification('Error loading data. Please refresh the page.', 'error');
    });
}

function startLoadingAnimation() {
    let progress = 0;
    const totalSteps = 30;
    const stepDuration = 150; // 150ms per step = 4.5 seconds total
    
    const progressInterval = setInterval(() => {
        progress++;
        elements.currentProgress.textContent = progress;
        elements.progressFill.style.width = `${(progress / totalSteps) * 100}%`;
        
        // Update steps with animation
        if (progress <= 10) {
            elements.progressSteps[0].classList.add('loaded');
        } else if (progress <= 20) {
            elements.progressSteps[1].classList.add('loaded');
        } else if (progress <= 30) {
            elements.progressSteps[2].classList.add('loaded');
        }
        
        if (progress === totalSteps) {
            clearInterval(progressInterval);
            
            // Hide loading screen after a short delay
            setTimeout(() => {
                elements.loadingScreen.classList.add('hidden');
                // Show main content
                document.querySelector('.container').style.opacity = '1';
            }, 500);
        }
    }, stepDuration);
}

async function loadData() {
    try {
        const response = await fetch(JSONBIN_URL, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Initialize with sample data if empty
        if (!data || Object.keys(data).length === 0) {
            videos = getSampleVideos();
            keys = getSampleKeys();
            await saveData();
        } else {
            videos = data.videos || getSampleVideos();
            keys = data.keys || getSampleKeys();
        }
        
        // Sort videos by views (trending)
        sortVideosByTrending();
        
        console.log('Data loaded successfully:', { videos, keys });
    } catch (error) {
        console.error('Error loading data:', error);
        // Use sample data as fallback
        videos = getSampleVideos();
        keys = getSampleKeys();
    }
}

async function saveData() {
    try {
        const data = {
            videos,
            keys,
            lastUpdated: new Date().toISOString()
        };
        
        const response = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        console.log('Data saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Error saving data. Please try again.', 'error');
        return false;
    }
}

function getSampleVideos() {
    return [
        {
            id: 1,
            name: 'ANGGAZYY SERIES EPISODE 1',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '1:30',
            vip: false,
            views: 3000,
            likes: 1500,
            uploadDate: '2025-01-15',
            uploader: 'Admin'
        },
        {
            id: 2,
            name: 'EXCLUSIVE CONTENT: VIP PREVIEW',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '2:45',
            vip: true,
            views: 1500,
            likes: 800,
            uploadDate: '2025-01-16',
            uploader: 'Admin'
        },
        {
            id: 3,
            name: 'TRENDING NOW: SPECIAL EPISODE',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '3:20',
            vip: false,
            views: 4500,
            likes: 2200,
            uploadDate: '2025-01-14',
            uploader: 'Admin'
        },
        {
            id: 4,
            name: 'PREMIUM VIP CONTENT UNLOCKED',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '4:10',
            vip: true,
            views: 1200,
            likes: 600,
            uploadDate: '2025-01-17',
            uploader: 'Admin'
        },
        {
            id: 5,
            name: 'LATEST RELEASE: NEW SERIES',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1532540031727-8e76bb5c5f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '1:55',
            vip: false,
            views: 2800,
            likes: 1400,
            uploadDate: '2025-01-18',
            uploader: 'Admin'
        },
        {
            id: 6,
            name: 'EXCLUSIVE VIP ACCESS ONLY',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1489599809516-9827b6d1cf13?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '2:30',
            vip: true,
            views: 900,
            likes: 450,
            uploadDate: '2025-01-19',
            uploader: 'Admin'
        },
        {
            id: 7,
            name: 'POPULAR EPISODE: HIGHLIGHTS',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '3:45',
            vip: false,
            views: 5200,
            likes: 2600,
            uploadDate: '2025-01-13',
            uploader: 'Admin'
        },
        {
            id: 8,
            name: 'VIP SPECIAL: BEHIND THE SCENES',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '5:20',
            vip: true,
            views: 1800,
            likes: 950,
            uploadDate: '2025-01-20',
            uploader: 'Admin'
        },
        {
            id: 9,
            name: 'NEW UPLOAD: DAILY CONTENT',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '2:15',
            vip: false,
            views: 2100,
            likes: 1100,
            uploadDate: '2025-01-21',
            uploader: 'Admin'
        },
        {
            id: 10,
            name: 'VIP EXCLUSIVE: LIMITED ACCESS',
            link: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
            duration: '4:45',
            vip: true,
            views: 1300,
            likes: 700,
            uploadDate: '2025-01-22',
            uploader: 'Admin'
        }
    ];
}

function getSampleKeys() {
    return [
        {
            id: 'SKH-VIP-2025-ABC123',
            created: '2025-01-01',
            unlocksUsed: 5,
            remaining: 25,
            active: true
        },
        {
            id: 'SKH-VIP-2025-XYZ789',
            created: '2025-01-10',
            unlocksUsed: 15,
            remaining: 15,
            active: true
        },
        {
            id: 'SKH-VIP-2024-DEF456',
            created: '2024-12-15',
            unlocksUsed: 30,
            remaining: 0,
            active: false
        }
    ];
}

function setupEventListeners() {
    // Welcome popup
    if (elements.closePopupBtn) {
        elements.closePopupBtn.addEventListener('click', () => {
            elements.welcomePopup.classList.remove('active');
        });
    }
    
    // Search functionality
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', performSearch);
    }
    
    if (elements.searchInput) {
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Pagination
    if (elements.prevPageBtn) {
        elements.prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayVideos();
            }
        });
    }
    
    if (elements.nextPageBtn) {
        elements.nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(getFilteredVideos().length / videosPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayVideos();
            }
        });
    }
    
    // Navigation tabs
    if (elements.navTabs) {
        elements.navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active tab
                elements.navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update filter and display videos
                currentFilter = tab.getAttribute('data-tab');
                currentPage = 1;
                displayVideos();
            });
        });
    }
    
    // Video modal
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', () => {
            closeVideoModal();
        });
    }
    
    // Unlock button
    if (elements.unlockBtn) {
        elements.unlockBtn.addEventListener('click', () => {
            elements.vipModal.classList.add('active');
            elements.vipVideoTitle.textContent = elements.videoModalTitle.textContent;
            elements.remainingUnlocksSpan.textContent = remainingUnlocks;
        });
    }
    
    // Like button
    if (elements.likeBtn) {
        elements.likeBtn.addEventListener('click', likeVideo);
    }
    
    // VIP modal
    if (elements.closeVipModalBtn) {
        elements.closeVipModalBtn.addEventListener('click', () => {
            elements.vipModal.classList.remove('active');
            elements.keyError.textContent = '';
            elements.vipKeyInput.value = '';
        });
    }
    
    if (elements.showKeyBtn) {
        elements.showKeyBtn.addEventListener('click', () => {
            isKeyVisible = !isKeyVisible;
            elements.vipKeyInput.type = isKeyVisible ? 'text' : 'password';
            elements.showKeyBtn.innerHTML = isKeyVisible ? 
                '<i class="fas fa-eye-slash"></i>' : 
                '<i class="fas fa-eye"></i>';
        });
    }
    
    if (elements.confirmKeyBtn) {
        elements.confirmKeyBtn.addEventListener('click', validateKey);
    }
    
    if (elements.cancelKeyBtn) {
        elements.cancelKeyBtn.addEventListener('click', () => {
            elements.vipModal.classList.remove('active');
            elements.keyError.textContent = '';
            elements.vipKeyInput.value = '';
        });
    }
    
    // VIP key input enter key
    if (elements.vipKeyInput) {
        elements.vipKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                validateKey();
            }
        });
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            elements.videoModal.classList.remove('active');
            elements.vipModal.classList.remove('active');
            elements.keyError.textContent = '';
            elements.vipKeyInput.value = '';
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            elements.videoModal.classList.remove('active');
            elements.vipModal.classList.remove('active');
            elements.keyError.textContent = '';
            elements.vipKeyInput.value = '';
        }
    });
}

function performSearch() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    
    if (searchTerm) {
        // Filter videos by search term
        const filtered = videos.filter(video => 
            video.name.toLowerCase().includes(searchTerm) ||
            video.uploader.toLowerCase().includes(searchTerm)
        );
        
        // Update display with search results
        displayVideos(filtered);
        
        // Show no results message if needed
        elements.noResults.style.display = filtered.length === 0 ? 'block' : 'none';
    } else {
        // Reset to normal display
        displayVideos();
        elements.noResults.style.display = 'none';
    }
    
    currentPage = 1;
}

function getFilteredVideos() {
    switch (currentFilter) {
        case 'trending':
            return [...videos].sort((a, b) => b.views - a.views);
        case 'new':
            return [...videos].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        case 'vip':
            return videos.filter(video => video.vip);
        case 'all':
        default:
            return videos;
    }
}

function displayVideos(filteredVideos = null) {
    const videosToDisplay = filteredVideos || getFilteredVideos();
    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    const paginatedVideos = videosToDisplay.slice(startIndex, endIndex);
    
    // Clear current grid
    elements.videoGrid.innerHTML = '';
    
    // Display videos
    paginatedVideos.forEach((video, index) => {
        const videoCard = createVideoCard(video, index);
        elements.videoGrid.appendChild(videoCard);
    });
    
    // Update pagination controls
    updatePagination(videosToDisplay.length);
    
    // Show/hide no results message
    elements.noResults.style.display = paginatedVideos.length === 0 ? 'block' : 'none';
}

function createVideoCard(video, index) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    // Format duration
    let durationText = video.duration;
    if (!video.duration.includes(':')) {
        // Assume it's seconds only
        const seconds = parseInt(video.duration);
        if (seconds < 60) {
            durationText = `${seconds}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            durationText = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Check if user has access (for VIP videos)
    const hasAccess = !video.vip || (currentUserKey && remainingUnlocks > 0);
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}" alt="${video.name}" loading="lazy">
            ${video.vip ? '<div class="vip-badge"><i class="fas fa-crown"></i> VIP</div>' : ''}
            ${video.vip && !hasAccess ? `
                <div class="lock-overlay">
                    <div class="lock-icon-small"><i class="fas fa-lock"></i></div>
                    <small>VIP Content</small>
                </div>
            ` : ''}
            <div class="duration">${durationText}</div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.name}</h3>
            <div class="video-stats">
                <div class="stat">
                    <i class="fas fa-eye"></i> ${video.views.toLocaleString()}
                </div>
                <div class="stat">
                    <i class="fas fa-heart"></i> ${video.likes.toLocaleString()}
                </div>
            </div>
            <div class="uploader">
                <span class="uploader-name">${video.uploader}</span>
                <i class="fas fa-check-circle verified"></i>
            </div>
            <button class="watch-btn" data-id="${video.id}">
                <i class="fas fa-play"></i> ${video.vip && !hasAccess ? 'Unlock to Watch' : 'Watch Now'}
            </button>
        </div>
    `;
    
    // Add click event to watch button
    const watchBtn = card.querySelector('.watch-btn');
    watchBtn.addEventListener('click', () => openVideoModal(video.id));
    
    return card;
}

function updatePagination(totalVideos) {
    const totalPages = Math.ceil(totalVideos / videosPerPage);
    
    elements.currentPageSpan.textContent = currentPage;
    elements.totalPagesSpan.textContent = totalPages;
    
    elements.prevPageBtn.disabled = currentPage === 1;
    elements.nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Update page indicator text
    const startVideo = ((currentPage - 1) * videosPerPage) + 1;
    const endVideo = Math.min(currentPage * videosPerPage, totalVideos);
    
    if (totalVideos > 0) {
        elements.pageIndicator.innerHTML = `Showing <span>${startVideo}-${endVideo}</span> of <span>${totalVideos}</span> videos`;
    } else {
        elements.pageIndicator.textContent = 'No videos found';
    }
}

function openVideoModal(videoId) {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    currentVideoId = videoId;
    
    // Update modal content
    elements.videoModalTitle.textContent = video.name;
    elements.videoModalDuration.textContent = video.duration;
    elements.videoModalViews.textContent = video.views.toLocaleString();
    elements.videoModalLikes.textContent = video.likes.toLocaleString();
    elements.uploadDate.textContent = formatDate(video.uploadDate);
    elements.likeCount.textContent = video.likes.toLocaleString();
    
    // Update like button state
    const likedVideos = JSON.parse(localStorage.getItem('skandalhub_liked_videos') || '[]');
    const isLiked = likedVideos.includes(videoId);
    elements.likeBtn.innerHTML = isLiked ? 
        '<i class="fas fa-heart"></i> Liked' : 
        '<i class="far fa-heart"></i> Like';
    
    // Check if video is VIP and user has access
    const hasAccess = !video.vip || (currentUserKey && remainingUnlocks > 0);
    
    if (video.vip && !hasAccess) {
        // Show locked state
        elements.videoLocked.style.display = 'flex';
        elements.videoPlayer.style.display = 'none';
    } else {
        // Show video player
        elements.videoLocked.style.display = 'none';
        elements.videoPlayer.style.display = 'block';
        elements.videoPlayer.src = video.link;
        
        // Increment view count
        if (!hasViewedVideo(videoId)) {
            video.views++;
            saveData();
            addToViewedVideos(videoId);
        }
    }
    
    // Show modal
    elements.videoModal.classList.add('active');
    
    // Pause any playing video
    elements.videoPlayer.pause();
}

function closeVideoModal() {
    elements.videoModal.classList.remove('active');
    elements.videoPlayer.pause();
    elements.videoPlayer.src = '';
    currentVideoId = null;
}

function hasViewedVideo(videoId) {
    const viewedVideos = JSON.parse(localStorage.getItem('skandalhub_viewed_videos') || '[]');
    return viewedVideos.includes(videoId);
}

function addToViewedVideos(videoId) {
    const viewedVideos = JSON.parse(localStorage.getItem('skandalhub_viewed_videos') || '[]');
    if (!viewedVideos.includes(videoId)) {
        viewedVideos.push(videoId);
        localStorage.setItem('skandalhub_viewed_videos', JSON.stringify(viewedVideos));
    }
}

function likeVideo() {
    if (!currentVideoId) return;
    
    const video = videos.find(v => v.id === currentVideoId);
    if (!video) return;
    
    const likedVideos = JSON.parse(localStorage.getItem('skandalhub_liked_videos') || '[]');
    const isLiked = likedVideos.includes(currentVideoId);
    
    if (isLiked) {
        // Unlike
        video.likes = Math.max(0, video.likes - 1);
        const index = likedVideos.indexOf(currentVideoId);
        likedVideos.splice(index, 1);
        elements.likeBtn.innerHTML = '<i class="far fa-heart"></i> Like';
    } else {
        // Like
        video.likes++;
        likedVideos.push(currentVideoId);
        elements.likeBtn.innerHTML = '<i class="fas fa-heart"></i> Liked';
    }
    
    // Update display
    elements.likeCount.textContent = video.likes.toLocaleString();
    elements.videoModalLikes.textContent = video.likes.toLocaleString();
    
    // Save to localStorage and database
    localStorage.setItem('skandalhub_liked_videos', JSON.stringify(likedVideos));
    saveData();
    
    // Update video card if it exists
    const videoCard = document.querySelector(`.watch-btn[data-id="${currentVideoId}"]`)?.closest('.video-card');
    if (videoCard) {
        const likesElement = videoCard.querySelector('.stat:nth-child(2)');
        if (likesElement) {
            likesElement.innerHTML = `<i class="fas fa-heart"></i> ${video.likes.toLocaleString()}`;
        }
    }
}

function validateKey() {
    const key = elements.vipKeyInput.value.trim();
    
    if (!key) {
        elements.keyError.textContent = 'Please enter a key';
        return;
    }
    
    // Check if key exists in database
    const keyData = keys.find(k => k.id === key && k.active);
    
    if (!keyData) {
        elements.keyError.textContent = 'Invalid or expired key';
        return;
    }
    
    if (keyData.remaining <= 0) {
        elements.keyError.textContent = 'Key has no remaining unlocks';
        return;
    }
    
    // Key is valid - save to localStorage
    currentUserKey = key;
    remainingUnlocks = keyData.remaining;
    
    localStorage.setItem('skandalhub_vip_key', key);
    localStorage.setItem('skandalhub_remaining_unlocks', remainingUnlocks.toString());
    
    // Update key usage
    keyData.unlocksUsed++;
    keyData.remaining--;
    
    // Deactivate key if no remaining unlocks
    if (keyData.remaining <= 0) {
        keyData.active = false;
    }
    
    // Save to database
    saveData().then(() => {
        // Close VIP modal
        elements.vipModal.classList.remove('active');
        elements.keyError.textContent = '';
        elements.vipKeyInput.value = '';
        
        // Show success message
        showNotification('Key validated successfully! Video unlocked.', 'success');
        
        // Unlock and play the video
        if (currentVideoId) {
            const video = videos.find(v => v.id === currentVideoId);
            if (video && video.vip) {
                // Hide locked overlay and show video
                elements.videoLocked.style.display = 'none';
                elements.videoPlayer.style.display = 'block';
                elements.videoPlayer.src = video.link;
                
                // Increment view count
                if (!hasViewedVideo(currentVideoId)) {
                    video.views++;
                    saveData();
                    addToViewedVideos(currentVideoId);
                }
            }
        }
    });
}

function initBannerAd() {
    let isGif = true;
    let gifDuration = 15000; // 15 seconds
    let imageDuration = 5000; // 5 seconds
    
    function switchAd() {
        if (isGif) {
            elements.adImage.src = 'https://files.catbox.moe/gmd2fk.gif';
            setTimeout(switchAd, gifDuration);
        } else {
            elements.adImage.src = 'https://files.catbox.moe/op6wtn.jpg';
            setTimeout(switchAd, imageDuration);
        }
        
        isGif = !isGif;
    }
    
    // Start the ad rotation
    switchAd();
}

function sortVideosByTrending() {
    videos.sort((a, b) => {
        // Sort by views (descending), then by likes (descending)
        if (b.views !== a.views) {
            return b.views - a.views;
        }
        return b.likes - a.likes;
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
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
    
    // Add to page
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
                background: var(--card-bg);
                border-left: 4px solid var(--primary-color);
                border-radius: 8px;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                max-width: 400px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                z-index: 9999;
                transform: translateX(120%);
                transition: transform 0.5s ease;
                border: 1px solid var(--border-color);
            }
            
            .notification.notification-success {
                border-left-color: var(--success-color);
            }
            
            .notification.notification-error {
                border-left-color: var(--error-color);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
                color: var(--text-color);
                font-weight: 500;
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            .notification-success .notification-content i {
                color: var(--success-color);
            }
            
            .notification-error .notification-content i {
                color: var(--error-color);
            }
            
            .notification-close {
                background: transparent;
                border: none;
                color: var(--text-light);
                cursor: pointer;
                font-size: 1rem;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .notification-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--text-color);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-remove after 5 seconds
    const autoRemove = setTimeout(() => {
        closeNotification(notification);
    }, 5000);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoRemove);
        closeNotification(notification);
    });
    
    function closeNotification(notif) {
        notif.classList.remove('show');
        setTimeout(() => {
            if (notif.parentNode) {
                notif.parentNode.removeChild(notif);
            }
        }, 500);
    }
}

function initAnimations() {
    // Add fade-in animation to elements as they come into view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.video-card, .banner-text, .analytics-card').forEach(el => {
        observer.observe(el);
    });
}

// ===== ADMIN PAGE FUNCTIONS =====
function initAdminPage() {
    // Hide admin loading screen
    setTimeout(() => {
        if (elements.adminLoading) {
            elements.adminLoading.classList.add('hidden');
        }
        document.querySelector('.admin-container').style.opacity = '1';
    }, 1000);
    
    // Load admin data
    loadData().then(() => {
        setupAdminEventListeners();
        displayAdminVideos();
        displayAdminKeys();
        updateAdminStats();
        loadAdminAnalytics();
    }).catch(error => {
        console.error('Error loading admin data:', error);
        setupAdminEventListeners();
        showNotification('Error loading admin data. Please refresh the page.', 'error');
    });
}

function setupAdminEventListeners() {
    // Admin navigation
    if (elements.adminNavLinks) {
        elements.adminNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') === 'index.html') return;
                
                e.preventDefault();
                
                // Update active link
                elements.adminNavLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show corresponding section
                const section = link.getAttribute('data-section');
                showAdminSection(section);
            });
        });
    }
    
    // Upload form
    if (elements.uploadForm) {
        elements.uploadForm.addEventListener('submit', handleVideoUpload);
    }
    
    // Generate key button
    if (elements.generateKeyBtn) {
        elements.generateKeyBtn.addEventListener('click', generateKey);
    }
    
    // Copy key button
    if (elements.copyKeyBtn) {
        elements.copyKeyBtn.addEventListener('click', copyKey);
    }
    
    // Video search
    if (elements.adminSearchBtn) {
        elements.adminSearchBtn.addEventListener('click', performAdminSearch);
    }
    
    if (elements.adminVideoSearch) {
        elements.adminVideoSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performAdminSearch();
            }
        });
    }
    
    // Video filter
    if (elements.videoFilter) {
        elements.videoFilter.addEventListener('change', displayAdminVideos);
    }
    
    // Refresh data button
    if (elements.refreshData) {
        elements.refreshData.addEventListener('click', refreshAdminData);
    }
    
    // Success modal
    if (elements.closeSuccessModal) {
        elements.closeSuccessModal.addEventListener('click', () => {
            elements.successModal.classList.remove('active');
        });
    }
    
    // Delete modal
    if (elements.cancelDelete) {
        elements.cancelDelete.addEventListener('click', () => {
            elements.deleteModal.classList.remove('active');
        });
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            elements.successModal.classList.remove('active');
            elements.deleteModal.classList.remove('active');
        }
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            elements.successModal.classList.remove('active');
            elements.deleteModal.classList.remove('active');
        }
    });
}

function showAdminSection(section) {
    // Hide all sections
    elements.adminSections.forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${section}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update section title
    if (elements.adminSectionTitle) {
        const titleMap = {
            'upload': 'Upload Content',
            'keys': 'Manage Keys',
            'videos': 'Manage Videos',
            'analytics': 'Platform Analytics'
        };
        elements.adminSectionTitle.textContent = titleMap[section] || 'Admin Panel';
    }
}

async function handleVideoUpload(e) {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById('video-name').value;
    const link = document.getElementById('video-link').value;
    const duration = document.getElementById('video-duration').value;
    const vip = document.getElementById('video-vip').checked;
    const thumbnail = document.getElementById('video-thumbnail').value;
    
    // Validate form
    if (!name || !link || !duration) {
        showAdminStatus('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate duration format
    const durationRegex = /^(\d+)(:(\d{1,2}))?$/;
    if (!durationRegex.test(duration)) {
        showAdminStatus('Duration must be in format MM:SS or SS', 'error');
        return;
    }
    
    // Create new video object
    const newVideo = {
        id: videos.length > 0 ? Math.max(...videos.map(v => v.id)) + 1 : 1,
        name,
        link,
        thumbnail: thumbnail || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        duration,
        vip,
        views: 0,
        likes: 0,
        uploadDate: new Date().toISOString().split('T')[0],
        uploader: 'Admin'
    };
    
    // Add to videos array
    videos.push(newVideo);
    
    // Save to database
    const saved = await saveData();
    
    if (saved) {
        // Reset form
        elements.uploadForm.reset();
        
        // Show success message
        showAdminStatus('Video uploaded successfully!', 'success');
        
        // Update admin stats
        updateAdminStats();
        
        // Show success modal
        elements.successMessage.textContent = 'Video uploaded successfully!';
        elements.successModal.classList.add('active');
        
        // Refresh videos list if on videos section
        if (document.getElementById('videos-section').classList.contains('active')) {
            displayAdminVideos();
        }
    } else {
        showAdminStatus('Error uploading video. Please try again.', 'error');
    }
}

function showAdminStatus(message, type) {
    if (!elements.uploadStatus) return;
    
    elements.uploadStatus.textContent = message;
    elements.uploadStatus.className = `status-message ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        elements.uploadStatus.style.display = 'none';
    }, 5000);
}

function generateKey() {
    // Generate a random key
    const keyId = `SKH-VIP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Create key object
    const newKey = {
        id: keyId,
        created: new Date().toISOString().split('T')[0],
        unlocksUsed: 0,
        remaining: 30,
        active: true
    };
    
    // Add to keys array
    keys.push(newKey);
    
    // Update display
    elements.generatedKeyValue.textContent = keyId;
    elements.copyKeyBtn.disabled = false;
    
    // Save to database
    saveData().then(() => {
        // Update keys list
        displayAdminKeys();
        
        // Update admin stats
        updateAdminStats();
        
        // Show success message
        showNotification('Key generated successfully!', 'success');
    });
}

function copyKey() {
    const key = elements.generatedKeyValue.textContent;
    
    if (key && key !== 'No key generated yet') {
        navigator.clipboard.writeText(key).then(() => {
            // Show copied feedback
            const originalText = elements.copyKeyBtn.innerHTML;
            elements.copyKeyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            elements.copyKeyBtn.style.background = 'var(--success-color)';
            
            setTimeout(() => {
                elements.copyKeyBtn.innerHTML = originalText;
                elements.copyKeyBtn.style.background = '';
            }, 2000);
            
            showNotification('Key copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy key: ', err);
            showNotification('Failed to copy key', 'error');
        });
    }
}

function displayAdminKeys() {
    if (!elements.keysTableBody) return;
    
    elements.keysTableBody.innerHTML = '';
    
    if (keys.length === 0) {
        elements.noKeys.style.display = 'block';
        return;
    }
    
    elements.noKeys.style.display = 'none';
    
    keys.forEach(key => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><code>${key.id}</code></td>
            <td>${key.created}</td>
            <td>${key.unlocksUsed}</td>
            <td>${key.remaining}</td>
            <td class="${key.active ? 'status-active' : 'status-expired'}">
                ${key.active ? 'Active' : 'Expired'}
            </td>
            <td>
                <div class="table-actions">
                    <button class="table-btn delete" data-key="${key.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        elements.keysTableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.table-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const keyId = e.currentTarget.getAttribute('data-key');
            confirmDeleteKey(keyId);
        });
    });
}

function confirmDeleteKey(keyId) {
    const key = keys.find(k => k.id === keyId);
    if (!key) return;
    
    elements.deleteMessage.textContent = `Are you sure you want to delete key "${keyId}"? This action cannot be undone.`;
    elements.deleteModal.classList.add('active');
    
    // Set up delete confirmation
    const confirmHandler = () => {
        deleteKey(keyId);
        elements.deleteModal.classList.remove('active');
        elements.confirmDelete.removeEventListener('click', confirmHandler);
    };
    
    elements.confirmDelete.addEventListener('click', confirmHandler);
}

function deleteKey(keyId) {
    const index = keys.findIndex(k => k.id === keyId);
    if (index !== -1) {
        keys.splice(index, 1);
        
        // Save to database
        saveData().then(() => {
            // Update display
            displayAdminKeys();
            updateAdminStats();
            
            // Show success message
            showNotification('Key deleted successfully!', 'success');
        });
    }
}

function performAdminSearch() {
    const searchTerm = elements.adminVideoSearch.value.toLowerCase().trim();
    displayAdminVideos(searchTerm);
}

function displayAdminVideos(searchTerm = '') {
    if (!elements.videosTableBody) return;
    
    let filteredVideos = [...videos];
    
    // Apply search filter
    if (searchTerm) {
        filteredVideos = filteredVideos.filter(video => 
            video.name.toLowerCase().includes(searchTerm) ||
            video.id.toString().includes(searchTerm)
        );
    }
    
    // Apply VIP filter
    const filterValue = elements.videoFilter.value;
    if (filterValue === 'vip') {
        filteredVideos = filteredVideos.filter(video => video.vip);
    } else if (filterValue === 'free') {
        filteredVideos = filteredVideos.filter(video => !video.vip);
    }
    
    // Sort by ID (newest first)
    filteredVideos.sort((a, b) => b.id - a.id);
    
    // Clear table
    elements.videosTableBody.innerHTML = '';
    
    if (filteredVideos.length === 0) {
        elements.noVideos.style.display = 'block';
        return;
    }
    
    elements.noVideos.style.display = 'none';
    
    // Populate table
    filteredVideos.forEach(video => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${video.id}</td>
            <td>
                <img src="${video.thumbnail || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}" 
                     alt="Thumbnail" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
            </td>
            <td>${video.name}</td>
            <td>${video.duration}</td>
            <td>${video.vip ? '<i class="fas fa-crown" style="color: #ff9800;"></i> VIP' : 'Free'}</td>
            <td>${video.views.toLocaleString()}</td>
            <td>${video.likes.toLocaleString()}</td>
            <td>
                <div class="table-actions">
                    <button class="table-btn delete" data-video="${video.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        elements.videosTableBody.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.table-btn.delete[data-video]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const videoId = parseInt(e.currentTarget.getAttribute('data-video'));
            confirmDeleteVideo(videoId);
        });
    });
}

function confirmDeleteVideo(videoId) {
    const video = videos.find(v => v.id === videoId);
    if (!video) return;
    
    elements.deleteMessage.textContent = `Are you sure you want to delete video "${video.name}"? This action cannot be undone.`;
    elements.deleteModal.classList.add('active');
    
    // Set up delete confirmation
    const confirmHandler = () => {
        deleteVideo(videoId);
        elements.deleteModal.classList.remove('active');
        elements.confirmDelete.removeEventListener('click', confirmHandler);
    };
    
    elements.confirmDelete.addEventListener('click', confirmHandler);
}

function deleteVideo(videoId) {
    const index = videos.findIndex(v => v.id === videoId);
    if (index !== -1) {
        videos.splice(index, 1);
        
        // Save to database
        saveData().then(() => {
            // Update display
            displayAdminVideos();
            updateAdminStats();
            loadAdminAnalytics();
            
            // Show success message
            showNotification('Video deleted successfully!', 'success');
        });
    }
}

function updateAdminStats() {
    if (!elements.totalVideos) return;
    
    // Calculate totals
    const totalVideosCount = videos.length;
    const totalKeysCount = keys.length;
    const totalViewsCount = videos.reduce((sum, video) => sum + video.views, 0);
    const totalLikesCount = videos.reduce((sum, video) => sum + video.likes, 0);
    const vipVideosCount = videos.filter(video => video.vip).length;
    
    // Update display
    elements.totalVideos.textContent = totalVideosCount;
    elements.totalKeys.textContent = totalKeysCount;
    elements.totalViews.textContent = totalViewsCount.toLocaleString();
    
    elements.analyticsViews.textContent = totalViewsCount.toLocaleString();
    elements.analyticsLikes.textContent = totalLikesCount.toLocaleString();
    elements.analyticsVip.textContent = vipVideosCount;
    elements.analyticsKeys.textContent = keys.filter(k => k.active).length;
}

function loadAdminAnalytics() {
    // Update top videos table
    updateTopVideosTable();
    
    // Initialize chart if Chart.js is available
    if (typeof Chart !== 'undefined') {
        initializeViewsChart();
    }
}

function updateTopVideosTable() {
    if (!elements.topVideosBody) return;
    
    // Get top 5 videos by views
    const topVideos = [...videos]
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    
    elements.topVideosBody.innerHTML = '';
    
    topVideos.forEach((video, index) => {
        const engagement = video.views > 0 ? ((video.likes / video.views) * 100).toFixed(1) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${index + 1}</td>
            <td>${video.name}</td>
            <td>${video.views.toLocaleString()}</td>
            <td>${video.likes.toLocaleString()}</td>
            <td>${engagement}%</td>
        `;
        
        elements.topVideosBody.appendChild(row);
    });
}

function initializeViewsChart() {
    const ctx = document.getElementById('views-chart');
    if (!ctx) return;
    
    // Get last 7 days of data (simulated for demo)
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        // Simulate view data (in a real app, this would come from your database)
        data.push(Math.floor(Math.random() * 1000) + 500);
    }
    
    // Destroy existing chart if it exists
    if (window.viewsChartInstance) {
        window.viewsChartInstance.destroy();
    }
    
    // Create new chart
    window.viewsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Views',
                data: data,
                borderColor: 'rgb(138, 43, 226)',
                backgroundColor: 'rgba(138, 43, 226, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

function refreshAdminData() {
    // Show loading state
    const originalText = elements.refreshData.innerHTML;
    elements.refreshData.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    elements.refreshData.disabled = true;
    
    // Reload data
    loadData().then(() => {
        // Update all admin displays
        displayAdminVideos();
        displayAdminKeys();
        updateAdminStats();
        loadAdminAnalytics();
        
        // Show success message
        showNotification('Data refreshed successfully!', 'success');
    }).catch(error => {
        console.error('Error refreshing data:', error);
        showNotification('Error refreshing data', 'error');
    }).finally(() => {
        // Restore button state
        setTimeout(() => {
            elements.refreshData.innerHTML = originalText;
            elements.refreshData.disabled = false;
        }, 1000);
    });
}

// Make functions available globally for debugging
window.app = {
    videos,
    keys,
    currentUserKey,
    remainingUnlocks,
    loadData,
    saveData,
    showNotification
};