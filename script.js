// Configuration
const API_KEY = '$2a$10$EG.QfA7ThwjokzPkTJ4hKuO6pCKkBd6wjKDK2LzLvR/pFm0OE6nVm';
const BIN_ID = '6957d8c9ae596e708fc04a40'; // JSONBin bin ID
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// Application State
let appState = {
    videos: [],
    keys: [],
    trendingVideos: [],
    freeVideos: [],
    vipVideos: [],
    currentUserKey: null,
    currentPage: 1,
    videosPerPage: 10,
    totalPages: 1
};

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const progressFill = document.getElementById('progressFill');
const currentProgress = document.getElementById('currentProgress');
const welcomePopup = document.getElementById('welcomePopup');
const closePopupBtn = document.getElementById('closePopup');
const vipPopup = document.getElementById('vipPopup');
const vipKeyInput = document.getElementById('vipKeyInput');
const confirmKeyBtn = document.getElementById('confirmKeyBtn');
const cancelKeyBtn = document.getElementById('cancelKeyBtn');
const keyResult = document.getElementById('keyResult');
const remainingUses = document.getElementById('remainingUses');
const videoModal = document.getElementById('videoModal');
const closeVideoModal = document.getElementById('closeVideoModal');
const mainVideoPlayer = document.getElementById('mainVideoPlayer');
const modalVideoTitle = document.getElementById('modalVideoTitle');
const modalVideoViews = document.getElementById('modalVideoViews');
const modalVideoLikes = document.getElementById('modalVideoLikes');
const modalVideoDuration = document.getElementById('modalVideoDuration');
const likeVideoBtn = document.getElementById('likeVideoBtn');
const downloadVideoBtn = document.getElementById('downloadVideoBtn');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenu = document.getElementById('closeMobileMenu');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const trendingVideosContainer = document.getElementById('trendingVideos');
const newVideosContainer = document.getElementById('newVideos');
const freeVideosContainer = document.getElementById('freeVideos');
const vipVideosContainer = document.getElementById('vipVideos');
const prevTrendingBtn = document.getElementById('prevTrendingBtn');
const nextTrendingBtn = document.getElementById('nextTrendingBtn');
const trendingPage = document.getElementById('trendingPage');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageNumbers = document.getElementById('pageNumbers');
const adImage = document.getElementById('adImage');
const noTrendingVideos = document.getElementById('noTrendingVideos');
const noNewVideos = document.getElementById('noNewVideos');
const noFreeVideos = document.getElementById('noFreeVideos');
const noVipVideos = document.getElementById('noVipVideos');

// Admin DOM Elements
const adminLoading = document.getElementById('adminLoading');
const uploadForm = document.getElementById('uploadForm');
const uploadBtn = document.getElementById('uploadBtn');
const uploadResult = document.getElementById('uploadResult');
const videoVIP = document.getElementById('videoVIP');
const vipStatusLabel = document.getElementById('vipStatusLabel');
const generateKeyBtn = document.getElementById('generateKeyBtn');
const copyKeyBtn = document.getElementById('copyKeyBtn');
const keyDisplay = document.getElementById('keyDisplay');
const keyGenerateResult = document.getElementById('keyGenerateResult');
const totalVideos = document.getElementById('totalVideos');
const vipVideosCount = document.getElementById('vipVideosCount');
const freeVideosCount = document.getElementById('freeVideosCount');
const uploadLink = document.getElementById('uploadLink');
const keysLink = document.getElementById('keysLink');
const videosLink = document.getElementById('videosLink');
const uploadSection = document.getElementById('uploadSection');
const keysSection = document.getElementById('keysSection');
const videosSection = document.getElementById('videosSection');
const adminVideosList = document.getElementById('adminVideosList');
const noAdminVideos = document.getElementById('noAdminVideos');
const adminSearch = document.getElementById('adminSearch');
const adminSearchBtn = document.getElementById('adminSearchBtn');
const videoFilter = document.getElementById('videoFilter');
const sortVideos = document.getElementById('sortVideos');

// Current video for VIP access
let currentVipVideo = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on admin page or main page
    if (document.body.classList.contains('admin-body')) {
        initAdminPage();
    } else {
        initMainPage();
    }
});

// Main Page Initialization
async function initMainPage() {
    // Start loading screen animation
    startLoadingAnimation();
    
    // Load data from JSONBin
    await loadDataFromJSONBin();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize ad rotation
    initAdRotation();
    
    // Show welcome popup after loading
    setTimeout(() => {
        welcomePopup.classList.add('active');
    }, 1000);
}

// Admin Page Initialization
async function initAdminPage() {
    // Show admin loading
    adminLoading.style.display = 'flex';
    
    // Load data from JSONBin
    await loadDataFromJSONBin();
    
    // Setup admin event listeners
    setupAdminEventListeners();
    
    // Update admin stats
    updateAdminStats();
    
    // Load videos for management
    loadAdminVideos();
    
    // Hide admin loading
    setTimeout(() => {
        adminLoading.style.display = 'none';
    }, 1000);
}

// Loading Screen Animation
function startLoadingAnimation() {
    let progress = 0;
    const totalFeatures = 30;
    const featureItems = document.querySelectorAll('.feature-item');
    
    const progressInterval = setInterval(() => {
        progress++;
        currentProgress.textContent = progress;
        const percentage = (progress / totalFeatures) * 100;
        progressFill.style.width = `${percentage}%`;
        
        // Update feature items
        if (progress <= 5) {
            featureItems[progress - 1].classList.add('active');
        }
        
        if (progress >= totalFeatures) {
            clearInterval(progressInterval);
            
            // Hide loading screen after a delay
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.visibility = 'hidden';
                
                // Initialize content
                displayVideos();
                
                // Add fade-in animation to sections
                const sections = document.querySelectorAll('.fade-in');
                sections.forEach((section, index) => {
                    setTimeout(() => {
                        section.style.opacity = '1';
                        section.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }, 800);
        }
    }, 150);
}

// Load data from JSONBin
async function loadDataFromJSONBin() {
    try {
        const response = await fetch(BIN_URL, {
            headers: {
                'X-Master-Key': API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load data from JSONBin');
        }
        
        const data = await response.json();
        const binData = data.record || {};
        
        // Initialize data structure if empty
        if (!binData.videos) binData.videos = [];
        if (!binData.keys) binData.keys = [];
        
        appState.videos = binData.videos;
        appState.keys = binData.keys;
        
        // Process videos
        processVideos();
        
        // Load user key from localStorage
        const savedKey = localStorage.getItem('skandalhub_user_key');
        if (savedKey) {
            const keyData = appState.keys.find(k => k.key === savedKey);
            if (keyData && keyData.uses > 0) {
                appState.currentUserKey = keyData;
                updateRemainingUses();
            } else {
                localStorage.removeItem('skandalhub_user_key');
            }
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        // Initialize empty state if loading fails
        appState.videos = [];
        appState.keys = [];
    }
}

// Save data to JSONBin
async function saveDataToJSONBin() {
    try {
        const dataToSave = {
            videos: appState.videos,
            keys: appState.keys
        };
        
        const response = await fetch(BIN_URL, {
            method: 'PUT',
            headers: {
                'X-Master-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSave)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save data to JSONBin');
        }
        
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Process videos into categories
function processVideos() {
    // Sort by views for trending
    appState.trendingVideos = [...appState.videos]
        .sort((a, b) => b.countClick - a.countClick)
        .slice(0, 10);
    
    // Separate free and VIP videos
    appState.freeVideos = appState.videos.filter(video => !video.vip);
    appState.vipVideos = appState.videos.filter(video => video.vip);
    
    // Calculate total pages for pagination
    appState.totalPages = Math.ceil(appState.videos.length / appState.videosPerPage);
}

// Display videos on the page
function displayVideos() {
    // Display trending videos
    displayTrendingVideos();
    
    // Display new content with pagination
    displayNewVideos();
    
    // Display free videos
    displayFreeVideos();
    
    // Display VIP videos
    displayVipVideos();
    
    // Update pagination controls
    updatePagination();
}

// Display trending videos
function displayTrendingVideos() {
    if (appState.trendingVideos.length === 0) {
        noTrendingVideos.style.display = 'block';
        trendingVideosContainer.innerHTML = '';
        return;
    }
    
    noTrendingVideos.style.display = 'none';
    trendingVideosContainer.innerHTML = '';
    
    appState.trendingVideos.forEach((video, index) => {
        const videoCard = createVideoCard(video, index);
        trendingVideosContainer.appendChild(videoCard);
    });
}

// Display new videos with pagination
function displayNewVideos() {
    const startIndex = (appState.currentPage - 1) * appState.videosPerPage;
    const endIndex = startIndex + appState.videosPerPage;
    const pageVideos = appState.videos.slice(startIndex, endIndex);
    
    if (pageVideos.length === 0) {
        noNewVideos.style.display = 'block';
        newVideosContainer.innerHTML = '';
        return;
    }
    
    noNewVideos.style.display = 'none';
    newVideosContainer.innerHTML = '';
    
    pageVideos.forEach((video, index) => {
        const videoCard = createVideoCard(video, index);
        newVideosContainer.appendChild(videoCard);
    });
}

// Display free videos
function displayFreeVideos() {
    if (appState.freeVideos.length === 0) {
        noFreeVideos.style.display = 'block';
        freeVideosContainer.innerHTML = '';
        return;
    }
    
    noFreeVideos.style.display = 'none';
    freeVideosContainer.innerHTML = '';
    
    // Show only first 6 free videos
    appState.freeVideos.slice(0, 6).forEach((video, index) => {
        const videoCard = createVideoCard(video, index);
        freeVideosContainer.appendChild(videoCard);
    });
}

// Display VIP videos
function displayVipVideos() {
    if (appState.vipVideos.length === 0) {
        noVipVideos.style.display = 'block';
        vipVideosContainer.innerHTML = '';
        return;
    }
    
    noVipVideos.style.display = 'none';
    vipVideosContainer.innerHTML = '';
    
    // Show only first 6 VIP videos
    appState.vipVideos.slice(0, 6).forEach((video, index) => {
        const videoCard = createVideoCard(video, index);
        vipVideosContainer.appendChild(videoCard);
    });
}

// Create video card element
function createVideoCard(video, index) {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const isVip = video.vip;
    const canWatch = !isVip || (appState.currentUserKey && appState.currentUserKey.uses > 0);
    
    card.innerHTML = `
        <div class="video-thumbnail">
            <img src="${video.thumbnail || 'https://via.placeholder.com/300x180/8a2be2/ffffff?text=SKANDALHUB'}" alt="${video.nama}" loading="lazy">
            ${isVip && !canWatch ? `
                <div class="vip-lock">
                    <i class="fas fa-lock"></i>
                    <span>VIP ONLY</span>
                </div>
            ` : ''}
            <div class="video-duration">${video.durasi}</div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.nama}</h3>
            <div class="video-meta">
                <div class="video-stats">
                    <span><i class="fas fa-eye"></i> ${video.countClick || 0}</span>
                    <span><i class="fas fa-thumbs-up"></i> ${video.like || 0}</span>
                </div>
                <div class="uploader">
                    <span>Admin</span>
                    <i class="fas fa-check-circle verified"></i>
                </div>
            </div>
            <button class="watch-btn" data-video-id="${video.id}">
                <i class="fas fa-play"></i> ${isVip ? 'Watch VIP' : 'Watch Now'}
            </button>
        </div>
    `;
    
    // Add click event to watch button
    const watchBtn = card.querySelector('.watch-btn');
    watchBtn.addEventListener('click', () => {
        if (isVip && !canWatch) {
            // Show VIP popup
            showVipPopup(video);
        } else {
            // Play video
            playVideo(video);
        }
    });
    
    return card;
}

// Setup event listeners for main page
function setupEventListeners() {
    // Welcome popup close button
    closePopupBtn.addEventListener('click', () => {
        welcomePopup.classList.remove('active');
    });
    
    // VIP popup buttons
    confirmKeyBtn.addEventListener('click', confirmVipKey);
    cancelKeyBtn.addEventListener('click', () => {
        vipPopup.classList.remove('active');
    });
    
    // Video modal close button
    closeVideoModal.addEventListener('click', () => {
        videoModal.classList.remove('active');
        mainVideoPlayer.pause();
    });
    
    // Like video button
    likeVideoBtn.addEventListener('click', likeCurrentVideo);
    
    // Hamburger menu
    hamburgerMenu.addEventListener('click', () => {
        mobileMenu.classList.add('active');
    });
    
    closeMobileMenu.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Trending navigation
    prevTrendingBtn.addEventListener('click', () => {
        // In a real app, this would load previous trending page
        alert('In a full implementation, this would load previous trending videos');
    });
    
    nextTrendingBtn.addEventListener('click', () => {
        // In a real app, this would load next trending page
        alert('In a full implementation, this would load next trending videos');
    });
    
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (appState.currentPage > 1) {
            appState.currentPage--;
            displayNewVideos();
            updatePagination();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (appState.currentPage < appState.totalPages) {
            appState.currentPage++;
            displayNewVideos();
            updatePagination();
        }
    });
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target === welcomePopup) {
            welcomePopup.classList.remove('active');
        }
        if (e.target === vipPopup) {
            vipPopup.classList.remove('active');
        }
        if (e.target === videoModal) {
            videoModal.classList.remove('active');
            mainVideoPlayer.pause();
        }
    });
}

// Setup admin event listeners
function setupAdminEventListeners() {
    // VIP toggle
    videoVIP.addEventListener('change', () => {
        vipStatusLabel.textContent = videoVIP.checked ? 'VIP' : 'Gratis';
    });
    
    // Upload form
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await uploadNewContent();
    });
    
    // Generate key button
    generateKeyBtn.addEventListener('click', generateNewKey);
    
    // Copy key button
    copyKeyBtn.addEventListener('click', copyKeyToClipboard);
    
    // Admin navigation
    uploadLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchAdminSection('upload');
    });
    
    keysLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchAdminSection('keys');
    });
    
    videosLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchAdminSection('videos');
    });
    
    // Admin search
    adminSearchBtn.addEventListener('click', () => {
        loadAdminVideos();
    });
    
    adminSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadAdminVideos();
    });
    
    // Admin filters
    videoFilter.addEventListener('change', () => {
        loadAdminVideos();
    });
    
    sortVideos.addEventListener('change', () => {
        loadAdminVideos();
    });
}

// Upload new content
async function uploadNewContent() {
    const videoName = document.getElementById('videoName').value;
    const videoLink = document.getElementById('videoLink').value;
    const thumbnailLink = document.getElementById('thumbnailLink').value;
    const videoDuration = document.getElementById('videoDuration').value;
    const isVip = videoVIP.checked;
    
    // Validate inputs
    if (!videoName || !videoLink || !thumbnailLink || !videoDuration) {
        showUploadResult('Please fill in all fields', 'error');
        return;
    }
    
    // Show loading state
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    uploadBtn.disabled = true;
    
    try {
        // Create new video object
        const newVideo = {
            id: appState.videos.length > 0 ? Math.max(...appState.videos.map(v => v.id)) + 1 : 1,
            nama: videoName,
            linkvideo: videoLink,
            thumbnail: thumbnailLink,
            durasi: formatDuration(videoDuration),
            vip: isVip,
            countClick: 0,
            like: 0,
            uploadDate: new Date().toISOString()
        };
        
        // Add to videos array
        appState.videos.unshift(newVideo);
        
        // Save to JSONBin
        const success = await saveDataToJSONBin();
        
        if (success) {
            // Reset form
            uploadForm.reset();
            vipStatusLabel.textContent = 'Gratis';
            
            // Show success message
            showUploadResult('Video uploaded successfully!', 'success');
            
            // Update admin stats
            updateAdminStats();
            
            // Reload videos list
            loadAdminVideos();
            
            // Process videos for main page
            processVideos();
        } else {
            showUploadResult('Failed to save video. Please try again.', 'error');
            // Remove from state if save failed
            appState.videos.shift();
        }
    } catch (error) {
        console.error('Upload error:', error);
        showUploadResult('An error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload New Content';
        uploadBtn.disabled = false;
    }
}

// Show upload result
function showUploadResult(message, type) {
    uploadResult.textContent = message;
    uploadResult.className = 'upload-result ' + type;
    uploadResult.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        uploadResult.style.display = 'none';
    }, 5000);
}

// Generate new VIP key
async function generateNewKey() {
    // Show loading state
    generateKeyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateKeyBtn.disabled = true;
    
    try {
        // Generate random key
        const key = 'SKH-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Create key object
        const keyData = {
            key: key,
            uses: 30,
            generatedAt: new Date().toISOString(),
            lastUsed: null
        };
        
        // Add to keys array
        appState.keys.push(keyData);
        
        // Save to JSONBin
        const success = await saveDataToJSONBin();
        
        if (success) {
            // Display key
            keyDisplay.innerHTML = `<p class="generated-key">${key}</p>`;
            
            // Enable copy button
            copyKeyBtn.disabled = false;
            
            // Show success message
            showKeyGenerateResult('Key generated successfully!', 'success');
        } else {
            showKeyGenerateResult('Failed to save key. Please try again.', 'error');
            // Remove from state if save failed
            appState.keys.pop();
        }
    } catch (error) {
        console.error('Key generation error:', error);
        showKeyGenerateResult('An error occurred. Please try again.', 'error');
    } finally {
        // Reset button state
        generateKeyBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Key';
        generateKeyBtn.disabled = false;
    }
}

// Show key generate result
function showKeyGenerateResult(message, type) {
    keyGenerateResult.textContent = message;
    keyGenerateResult.className = 'key-result ' + type;
    keyGenerateResult.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        keyGenerateResult.style.display = 'none';
    }, 5000);
}

// Copy key to clipboard
function copyKeyToClipboard() {
    const keyElement = keyDisplay.querySelector('.generated-key');
    if (!keyElement) return;
    
    const key = keyElement.textContent;
    
    navigator.clipboard.writeText(key).then(() => {
        // Show temporary success message on button
        const originalHTML = copyKeyBtn.innerHTML;
        copyKeyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyKeyBtn.style.background = 'var(--success)';
        
        setTimeout(() => {
            copyKeyBtn.innerHTML = originalHTML;
            copyKeyBtn.style.background = '';
        }, 2000);
    });
}

// Switch admin section
function switchAdminSection(section) {
    // Remove active class from all sections and links
    [uploadSection, keysSection, videosSection].forEach(sec => {
        sec.classList.remove('active');
    });
    
    [uploadLink, keysLink, videosLink].forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to selected section and link
    switch(section) {
        case 'upload':
            uploadSection.classList.add('active');
            uploadLink.classList.add('active');
            break;
        case 'keys':
            keysSection.classList.add('active');
            keysLink.classList.add('active');
            break;
        case 'videos':
            videosSection.classList.add('active');
            videosLink.classList.add('active');
            break;
    }
}

// Update admin stats
function updateAdminStats() {
    totalVideos.textContent = appState.videos.length;
    vipVideosCount.textContent = appState.vipVideos.length;
    freeVideosCount.textContent = appState.freeVideos.length;
}

// Load videos for admin management
function loadAdminVideos() {
    let filteredVideos = [...appState.videos];
    
    // Apply search filter
    const searchTerm = adminSearch.value.toLowerCase();
    if (searchTerm) {
        filteredVideos = filteredVideos.filter(video => 
            video.nama.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply VIP/free filter
    const filterValue = videoFilter.value;
    if (filterValue === 'vip') {
        filteredVideos = filteredVideos.filter(video => video.vip);
    } else if (filterValue === 'free') {
        filteredVideos = filteredVideos.filter(video => !video.vip);
    }
    
    // Apply sorting
    const sortValue = sortVideos.value;
    switch(sortValue) {
        case 'newest':
            filteredVideos.sort((a, b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0));
            break;
        case 'oldest':
            filteredVideos.sort((a, b) => new Date(a.uploadDate || 0) - new Date(b.uploadDate || 0));
            break;
        case 'popular':
            filteredVideos.sort((a, b) => b.countClick - a.countClick);
            break;
    }
    
    // Display videos
    if (filteredVideos.length === 0) {
        noAdminVideos.style.display = 'block';
        adminVideosList.innerHTML = '';
        return;
    }
    
    noAdminVideos.style.display = 'none';
    adminVideosList.innerHTML = '';
    
    filteredVideos.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'admin-video-item';
        
        videoItem.innerHTML = `
            <div class="admin-video-header">
                <h3 class="admin-video-title">${video.nama}</h3>
                <span class="admin-video-badge ${video.vip ? 'vip' : 'free'}">
                    ${video.vip ? 'VIP' : 'FREE'}
                </span>
            </div>
            <div class="admin-video-details">
                <div class="admin-video-detail">
                    <strong>ID:</strong> ${video.id}
                </div>
                <div class="admin-video-detail">
                    <strong>Duration:</strong> ${video.durasi}
                </div>
                <div class="admin-video-detail">
                    <strong>Uploaded:</strong> ${video.uploadDate ? new Date(video.uploadDate).toLocaleDateString() : 'N/A'}
                </div>
            </div>
            <div class="admin-video-stats">
                <span><i class="fas fa-eye"></i> ${video.countClick || 0} views</span>
                <span><i class="fas fa-thumbs-up"></i> ${video.like || 0} likes</span>
                <span><i class="fas fa-link"></i> ${video.linkvideo ? 'Link OK' : 'No Link'}</span>
            </div>
        `;
        
        adminVideosList.appendChild(videoItem);
    });
}

// Initialize ad rotation
function initAdRotation() {
    const gifUrl = 'https://files.catbox.moe/gmd2fk.gif';
    const imageUrl = 'https://files.catbox.moe/op6wtn.jpg';
    
    let isGif = true;
    
    // Start with GIF
    adImage.src = gifUrl;
    
    // Switch between GIF and image
    setInterval(() => {
        if (isGif) {
            // Show GIF for 15 seconds
            adImage.src = gifUrl;
            setTimeout(() => {
                isGif = false;
                adImage.src = imageUrl;
            }, 15000);
        } else {
            // Show image for 5 seconds
            adImage.src = imageUrl;
            setTimeout(() => {
                isGif = true;
                adImage.src = gifUrl;
            }, 5000);
        }
    }, isGif ? 15000 : 5000);
}

// Show VIP popup
function showVipPopup(video) {
    currentVipVideo = video;
    
    // Update popup content
    document.getElementById('vipVideoTitle').textContent = video.nama;
    document.getElementById('vipVideoDuration').textContent = video.durasi;
    
    // Update remaining uses
    updateRemainingUses();
    
    // Clear previous result
    keyResult.textContent = '';
    keyResult.className = 'key-result';
    keyResult.style.display = 'none';
    
    // Clear input
    vipKeyInput.value = '';
    
    // Show popup
    vipPopup.classList.add('active');
}

// Update remaining uses display
function updateRemainingUses() {
    if (appState.currentUserKey) {
        remainingUses.textContent = `Sisa penggunaan: ${appState.currentUserKey.uses}/30`;
        vipKeyInput.placeholder = 'Key sudah tersimpan, klik Confirm';
    } else {
        remainingUses.textContent = 'Sisa penggunaan: 0/30';
        vipKeyInput.placeholder = 'Masukkan key VIP Anda...';
    }
}

// Confirm VIP key
async function confirmVipKey() {
    let key = vipKeyInput.value.trim();
    
    // If user has saved key, use it
    if (!key && appState.currentUserKey) {
        key = appState.currentUserKey.key;
    }
    
    if (!key) {
        showKeyResult('Silakan masukkan key VIP', 'error');
        return;
    }
    
    // Find key in database
    const keyData = appState.keys.find(k => k.key === key);
    
    if (!keyData) {
        showKeyResult('Key tidak valid', 'error');
        return;
    }
    
    if (keyData.uses <= 0) {
        showKeyResult('Key sudah habis digunakan', 'error');
        return;
    }
    
    // Key is valid - decrement uses
    keyData.uses--;
    keyData.lastUsed = new Date().toISOString();
    
    // Save to JSONBin
    const success = await saveDataToJSONBin();
    
    if (!success) {
        showKeyResult('Gagal menyimpan perubahan key', 'error');
        keyData.uses++; // Revert changes
        return;
    }
    
    // Set as current user key
    appState.currentUserKey = keyData;
    localStorage.setItem('skandalhub_user_key', key);
    
    // Update display
    updateRemainingUses();
    
    // Show success
    showKeyResult('Key berhasil! Mengalihkan ke video...', 'success');
    
    // Close popup and play video after delay
    setTimeout(() => {
        vipPopup.classList.remove('active');
        playVideo(currentVipVideo);
    }, 1500);
}

// Show key result in popup
function showKeyResult(message, type) {
    keyResult.textContent = message;
    keyResult.className = 'key-result ' + type;
    keyResult.style.display = 'block';
}

// Play video
function playVideo(video) {
    // Increment view count
    const videoIndex = appState.videos.findIndex(v => v.id === video.id);
    if (videoIndex !== -1) {
        appState.videos[videoIndex].countClick = (appState.videos[videoIndex].countClick || 0) + 1;
        
        // Save to JSONBin in background
        saveDataToJSONBin().then(success => {
            if (success) {
                // Update trending videos
                processVideos();
                displayTrendingVideos();
            }
        });
    }
    
    // Set video player source
    mainVideoPlayer.src = video.linkvideo;
    
    // Update modal info
    modalVideoTitle.textContent = video.nama;
    modalVideoViews.textContent = video.countClick || 0;
    modalVideoLikes.textContent = video.like || 0;
    modalVideoDuration.textContent = video.durasi;
    
    // Set download link
    downloadVideoBtn.href = video.linkvideo;
    downloadVideoBtn.download = video.nama.replace(/\s+/g, '_') + '.mp4';
    
    // Set like button data
    likeVideoBtn.dataset.videoId = video.id;
    
    // Show modal
    videoModal.classList.add('active');
    
    // Play video
    setTimeout(() => {
        mainVideoPlayer.play().catch(e => {
            console.error('Error playing video:', e);
        });
    }, 300);
}

// Like current video
async function likeCurrentVideo() {
    const videoId = parseInt(likeVideoBtn.dataset.videoId);
    const videoIndex = appState.videos.findIndex(v => v.id === videoId);
    
    if (videoIndex === -1) return;
    
    // Increment like count
    appState.videos[videoIndex].like = (appState.videos[videoIndex].like || 0) + 1;
    
    // Update display
    modalVideoLikes.textContent = appState.videos[videoIndex].like;
    
    // Save to JSONBin
    const success = await saveDataToJSONBin();
    
    if (success) {
        // Update trending videos
        processVideos();
        displayTrendingVideos();
        
        // Disable like button temporarily
        likeVideoBtn.disabled = true;
        likeVideoBtn.innerHTML = '<i class="fas fa-heart"></i> Liked!';
        
        setTimeout(() => {
            likeVideoBtn.disabled = false;
            likeVideoBtn.innerHTML = '<i class="fas fa-thumbs-up"></i> Like';
        }, 2000);
    }
}

// Perform search
function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        // Reset to normal view
        appState.currentPage = 1;
        displayNewVideos();
        updatePagination();
        return;
    }
    
    // Filter videos
    const searchResults = appState.videos.filter(video => 
        video.nama.toLowerCase().includes(searchTerm)
    );
    
    // Display results
    if (searchResults.length === 0) {
        noNewVideos.style.display = 'block';
        newVideosContainer.innerHTML = '';
        pageNumbers.innerHTML = '';
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
    } else {
        noNewVideos.style.display = 'none';
        newVideosContainer.innerHTML = '';
        
        searchResults.forEach((video, index) => {
            const videoCard = createVideoCard(video, index);
            newVideosContainer.appendChild(videoCard);
        });
        
        // Update pagination for search results
        updatePaginationForSearch(searchResults.length);
    }
}

// Update pagination
function updatePagination() {
    // Update page indicator
    document.getElementById('pageNumbers').innerHTML = '';
    
    // Create page numbers
    for (let i = 1; i <= appState.totalPages; i++) {
        const pageNumber = document.createElement('div');
        pageNumber.className = `page-number ${i === appState.currentPage ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => {
            appState.currentPage = i;
            displayNewVideos();
            updatePagination();
        });
        pageNumbers.appendChild(pageNumber);
    }
    
    // Update button states
    prevPageBtn.disabled = appState.currentPage === 1;
    nextPageBtn.disabled = appState.currentPage === appState.totalPages;
}

// Update pagination for search results
function updatePaginationForSearch(resultCount) {
    const totalPages = Math.ceil(resultCount / appState.videosPerPage);
    
    // Reset to page 1 for search results
    appState.currentPage = 1;
    
    // Update page numbers
    pageNumbers.innerHTML = '';
    
    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('div');
        pageNumber.className = `page-number ${i === 1 ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.addEventListener('click', () => {
            appState.currentPage = i;
            // In a full implementation, this would load the specific page of search results
            alert('In a full implementation, this would load page ' + i + ' of search results');
        });
        pageNumbers.appendChild(pageNumber);
    }
    
    // Update button states
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = totalPages <= 1;
}

// Format duration
function formatDuration(duration) {
    if (duration.includes(':')) {
        return duration;
    }
    
    // Assume it's seconds
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}