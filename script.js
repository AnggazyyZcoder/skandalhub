// script.js
// JSONBin Configuration
const JSONBIN_API_KEY = '$2a$10$8ueR8M0Cf0Yf7nsvDMZSKupvmmji6O5V.W988gSb0avOJcn.TdC4q';
const JSONBIN_BASE_URL = 'https://api.jsonbin.io/v3/b';
const BIN_ID = '6957b7ac43b1c97be91443bb'; // Default bin ID - can be changed in admin settings
const BIN_URL = `${JSONBIN_BASE_URL}/${BIN_ID}`;

// Global variables
let currentPage = 1;
let videosPerPage = 10;
let allVideos = [];
let filteredVideos = [];
let userKey = localStorage.getItem('skandalhub_key');
let keyRemainingUses = localStorage.getItem('skandalhub_key_uses') ? 
                       parseInt(localStorage.getItem('skandalhub_key_uses')) : 0;
let currentVideoId = null;
let adInterval;

// Initialization
document.addEventListener('DOMContentDidLoad', () => {
    // Check which page we're on and initialize accordingly
    if (document.body.classList.contains('admin-body')) {
        initAdminPage();
    } else {
        initMainPage();
    }
});

// Main Page Initialization
function initMainPage() {
    // Start loading screen
    startLoadingScreen();
    
    // Initialize event listeners
    initEventListeners();
    
    // Load data after loading screen
    setTimeout(() => {
        loadInitialData();
    }, 100);
}

// Admin Page Initialization
function initAdminPage() {
    // Start admin loading screen
    startAdminLoadingScreen();
    
    // Initialize admin event listeners
    initAdminEventListeners();
    
    // Load admin data
    setTimeout(() => {
        loadAdminData();
        setupAdminNavigation();
        setupFormPreviews();
    }, 100);
}

// ==============================
// MAIN PAGE FUNCTIONS
// ==============================

// Loading Screen
function startLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingDots = document.getElementById('loadingDots');
    const progressStatus = document.getElementById('progressStatus');
    const progressFill = document.querySelector('.progress-fill');
    const featureList = document.getElementById('featureList');
    
    // Animate dots
    let dotCount = 0;
    const dotInterval = setInterval(() => {
        const dots = '.'.repeat(dotCount % 4);
        loadingDots.textContent = `Loading${dots}`;
        dotCount++;
    }, 500);
    
    // Simulate feature initialization
    const features = [
        "Loading video database...",
        "Initializing player...",
        "Setting up user interface...",
        "Loading trending content...",
        "Preparing search functionality...",
        "Setting up VIP access...",
        "Loading advertisements...",
        "Initializing smooth animations...",
        "Setting up video categories...",
        "Preparing user profile...",
        "Loading analytics...",
        "Setting up responsive design...",
        "Initializing navigation...",
        "Loading thumbnails...",
        "Preparing video metadata...",
        "Setting up like system...",
        "Initializing key validation...",
        "Loading admin tools...",
        "Preparing statistics...",
        "Setting up filters...",
        "Initializing pagination...",
        "Loading related videos...",
        "Preparing share functionality...",
        "Setting up download options...",
        "Initializing notifications...",
        "Loading user preferences...",
        "Preparing video history...",
        "Setting up watch later...",
        "Initializing recommendations...",
        "Finalizing setup..."
    ];
    
    let currentFeature = 0;
    const featureInterval = setInterval(() => {
        if (currentFeature < features.length) {
            // Update progress
            const progress = Math.floor((currentFeature / features.length) * 100);
            progressFill.style.width = `${progress}%`;
            progressStatus.textContent = `Menginisialisasi fitur (${currentFeature}/${features.length})`;
            
            // Add feature to list
            const li = document.createElement('li');
            li.textContent = features[currentFeature];
            featureList.appendChild(li);
            
            // Scroll to bottom
            featureList.scrollTop = featureList.scrollHeight;
            
            currentFeature++;
        } else {
            // All features loaded
            clearInterval(featureInterval);
            clearInterval(dotInterval);
            
            // Complete progress bar
            progressFill.style.width = '100%';
            progressStatus.textContent = 'Ready! Starting SKANDALHUB...';
            
            // Hide loading screen after delay
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    
                    // Show main content
                    document.querySelector('.main-container').classList.remove('hidden');
                    
                    // Show welcome popup
                    setTimeout(() => {
                        document.getElementById('welcomePopup').classList.remove('hidden');
                    }, 500);
                }, 500);
            }, 1000);
        }
    }, 100);
}

// Initialize Event Listeners for Main Page
function initEventListeners() {
    // Menu toggle
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sideNav').classList.add('active');
    });
    
    document.getElementById('closeNav').addEventListener('click', () => {
        document.getElementById('sideNav').classList.remove('active');
    });
    
    // Close popup
    document.getElementById('closePopup').addEventListener('click', () => {
        const popup = document.getElementById('welcomePopup');
        popup.style.opacity = '0';
        setTimeout(() => {
            popup.classList.add('hidden');
        }, 300);
    });
    
    // Search functionality
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter videos
            const filter = this.getAttribute('data-filter');
            filterVideos(filter);
        });
    });
    
    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateVideoDisplay();
            updatePagination();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateVideoDisplay();
            updatePagination();
        }
    });
    
    // VIP Modal
    document.getElementById('closeVipModal').addEventListener('click', () => {
        document.getElementById('vipModal').classList.add('hidden');
    });
    
    document.getElementById('cancelKeyBtn').addEventListener('click', () => {
        document.getElementById('vipModal').classList.add('hidden');
    });
    
    document.getElementById('confirmKeyBtn').addEventListener('click', validateVipKey);
    document.getElementById('vipKeyInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') validateVipKey();
    });
    
    // Video player
    document.getElementById('closeVideoPlayer').addEventListener('click', () => {
        document.getElementById('videoPlayer').classList.add('hidden');
        const videoPlayer = document.getElementById('mainVideoPlayer');
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
    });
}

// Load Initial Data
async function loadInitialData() {
    try {
        // Load videos from JSONBin
        const response = await fetch(`${BIN_URL}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        
        const data = await response.json();
        
        // Check if videos exist in the data
        if (data.videos && Array.isArray(data.videos)) {
            allVideos = data.videos;
            filteredVideos = [...allVideos];
            
            // Update video count
            document.getElementById('totalVideos').textContent = allVideos.length;
            
            // Display videos
            updateVideoDisplay();
            updatePagination();
            
            // Load trending videos (top 6 by views)
            loadTrendingVideos();
            
            // Setup ad rotation
            setupAdRotation();
        } else {
            // No videos yet, show placeholder
            showNoVideosMessage();
        }
        
        // Load user key info if exists
        if (userKey) {
            updateKeyStatus();
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load videos. Please try again later.');
        
        // Use sample data for demonstration
        loadSampleData();
    }
}

// Load Trending Videos
function loadTrendingVideos() {
    const trendingContainer = document.getElementById('trendingVideos');
    
    if (!trendingContainer) return;
    
    // Sort videos by views (descending) and take top 6
    const trendingVideos = [...allVideos]
        .sort((a, b) => (b.countClick || 0) - (a.countClick || 0))
        .slice(0, 6);
    
    if (trendingVideos.length === 0) {
        trendingContainer.innerHTML = '<p class="no-videos">No trending videos yet.</p>';
        return;
    }
    
    trendingContainer.innerHTML = trendingVideos.map(video => createVideoCard(video, true)).join('');
    
    // Add event listeners to new video cards
    addVideoCardEventListeners();
}

// Update Video Display
function updateVideoDisplay() {
    const videosContainer = document.getElementById('newVideos');
    if (!videosContainer) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    const pageVideos = filteredVideos.slice(startIndex, endIndex);
    
    if (pageVideos.length === 0) {
        videosContainer.innerHTML = '<p class="no-videos">No videos found. Try a different filter or search term.</p>';
        return;
    }
    
    // Create video cards
    videosContainer.innerHTML = pageVideos.map(video => createVideoCard(video)).join('');
    
    // Add event listeners to new video cards
    addVideoCardEventListeners();
}

// Create Video Card HTML
function createVideoCard(video, isTrending = false) {
    const isVip = video.vip === true;
    const views = video.countClick || 0;
    const likes = video.like || 0;
    const duration = video.duration || '0:00';
    const thumbnail = video.thumbnail || `https://via.placeholder.com/300x169/6a0dad/ffffff?text=${encodeURIComponent(video.name || 'Video')}`;
    
    return `
        <div class="video-card" data-id="${video.id}" data-vip="${isVip}">
            <div class="video-thumbnail">
                <img src="${thumbnail}" alt="${video.name || 'Video'}">
                ${isVip ? '<div class="vip-lock"><i class="fas fa-lock"></i></div>' : ''}
                <div class="video-overlay">
                    <button class="play-btn">
                        <i class="fas fa-play"></i>
                    </button>
                </div>
                ${isVip ? '<div class="vip-badge"><i class="fas fa-crown"></i> VIP</div>' : ''}
                <div class="duration">${duration}</div>
            </div>
            <div class="video-info">
                <h3>${video.name || 'Untitled Video'}</h3>
                <div class="video-meta">
                    <span><i class="fas fa-eye"></i> ${formatNumber(views)}</span>
                    <span><i class="fas fa-heart"></i> ${formatNumber(likes)}</span>
                    ${isTrending ? '<span><i class="fas fa-fire"></i> Trending</span>' : ''}
                </div>
                <div class="video-uploader">
                    <i class="fas fa-user-shield"></i>
                    Uploaded By: <span class="verified">Admin <i class="fas fa-check-circle"></i></span>
                </div>
            </div>
        </div>
    `;
}

// Add Event Listeners to Video Cards
function addVideoCardEventListeners() {
    document.querySelectorAll('.video-card').forEach(card => {
        const videoId = card.getAttribute('data-id');
        const isVip = card.getAttribute('data-vip') === 'true';
        
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on play button (handled separately)
            if (e.target.closest('.play-btn')) return;
            
            if (isVip) {
                // Show VIP unlock modal
                showVipUnlockModal(videoId);
            } else {
                // Play free video
                playVideo(videoId);
            }
        });
        
        // Play button
        const playBtn = card.querySelector('.play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (isVip) {
                    // Show VIP unlock modal
                    showVipUnlockModal(videoId);
                } else {
                    // Play free video
                    playVideo(videoId);
                }
            });
        }
    });
}

// Show VIP Unlock Modal
function showVipUnlockModal(videoId) {
    currentVideoId = videoId;
    const video = allVideos.find(v => v.id == videoId);
    
    if (!video) return;
    
    // Update modal content
    document.getElementById('modalVideoTitle').textContent = video.name || 'VIP Video';
    document.getElementById('modalVideoDuration').textContent = video.duration || '0:00';
    document.getElementById('modalVideoViews').textContent = formatNumber(video.countClick || 0);
    document.getElementById('modalVideoThumb').src = video.thumbnail || `https://via.placeholder.com/100x60/6a0dad/ffffff?text=VIP`;
    
    // Update key status
    document.getElementById('remainingCount').textContent = keyRemainingUses;
    
    // Clear input and message
    document.getElementById('vipKeyInput').value = '';
    const keyMessage = document.getElementById('keyMessage');
    keyMessage.classList.add('hidden');
    keyMessage.textContent = '';
    
    // Show modal
    document.getElementById('vipModal').classList.remove('hidden');
    document.getElementById('vipKeyInput').focus();
}

// Validate VIP Key
async function validateVipKey() {
    const keyInput = document.getElementById('vipKeyInput');
    const key = keyInput.value.trim();
    const keyMessage = document.getElementById('keyMessage');
    
    if (!key) {
        showKeyMessage('Please enter a VIP key.', 'error');
        return;
    }
    
    // For demo purposes, accept any key starting with "SKH"
    if (key.startsWith('SKH')) {
        // Save key to localStorage
        localStorage.setItem('skandalhub_key', key);
        localStorage.setItem('skandalhub_key_uses', '30');
        
        userKey = key;
        keyRemainingUses = 30;
        
        showKeyMessage('Key validated successfully! You now have 30 unlocks remaining.', 'success');
        
        // Close modal and play video after delay
        setTimeout(() => {
            document.getElementById('vipModal').classList.add('hidden');
            playVideo(currentVideoId);
        }, 1500);
    } else {
        showKeyMessage('Invalid VIP key. Please check and try again.', 'error');
    }
    
    // In a real implementation, you would validate against the database
    // try {
    //     const response = await fetch(`${BIN_URL}/latest`, {
    //         headers: {
    //             'X-Master-Key': JSONBIN_API_KEY,
    //             'X-Bin-Meta': false
    //         }
    //     });
    //     
    //     if (response.ok) {
    //         const data = await response.json();
    //         const keys = data.keys || [];
    //         
    //         const validKey = keys.find(k => k.key === key && k.remaining > 0);
    //         
    //         if (validKey) {
    //             // Key is valid
    //             userKey = key;
    //             keyRemainingUses = validKey.remaining;
    //             
    //             // Update key uses in database
    //             validKey.remaining--;
    //             
    //             // Save to localStorage
    //             localStorage.setItem('skandalhub_key', key);
    //             localStorage.setItem('skandalhub_key_uses', validKey.remaining);
    //             
    //             showKeyMessage('Key validated successfully!', 'success');
    //             
    //             // Close modal and play video
    //             setTimeout(() => {
    //                 document.getElementById('vipModal').classList.add('hidden');
    //                 playVideo(currentVideoId);
    //             }, 1500);
    //         } else {
    //             showKeyMessage('Invalid or expired VIP key.', 'error');
    //         }
    //     }
    // } catch (error) {
    //     console.error('Error validating key:', error);
    //     showKeyMessage('Error validating key. Please try again.', 'error');
    // }
}

// Show Key Message
function showKeyMessage(message, type) {
    const keyMessage = document.getElementById('keyMessage');
    keyMessage.textContent = message;
    keyMessage.className = 'modal-message';
    keyMessage.classList.add(type);
    keyMessage.classList.remove('hidden');
}

// Update Key Status
function updateKeyStatus() {
    document.getElementById('remainingCount').textContent = keyRemainingUses;
}

// Play Video
function playVideo(videoId) {
    const video = allVideos.find(v => v.id == videoId);
    
    if (!video) {
        showError('Video not found.');
        return;
    }
    
    // Increment view count
    video.countClick = (video.countClick || 0) + 1;
    
    // Update in database (in a real implementation)
    // updateVideoInDatabase(video);
    
    // Update video player
    document.getElementById('playerVideoTitle').textContent = video.name || 'Video';
    document.getElementById('playerViews').textContent = formatNumber(video.countClick);
    document.getElementById('playerDuration').textContent = video.duration || '0:00';
    document.getElementById('playerDate').textContent = 'Just now';
    document.getElementById('playerLikes').textContent = formatNumber(video.like || 0);
    document.getElementById('playerDescription').textContent = video.description || 'No description available.';
    
    // Set video source
    const videoPlayer = document.getElementById('mainVideoPlayer');
    const videoSource = videoPlayer.querySelector('source');
    videoSource.src = video.linkvideo || '';
    videoPlayer.load();
    
    // Show video player
    document.getElementById('videoPlayer').classList.remove('hidden');
    
    // Load related videos
    loadRelatedVideos(videoId);
    
    // Add like button event listener
    document.getElementById('likeVideoBtn').onclick = () => likeVideo(videoId);
}

// Like Video
function likeVideo(videoId) {
    const video = allVideos.find(v => v.id == videoId);
    
    if (!video) return;
    
    // Increment like count
    video.like = (video.like || 0) + 1;
    
    // Update display
    document.getElementById('playerLikes').textContent = formatNumber(video.like);
    
    // Update in database (in a real implementation)
    // updateVideoInDatabase(video);
    
    // Update like button
    const likeBtn = document.getElementById('likeVideoBtn');
    likeBtn.innerHTML = `<i class="fas fa-heart"></i> <span>${formatNumber(video.like)}</span>`;
    likeBtn.style.color = '#ff4757';
    
    // Show feedback
    showNotification('Video liked!', 'success');
}

// Load Related Videos
function loadRelatedVideos(currentVideoId) {
    const relatedContainer = document.getElementById('relatedVideos');
    
    // Get videos excluding the current one
    const relatedVideos = allVideos
        .filter(v => v.id != currentVideoId)
        .slice(0, 4); // Show up to 4 related videos
    
    if (relatedVideos.length === 0) {
        relatedContainer.innerHTML = '<p class="no-related">No related videos found.</p>';
        return;
    }
    
    relatedContainer.innerHTML = relatedVideos.map(video => `
        <div class="related-video-card" data-id="${video.id}">
            <img src="${video.thumbnail || `https://via.placeholder.com/100x60/6a0dad/ffffff?text=${encodeURIComponent(video.name || 'Video')}`}" alt="${video.name}">
            <div class="related-video-info">
                <h5>${video.name || 'Untitled Video'}</h5>
                <div class="related-video-meta">
                    <span><i class="fas fa-eye"></i> ${formatNumber(video.countClick || 0)}</span>
                    <span><i class="fas fa-clock"></i> ${video.duration || '0:00'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to related videos
    document.querySelectorAll('.related-video-card').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.getAttribute('data-id');
            const video = allVideos.find(v => v.id == videoId);
            
            if (video && video.vip) {
                showVipUnlockModal(videoId);
            } else {
                playVideo(videoId);
            }
        });
    });
}

// Perform Search
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filteredVideos = [...allVideos];
    } else {
        filteredVideos = allVideos.filter(video => 
            video.name && video.name.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    updateVideoDisplay();
    updatePagination();
}

// Filter Videos
function filterVideos(filter) {
    if (filter === 'all') {
        filteredVideos = [...allVideos];
    } else if (filter === 'free') {
        filteredVideos = allVideos.filter(video => !video.vip);
    } else if (filter === 'vip') {
        filteredVideos = allVideos.filter(video => video.vip === true);
    }
    
    currentPage = 1;
    updateVideoDisplay();
    updatePagination();
}

// Update Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Setup Ad Rotation
function setupAdRotation() {
    const adContainer = document.getElementById('adContainer');
    if (!adContainer) return;
    
    const gifUrl = 'https://files.catbox.moe/gmd2fk.gif';
    const imageUrl = 'https://files.catbox.moe/op6wtn.jpg';
    
    let isGif = true;
    
    function updateAd() {
        if (isGif) {
            adContainer.innerHTML = `<img src="${gifUrl}" alt="Advertisement">`;
            isGif = false;
            setTimeout(updateAd, 15000); // 15 seconds for GIF
        } else {
            adContainer.innerHTML = `<img src="${imageUrl}" alt="Advertisement">`;
            isGif = true;
            setTimeout(updateAd, 5000); // 5 seconds for image
        }
    }
    
    // Start with GIF
    updateAd();
    
    // Clear any existing interval
    if (adInterval) clearInterval(adInterval);
    
    // Note: We're using recursive setTimeout instead of setInterval for different durations
}

// Load Sample Data (for demo when API fails)
function loadSampleData() {
    allVideos = [
        {
            id: 1,
            name: 'ANGGAZYY SERIES - Episode 1',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: '1:30',
            vip: false,
            countClick: 3250,
            like: 1240,
            thumbnail: 'https://via.placeholder.com/300x169/6a0dad/ffffff?text=ANGGAZYY+SERIES'
        },
        {
            id: 2,
            name: 'Exclusive VIP Content - Special Edition',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            duration: '2:45',
            vip: true,
            countClick: 2150,
            like: 980,
            thumbnail: 'https://via.placeholder.com/300x169/ffaa00/000000?text=VIP+EXCLUSIVE'
        },
        {
            id: 3,
            name: 'SKANDALHUB Premium Series',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            duration: '3:20',
            vip: false,
            countClick: 1890,
            like: 756,
            thumbnail: 'https://via.placeholder.com/300x169/6a0dad/ffffff?text=PREMIUM+SERIES'
        },
        {
            id: 4,
            name: 'Behind The Scenes - VIP Access',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            duration: '4:15',
            vip: true,
            countClick: 1650,
            like: 620,
            thumbnail: 'https://via.placeholder.com/300x169/ffaa00/000000?text=BEHIND+SCENES'
        },
        {
            id: 5,
            name: 'Top Trending Video of the Week',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            duration: '2:10',
            vip: false,
            countClick: 4320,
            like: 1870,
            thumbnail: 'https://via.placeholder.com/300x169/6a0dad/ffffff?text=TRENDING+NOW'
        },
        {
            id: 6,
            name: 'Limited Edition VIP Series',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
            duration: '3:45',
            vip: true,
            countClick: 1980,
            like: 890,
            thumbnail: 'https://via.placeholder.com/300x169/ffaa00/000000?text=LIMITED+EDITION'
        },
        {
            id: 7,
            name: 'New Release - Episode 2',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            duration: '1:55',
            vip: false,
            countClick: 1560,
            like: 540,
            thumbnail: 'https://via.placeholder.com/300x169/6a0dad/ffffff?text=NEW+RELEASE'
        },
        {
            id: 8,
            name: 'Exclusive Interview - VIP Only',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
            duration: '5:20',
            vip: true,
            countClick: 1760,
            like: 720,
            thumbnail: 'https://via.placeholder.com/300x169/ffaa00/000000?text=EXCLUSIVE+INTERVIEW'
        },
        {
            id: 9,
            name: 'Special Documentary Series',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
            duration: '3:30',
            vip: false,
            countClick: 2430,
            like: 980,
            thumbnail: 'https://via.placeholder.com/300x169/6a0dad/ffffff?text=DOCUMENTARY'
        },
        {
            id: 10,
            name: 'Premium VIP Collection',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            duration: '4:40',
            vip: true,
            countClick: 1890,
            like: 810,
            thumbnail: 'https://via.placeholder.com/300x169/ffaa00/000000?text=PREMIUM+VIP'
        }
    ];
    
    filteredVideos = [...allVideos];
    
    // Update video count
    document.getElementById('totalVideos').textContent = allVideos.length;
    
    // Display videos
    updateVideoDisplay();
    updatePagination();
    loadTrendingVideos();
    setupAdRotation();
}

// Show No Videos Message
function showNoVideosMessage() {
    const videosContainer = document.getElementById('newVideos');
    if (videosContainer) {
        videosContainer.innerHTML = `
            <div class="no-videos-message">
                <i class="fas fa-video-slash"></i>
                <h3>No videos available yet</h3>
                <p>Check back soon for new content!</p>
            </div>
        `;
    }
}

// Show Error Message
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button class="close-error"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Add close button event
    errorDiv.querySelector('.close-error').addEventListener('click', () => {
        errorDiv.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Format Number with Commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// ==============================
// ADMIN PAGE FUNCTIONS
// ==============================

// Admin Loading Screen
function startAdminLoadingScreen() {
    const loadingScreen = document.getElementById('adminLoading');
    const progressFill = document.querySelector('.admin-loading .progress-fill');
    
    // Simulate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += 5;
        progressFill.style.width = `${progress}%`;
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Hide loading screen
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    
                    // Show admin container
                    document.querySelector('.admin-container').classList.remove('hidden');
                }, 500);
            }, 500);
        }
    }, 100);
}

// Initialize Admin Event Listeners
function initAdminEventListeners() {
    // Logout button
    document.getElementById('adminLogout').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'index.html';
        }
    });
    
    // Upload form
    document.getElementById('uploadForm').addEventListener('submit', uploadVideo);
    
    // Generate keys button
    document.getElementById('generateKeysBtn').addEventListener('click', generateKeys);
    
    // Copy all keys button
    document.getElementById('copyAllKeys').addEventListener('click', copyAllKeys);
    
    // Clear keys button
    document.getElementById('clearKeys').addEventListener('click', clearGeneratedKeys);
    
    // Save settings button
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    
    // Reset settings button
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
    
    // Edit modal
    document.getElementById('closeEditModal').addEventListener('click', () => {
        document.getElementById('editModal').classList.add('hidden');
    });
    
    document.getElementById('cancelEdit').addEventListener('click', () => {
        document.getElementById('editModal').classList.add('hidden');
    });
    
    document.getElementById('editForm').addEventListener('submit', saveEditedVideo);
    
    // Search in manage section
    document.getElementById('manageSearch').addEventListener('input', filterManageVideos);
    document.getElementById('manageFilter').addEventListener('change', filterManageVideos);
}

// Setup Admin Navigation
function setupAdminNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get section to show
            const section = this.getAttribute('data-section');
            
            // Hide all sections
            document.querySelectorAll('.admin-section').forEach(s => {
                s.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(`${section}Section`).classList.add('active');
        });
    });
}

// Setup Form Previews
function setupFormPreviews() {
    // Update preview when form inputs change
    const formInputs = ['videoName', 'videoDuration', 'videoVIP', 'videoThumbnail', 'videoDescription'];
    
    formInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', updatePreview);
        }
    });
    
    // Initial preview update
    updatePreview();
}

// Update Preview
function updatePreview() {
    const name = document.getElementById('videoName').value || 'Video Title Will Appear Here';
    const duration = document.getElementById('videoDuration').value || '0:00';
    const isVip = document.getElementById('videoVIP').value === 'true';
    const thumbnail = document.getElementById('videoThumbnail').value || 
                     'https://via.placeholder.com/300x169/6a0dad/ffffff?text=Thumbnail+Preview';
    const description = document.getElementById('videoDescription').value || 
                       'Description will appear here';
    
    // Update preview elements
    document.getElementById('previewTitle').textContent = name;
    document.getElementById('previewDuration').textContent = duration;
    document.getElementById('previewBadge').textContent = isVip ? 'VIP' : 'FREE';
    document.getElementById('previewBadge').className = `preview-badge ${isVip ? 'vip' : ''}`;
    document.getElementById('previewThumb').src = thumbnail;
    document.getElementById('previewDescription').textContent = description;
}

// Load Admin Data
async function loadAdminData() {
    try {
        const response = await fetch(`${BIN_URL}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'X-Bin-Meta': false
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load admin data');
        }
        
        const data = await response.json();
        
        // Update stats
        updateAdminStats(data);
        
        // Load videos for management
        loadManageVideos(data.videos || []);
        
        // Load existing keys
        loadExistingKeys(data.keys || []);
        
    } catch (error) {
        console.error('Error loading admin data:', error);
        showAdminError('Failed to load admin data. Using sample data for demonstration.');
        
        // Load sample admin data
        loadSampleAdminData();
    }
}

// Update Admin Stats
function updateAdminStats(data) {
    const videos = data.videos || [];
    const keys = data.keys || [];
    
    // Count active keys (with remaining uses > 0)
    const activeKeys = keys.filter(key => key.remaining > 0).length;
    
    // Calculate total views and likes
    const totalViews = videos.reduce((sum, video) => sum + (video.countClick || 0), 0);
    const totalLikes = videos.reduce((sum, video) => sum + (video.like || 0), 0);
    const vipVideos = videos.filter(video => video.vip === true).length;
    
    // Update display
    document.getElementById('adminVideoCount').textContent = videos.length;
    document.getElementById('adminKeyCount').textContent = keys.length;
    document.getElementById('adminUserCount').textContent = formatNumber(totalViews);
    
    // Update analytics stats
    document.getElementById('analyticsTotalViews').textContent = formatNumber(totalViews);
    document.getElementById('analyticsTotalLikes').textContent = formatNumber(totalLikes);
    document.getElementById('analyticsVipVideos').textContent = vipVideos;
    document.getElementById('analyticsActiveKeys').textContent = activeKeys;
}

// Load Manage Videos
function loadManageVideos(videos) {
    const videosList = document.getElementById('manageVideosList');
    
    if (!videos || videos.length === 0) {
        videosList.innerHTML = '<p class="no-videos">No videos uploaded yet.</p>';
        return;
    }
    
    // Sort by ID (newest first)
    videos.sort((a, b) => b.id - a.id);
    
    videosList.innerHTML = videos.map(video => `
        <div class="manage-video-card" data-id="${video.id}">
            <div class="manage-video-header">
                <h4>${video.name || 'Untitled Video'}</h4>
                <div class="video-actions-small">
                    <button class="btn-edit" data-id="${video.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-id="${video.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="manage-video-details">
                <div>
                    <span>ID:</span> <strong>${video.id}</strong>
                </div>
                <div>
                    <span>Status:</span> <strong>${video.vip ? 'VIP' : 'FREE'}</strong>
                </div>
                <div>
                    <span>Duration:</span> <strong>${video.duration || '0:00'}</strong>
                </div>
                <div>
                    <span>Views:</span> <strong>${formatNumber(video.countClick || 0)}</strong>
                </div>
            </div>
            <div class="manage-video-stats">
                <span><i class="fas fa-eye"></i> ${formatNumber(video.countClick || 0)} views</span>
                <span><i class="fas fa-heart"></i> ${formatNumber(video.like || 0)} likes</span>
                <span><i class="fas fa-clock"></i> ${video.duration || '0:00'}</span>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoId = btn.getAttribute('data-id');
            editVideo(videoId);
        });
    });
    
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const videoId = btn.getAttribute('data-id');
            deleteVideo(videoId);
        });
    });
}

// Filter Manage Videos
function filterManageVideos() {
    const searchTerm = document.getElementById('manageSearch').value.toLowerCase();
    const filterValue = document.getElementById('manageFilter').value;
    
    const videoCards = document.querySelectorAll('.manage-video-card');
    
    videoCards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const status = card.querySelector('.manage-video-details div:nth-child(2) strong').textContent;
        
        let matchesSearch = true;
        let matchesFilter = true;
        
        // Check search term
        if (searchTerm && !title.includes(searchTerm)) {
            matchesSearch = false;
        }
        
        // Check filter
        if (filterValue === 'free' && status !== 'FREE') {
            matchesFilter = false;
        } else if (filterValue === 'vip' && status !== 'VIP') {
            matchesFilter = false;
        }
        
        // Show/hide card
        if (matchesSearch && matchesFilter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Edit Video
function editVideo(videoId) {
    // Find video
    const video = allVideos.find(v => v.id == videoId);
    
    if (!video) {
        showAdminError('Video not found.');
        return;
    }
    
    // Populate edit form
    document.getElementById('editVideoId').value = video.id;
    document.getElementById('editVideoName').value = video.name || '';
    document.getElementById('editVideoLink').value = video.linkvideo || '';
    document.getElementById('editVideoDuration').value = video.duration || '';
    document.getElementById('editVideoVIP').value = video.vip ? 'true' : 'false';
    
    // Show modal
    document.getElementById('editModal').classList.remove('hidden');
}

// Save Edited Video
async function saveEditedVideo(e) {
    e.preventDefault();
    
    const videoId = document.getElementById('editVideoId').value;
    const name = document.getElementById('editVideoName').value.trim();
    const linkvideo = document.getElementById('editVideoLink').value.trim();
    const duration = document.getElementById('editVideoDuration').value.trim();
    const vip = document.getElementById('editVideoVIP').value === 'true';
    
    if (!name || !linkvideo || !duration) {
        showAdminError('Please fill in all required fields.');
        return;
    }
    
    try {
        // Find and update video in local array
        const videoIndex = allVideos.findIndex(v => v.id == videoId);
        
        if (videoIndex === -1) {
            showAdminError('Video not found.');
            return;
        }
        
        // Update video
        allVideos[videoIndex] = {
            ...allVideos[videoIndex],
            name,
            linkvideo,
            duration,
            vip
        };
        
        // Save to database (in a real implementation)
        // await saveVideosToDatabase();
        
        // Show success message
        showAdminSuccess('Video updated successfully!');
        
        // Update display
        loadManageVideos(allVideos);
        
        // Close modal
        document.getElementById('editModal').classList.add('hidden');
        
        // Update stats
        updateAdminStats({ videos: allVideos, keys: [] });
        
    } catch (error) {
        console.error('Error updating video:', error);
        showAdminError('Failed to update video. Please try again.');
    }
}

// Delete Video
async function deleteVideo(videoId) {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
        return;
    }
    
    try {
        // Remove video from local array
        const videoIndex = allVideos.findIndex(v => v.id == videoId);
        
        if (videoIndex === -1) {
            showAdminError('Video not found.');
            return;
        }
        
        allVideos.splice(videoIndex, 1);
        
        // Save to database (in a real implementation)
        // await saveVideosToDatabase();
        
        // Show success message
        showAdminSuccess('Video deleted successfully!');
        
        // Update display
        loadManageVideos(allVideos);
        
        // Update stats
        updateAdminStats({ videos: allVideos, keys: [] });
        
    } catch (error) {
        console.error('Error deleting video:', error);
        showAdminError('Failed to delete video. Please try again.');
    }
}

// Load Existing Keys
function loadExistingKeys(keys) {
    const tableBody = document.getElementById('existingKeysTable');
    
    if (!keys || keys.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-keys">No keys generated yet.</td>
            </tr>
        `;
        return;
    }
    
    // Sort by creation date (newest first)
    keys.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    tableBody.innerHTML = keys.map(key => `
        <tr>
            <td><code>${key.key}</code></td>
            <td>${key.remaining}</td>
            <td>${formatDate(key.created)}</td>
            <td>
                <span class="key-status-badge ${key.remaining > 0 ? 'active' : 'expired'}">
                    ${key.remaining > 0 ? 'Active' : 'Expired'}
                </span>
            </td>
        </tr>
    `).join('');
}

// Upload Video
async function uploadVideo(e) {
    e.preventDefault();
    
    const name = document.getElementById('videoName').value.trim();
    const linkvideo = document.getElementById('videoLink').value.trim();
    const duration = document.getElementById('videoDuration').value.trim();
    const vip = document.getElementById('videoVIP').value === 'true';
    const thumbnail = document.getElementById('videoThumbnail').value.trim();
    const description = document.getElementById('videoDescription').value.trim();
    
    if (!name || !linkvideo || !duration) {
        showAdminError('Please fill in all required fields (Name, Link, Duration).');
        return;
    }
    
    try {
        // Generate new ID (highest existing ID + 1)
        const maxId = allVideos.length > 0 ? Math.max(...allVideos.map(v => v.id)) : 0;
        const newId = maxId + 1;
        
        // Create new video object
        const newVideo = {
            id: newId,
            name,
            linkvideo,
            duration,
            vip,
            countClick: 0,
            like: 0,
            thumbnail: thumbnail || `https://via.placeholder.com/300x169/${vip ? 'ffaa00' : '6a0dad'}/ffffff?text=${encodeURIComponent(name)}`,
            description: description || 'No description available.'
        };
        
        // Add to local array
        allVideos.unshift(newVideo); // Add to beginning for newest first
        
        // Save to database (in a real implementation)
        // await saveVideosToDatabase();
        
        // Show success message
        showAdminSuccess('Video uploaded successfully!');
        
        // Reset form
        document.getElementById('uploadForm').reset();
        updatePreview();
        
        // Update video list
        loadManageVideos(allVideos);
        
        // Update stats
        updateAdminStats({ videos: allVideos, keys: [] });
        
        // Show status message
        const uploadStatus = document.getElementById('uploadStatus');
        uploadStatus.classList.remove('hidden');
        
        // Hide status after 3 seconds
        setTimeout(() => {
            uploadStatus.classList.add('hidden');
        }, 3000);
        
    } catch (error) {
        console.error('Error uploading video:', error);
        showAdminError('Failed to upload video. Please try again.');
    }
}

// Generate Keys
function generateKeys() {
    const quantity = parseInt(document.getElementById('keyQuantity').value) || 1;
    const prefix = document.getElementById('keyPrefix').value.trim().toUpperCase() || 'SKH';
    
    if (quantity < 1 || quantity > 50) {
        showAdminError('Please enter a quantity between 1 and 50.');
        return;
    }
    
    const keysList = document.getElementById('generatedKeys');
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < quantity; i++) {
        // Generate a random key
        const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
        const key = `${prefix}-${randomPart}`;
        
        // Create key item
        const keyItem = document.createElement('div');
        keyItem.className = 'key-item';
        keyItem.innerHTML = `
            <span>${key}</span>
            <button class="copy-key" data-key="${key}">
                <i class="fas fa-copy"></i>
            </button>
        `;
        
        // Add copy functionality
        const copyBtn = keyItem.querySelector('.copy-key');
        copyBtn.addEventListener('click', function() {
            copyToClipboard(this.getAttribute('data-key'));
            showAdminSuccess('Key copied to clipboard!');
        });
        
        fragment.appendChild(keyItem);
    }
    
    // Clear "no keys" message if present
    const noKeysMsg = keysList.querySelector('.no-keys');
    if (noKeysMsg) {
        keysList.removeChild(noKeysMsg);
    }
    
    // Add new keys to the beginning
    keysList.insertBefore(fragment, keysList.firstChild);
    
    // Show success message
    showAdminSuccess(`${quantity} key(s) generated successfully!`);
}

// Copy All Keys
function copyAllKeys() {
    const keyItems = document.querySelectorAll('.key-item span');
    
    if (keyItems.length === 0) {
        showAdminError('No keys to copy.');
        return;
    }
    
    const keys = Array.from(keyItems).map(span => span.textContent).join('\n');
    
    copyToClipboard(keys);
    showAdminSuccess('All keys copied to clipboard!');
}

// Clear Generated Keys
function clearGeneratedKeys() {
    if (!confirm('Are you sure you want to clear all generated keys? This action cannot be undone.')) {
        return;
    }
    
    const keysList = document.getElementById('generatedKeys');
    keysList.innerHTML = '<p class="no-keys">No keys generated yet. Click "Generate Keys" to create new keys.</p>';
    
    showAdminSuccess('Generated keys cleared.');
}

// Save Settings
async function saveSettings() {
    try {
        // Get settings values
        const binId = document.getElementById('binId').value.trim();
        const bannerGif = document.getElementById('bannerGif').value.trim();
        const bannerImage = document.getElementById('bannerImage').value.trim();
        const gifDuration = parseInt(document.getElementById('gifDuration').value) || 15;
        const imageDuration = parseInt(document.getElementById('imageDuration').value) || 5;
        const adminName = document.getElementById('adminName').value.trim();
        const defaultThumbnail = document.getElementById('defaultThumbnail').value.trim();
        
        // Validate
        if (!binId) {
            showAdminError('Bin ID is required.');
            return;
        }
        
        // Save to localStorage (in a real implementation, you might save to database)
        const settings = {
            binId,
            bannerGif,
            bannerImage,
            gifDuration,
            imageDuration,
            adminName,
            defaultThumbnail,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('skandalhub_admin_settings', JSON.stringify(settings));
        
        // Show success message
        showAdminSuccess('Settings saved successfully!');
        
        // Update BIN_ID global variable
        if (typeof BIN_ID !== 'undefined') {
            // Note: In a real implementation, you would update the global variable
            // BIN_ID = binId;
        }
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showAdminError('Failed to save settings. Please try again.');
    }
}

// Reset Settings
function resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to default values?')) {
        return;
    }
    
    // Reset form values
    document.getElementById('binId').value = '66d5d5cfe41b4d34e4f8c7a3';
    document.getElementById('bannerGif').value = 'https://files.catbox.moe/gmd2fk.gif';
    document.getElementById('bannerImage').value = 'https://files.catbox.moe/op6wtn.jpg';
    document.getElementById('gifDuration').value = 15;
    document.getElementById('imageDuration').value = 5;
    document.getElementById('adminName').value = 'Admin';
    document.getElementById('defaultThumbnail').value = 'https://via.placeholder.com/300x169/6a0dad/ffffff?text=SKANDALHUB';
    
    // Clear localStorage
    localStorage.removeItem('skandalhub_admin_settings');
    
    showAdminSuccess('Settings reset to default values.');
}

// Load Sample Admin Data
function loadSampleAdminData() {
    // Sample videos
    allVideos = [
        {
            id: 1,
            name: 'ANGGAZYY SERIES - Episode 1',
            linkvideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            duration: '1:30',
            vip: false,
            countClick: 3250,
            like: 1240,
            thumbnail: 'https://via.placeholder.com/300x169/6a0dad/ffffff?text=ANGGAZYY+SERIES',
            description: 'First episode of the popular ANGGAYY SERIES.'
        },
        // ... (same sample videos as in main page)
    ];
    
    // Sample keys
    const sampleKeys = [
        { key: 'SKH-ABC123DE', remaining: 15, created: '2025-01-15T10:30:00Z' },
        { key: 'SKH-XYZ789FG', remaining: 30, created: '2025-01-10T14:20:00Z' },
        { key: 'SKH-DEF456GH', remaining: 0, created: '2025-01-05T09:15:00Z' },
        { key: 'SKH-MNO123IJ', remaining: 5, created: '2025-01-01T16:45:00Z' }
    ];
    
    // Update admin stats
    updateAdminStats({ videos: allVideos, keys: sampleKeys });
    
    // Load videos for management
    loadManageVideos(allVideos);
    
    // Load existing keys
    loadExistingKeys(sampleKeys);
}

// Show Admin Error
function showAdminError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'admin-error-notification';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button class="close-admin-error"><i class="fas fa-times"></i></button>
    `;
    
    document.querySelector('.admin-content').appendChild(errorDiv);
    
    // Add close button event
    errorDiv.querySelector('.close-admin-error').addEventListener('click', () => {
        errorDiv.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Show Admin Success
function showAdminSuccess(message) {
    // Create success notification
    const successDiv = document.createElement('div');
    successDiv.className = 'admin-success-notification';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.querySelector('.admin-content').appendChild(successDiv);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Utility Functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on and initialize accordingly
    if (document.body.classList.contains('admin-body')) {
        initAdminPage();
    } else {
        initMainPage();
    }
});