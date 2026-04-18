let player;
let isMoodSync = false;

// 1. YouTube Player Setup
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '0', width: '0',
        events: { 'onStateChange': onPlayerStateChange }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        // Autoplay logic: Pick a random item from results or related
        console.log("Song ended, playing next...");
    }
}

// 2. Search Handling
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch(e.target.value);
});

async function performSearch(query) {
    const res = await fetch(`/api/music/search?q=${query}`);
    const data = await res.json();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = data.map(song => `
        <div class="song-card" onclick="playTrack('${song.id.videoId}', '${song.snippet.title.replace(/'/g, "")}', '${song.snippet.thumbnails.default.url}')">
            <img src="${song.snippet.thumbnails.high.url}">
            <p>${song.snippet.title.substring(0, 40)}...</p>
        </div>
    `).join('');
}

function playTrack(id, title, thumb) {
    player.loadVideoById(id);
    document.getElementById('trackTitle').innerText = title;
    document.getElementById('trackThumb').src = thumb;
}

// 3. Mood Detection
async function toggleMood() {
    const video = document.getElementById('video');
    const btn = document.getElementById('moodBtn');
    
    if (!isMoodSync) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        isMoodSync = true;
        btn.innerText = "Stop Mood Sync";
        setInterval(detectMood, 5000);
    } else {
        location.reload();
    }
}

async function detectMood() {
    const video = document.getElementById('video');
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
    if (detections.length > 0) {
        const expressions = detections[0].expressions;
        const mood = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
        document.getElementById('moodDisplay').innerText = "Mood: " + mood.toUpperCase();
        
        const moodMap = { happy: 'upbeat pop', sad: 'lofi chill', angry: 'heavy rock', neutral: 'indie' };
        performSearch(moodMap[mood] || 'trending');
    }
}

// 4. Geolocation
fetch('https://ipapi.co/json/').then(res => res.json()).then(data => {
    document.getElementById('city').innerText = `${data.city}, ${data.country_name}`;
});