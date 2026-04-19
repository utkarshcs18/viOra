let player;
let currentSong = null;
let queue = [];
let isPlaying = false;
let moodDetectionActive = false;
let currentMood = null;
let playbackHistory = [];

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '0',
        width: '0',
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('YouTube player ready');
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNextSong();
    } else if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updatePlayButton();
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
        updatePlayButton();
    }
}

async function detectLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        document.getElementById('location').textContent = `${data.city}, ${data.country_name}`;
    } catch (error) {
        console.error('Location detection failed:', error);
        document.getElementById('location').textContent = 'Location unavailable';
    }
}

async function searchMusic(query) {
    try {
        const response = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
        const songs = await response.json();
        displaySearchResults(songs);
    } catch (error) {
        console.error('Search failed:', error);
        showError('Failed to search for music');
    }
}

function displaySearchResults(songs) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = `
        <h3 class="section-title">?? Search Results</h3>
        <div class="music-grid">
            ${songs.map(song => createMusicCard(song)).join('')}
        </div>
    `;
}

function createMusicCard(song) {
    return `
        <div class="music-card" onclick="playSong('${song.id.videoId}', '${song.snippet.title}', '${song.snippet.channelTitle}', '${song.snippet.thumbnails.medium.url}')">
            <img class="music-thumbnail" src="${song.snippet.thumbnails.medium.url}" alt="${song.snippet.title}">
            <div class="music-info">
                <div class="music-title">${song.snippet.title}</div>
                <div class="music-artist">${song.snippet.channelTitle}</div>
            </div>
        </div>
    `;
}

function playSong(videoId, title, artist, thumbnail) {
    currentSong = { videoId, title, artist, thumbnail };
    
    document.getElementById('playerTitle').textContent = title;
    document.getElementById('playerArtist').textContent = artist;
    document.getElementById('playerThumbnail').src = thumbnail || getDefaultThumbnail();
    
    player.loadVideoById(videoId);
    player.playVideo();
    
    addToHistory(currentSong);
    
    loadRelatedSongs(videoId);
}

async function loadRelatedSongs(videoId) {
    try {
        const response = await fetch(`/api/music/related/${videoId}`);
        const relatedSongs = await response.json();
        
        relatedSongs.forEach(song => {
            if (!queue.find(q => q.videoId === song.id.videoId)) {
                queue.push({
                    videoId: song.id.videoId,
                    title: song.snippet.title,
                    artist: song.snippet.channelTitle,
                    thumbnail: song.snippet.thumbnails.medium.url
                });
            }
        });
        
        updateQueueDisplay();
    } catch (error) {
        console.error('Failed to load related songs:', error);
    }
}

function playNextSong() {
    if (queue.length > 0) {
        const nextSong = queue.shift();
        playSong(nextSong.videoId, nextSong.title, nextSong.artist, nextSong.thumbnail);
        updateQueueDisplay();
    } else {
        isPlaying = false;
        updatePlayButton();
    }
}

function updateQueueDisplay() {
    const queueSection = document.getElementById('queueSection');
    const queueList = document.getElementById('queueList');
    
    if (queue.length > 0) {
        queueSection.style.display = 'block';
        queueList.innerHTML = queue.slice(0, 5).map((song, index) => `
            <div class="queue-item">
                <img class="queue-thumbnail" src="${song.thumbnail}" alt="${song.title}">
                <div class="queue-info">
                    <div class="queue-title">${song.title}</div>
                    <div class="queue-artist">${song.artist}</div>
                </div>
                <div style="color: #666; font-size: 12px;">${index + 1}</div>
            </div>
        `).join('');
    } else {
        queueSection.style.display = 'none';
    }
}

async function startMoodDetection() {
    try {
        const video = document.getElementById('video');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = 'block';
        
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
            faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
        ]);
        
        moodDetectionActive = true;
        document.getElementById('moodBtn').textContent = 'Stop Mood Sync';
        document.getElementById('moodDisplay').textContent = 'Mood: Detecting...';
        
        detectMood();
        moodInterval = setInterval(detectMood, 5000);
        
    } catch (error) {
        console.error('Mood detection failed:', error);
        showError('Failed to start mood detection. Camera access may be denied.');
    }
}

async function detectMood() {
    try {
        const video = document.getElementById('video');
        const result = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        
        if (result.length > 0) {
            const expressions = result[0].expressions;
            const mood = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
            
            currentMood = mood;
            document.getElementById('moodDisplay').textContent = `Mood: ${mood.toUpperCase()}`;
            
            loadMoodPlaylist(mood);
        }
    } catch (error) {
        console.error('Mood detection error:', error);
    }
}

async function loadMoodPlaylist(mood) {
    try {
        const response = await fetch(`/api/music/mood/${mood.toLowerCase()}`);
        const songs = await response.json();
        
        displayMoodResults(songs);
        
        if (!isPlaying && songs.length > 0) {
            const firstSong = songs[0];
            playSong(firstSong.id.videoId, firstSong.snippet.title, firstSong.snippet.channelTitle, firstSong.snippet.thumbnails.medium.url);
        }
    } catch (error) {
        console.error('Failed to load mood playlist:', error);
    }
}

function displayMoodResults(songs) {
    const moodResults = document.getElementById('moodResults');
    const moodGrid = document.getElementById('moodGrid');
    
    moodResults.style.display = 'block';
    moodGrid.innerHTML = songs.map(song => createMusicCard(song)).join('');
}

function getDefaultThumbnail() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial' font-size='16'%3EMusic Thumbnail%3C/text%3E%3C/svg%3E";
}

function addToHistory(song) {
    playbackHistory.unshift({
        ...song,
        playedAt: new Date()
    });
    
    if (playbackHistory.length > 50) {
        playbackHistory = playbackHistory.slice(0, 50);
    }
}

function updatePlayButton() {
    const playBtn = document.getElementById('playBtn');
    playBtn.innerHTML = isPlaying ? '??' : '?';
}

function showError(message) {
    console.error(message);
    alert(message);
}

document.addEventListener('DOMContentLoaded', () => {
    detectLocation();
    
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        
        if (query.length > 2) {
            searchTimeout = setTimeout(() => searchMusic(query), 500);
        } else if (query.length === 0) {
            document.getElementById('searchResults').innerHTML = `
                <h3 class="section-title">?? Discover Music</h3>
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Start searching for music or enable mood detection...</p>
                </div>
            `;
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) searchMusic(query);
        }
    });
    
    document.getElementById('moodBtn').addEventListener('click', () => {
        if (moodDetectionActive) {
            stopMoodDetection();
        } else {
            startMoodDetection();
        }
    });
    
    document.getElementById('playBtn').addEventListener('click', () => {
        if (currentSong) {
            if (isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
    });
    
    document.getElementById('nextBtn').addEventListener('click', playNextSong);
    
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentSong) {
            player.seekTo(0);
            player.playVideo();
        }
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            e.target.classList.add('active');
            
            const page = e.target.dataset.page;
            handleNavigation(page);
        });
    });
});

function stopMoodDetection() {
    moodDetectionActive = false;
    clearInterval(moodInterval);
    
    const video = document.getElementById('video');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
    video.style.display = 'none';
    
    document.getElementById('moodBtn').textContent = 'Start Mood Sync';
    document.getElementById('moodDisplay').textContent = 'Mood: OFF';
}

function handleNavigation(page) {
    console.log('Navigating to:', page);
    
    switch(page) {
        case 'home':
            break;
        case 'search':
            document.getElementById('searchInput').focus();
            break;
        case 'library':
            break;
        case 'playlists':
            break;
    }
}

const hiddenPlayer = document.createElement('div');
hiddenPlayer.id = 'yt-player';
hiddenPlayer.style.display = 'none';
document.body.appendChild(hiddenPlayer);