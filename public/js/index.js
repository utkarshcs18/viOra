// Use a string comparison to prevent IDE syntax errors when parsing EJS tags inside JS
        let player;
        let isPlaying = false;
        let currentSong = null;
        let queue = [];
        let userQueue = [];
        let userLikedSongs = [];

        // Fetch liked songs on load if authenticated
        if (isAuthenticated) {
            fetch('/api/user/liked')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) userLikedSongs = data;
                })
                .catch(e => console.error("Error fetching liked songs:", e));
        }

        // DOM Elements
        const trendingIcon = document.getElementById('trendingIcon');
        const dynamicContainer = document.getElementById('dynamicContainer');
        const nowPlayingView = document.getElementById('nowPlayingView');
        const cameraView = document.getElementById('cameraView');
        const grayBox = document.getElementById('grayBox');
        
        let progressInterval;

        function resetViews() {
            trendingIcon.style.display = 'none';
            dynamicContainer.style.display = 'none';
            nowPlayingView.style.display = 'none';
            cameraView.style.display = 'none';
            grayBox.style.alignItems = 'flex-start';
            
            const artistsSec = document.getElementById('artistsSection');
            if (artistsSec) artistsSec.style.display = 'none';
            
            // Remove active state from all sidebar items
            document.querySelectorAll('.sidebar-item, .sidebar-bottom-item').forEach(el => el.classList.remove('active'));
        }

        // Profile Dropdown Toggle Logic
        const profilePillBtn = document.getElementById('profilePillBtn');
        if (profilePillBtn) {
            profilePillBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('profileContainer').classList.toggle('active');
            });
            document.addEventListener('click', () => {
                document.getElementById('profileContainer').classList.remove('active');
            });
            document.getElementById('profileContainer').querySelector('.profile-dropdown').addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Feature 1: Trending
        document.getElementById('trendingIcon').addEventListener('click', async () => {
            resetViews();
            dynamicContainer.style.display = 'flex';
            document.getElementById('sectionTitle').textContent = 'Trending Ones';
            
            try {
                const res = await fetch(`/api/music/search?q=top+trending+music`);
                const songs = await res.json();
                renderGrid(songs);
            } catch (e) { console.error(e); }
        });

        // Feature 2: Search
        let searchTimeout;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchTimeout = setTimeout(async () => {
                    resetViews();
                    dynamicContainer.style.display = 'flex';
                    document.getElementById('sectionTitle').textContent = `Search: ${query}`;
                    try {
                        const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
                        const songs = await res.json();
                        renderGrid(songs);
                    } catch (err) {}
                }, 500);
            }
        });

        // Feature 3: Now Playing
        document.getElementById('nowPlayingPill').addEventListener('click', () => {
            resetViews();
            grayBox.style.alignItems = 'center';
            nowPlayingView.style.display = 'flex';
        });

        const topArtists = [
            { name: "The Weeknd", query: "The Weeknd", image: "https://ui-avatars.com/api/?name=The+Weeknd&background=random&color=fff&size=200" },
            { name: "Arijit Singh", query: "Arijit Singh", image: "https://ui-avatars.com/api/?name=Arijit+Singh&background=random&color=fff&size=200" },
            { name: "Taylor Swift", query: "Taylor Swift", image: "https://ui-avatars.com/api/?name=Taylor+Swift&background=random&color=fff&size=200" },
            { name: "Shreya Ghoshal", query: "Shreya Ghoshal", image: "https://ui-avatars.com/api/?name=Shreya+Ghoshal&background=random&color=fff&size=200" },
            { name: "Drake", query: "Drake", image: "https://ui-avatars.com/api/?name=Drake&background=random&color=fff&size=200" },
            { name: "Neha Kakkar", query: "Neha Kakkar", image: "https://ui-avatars.com/api/?name=Neha+Kakkar&background=random&color=fff&size=200" },
            { name: "Bad Bunny", query: "Bad Bunny", image: "https://ui-avatars.com/api/?name=Bad+Bunny&background=random&color=fff&size=200" },
            { name: "Diljit Dosanjh", query: "Diljit Dosanjh", image: "https://ui-avatars.com/api/?name=Diljit+Dosanjh&background=random&color=fff&size=200" },
            { name: "Ed Sheeran", query: "Ed Sheeran", image: "https://ui-avatars.com/api/?name=Ed+Sheeran&background=random&color=fff&size=200" },
            { name: "Karan Aujla", query: "Karan Aujla", image: "https://ui-avatars.com/api/?name=Karan+Aujla&background=random&color=fff&size=200" },
            { name: "Billie Eilish", query: "Billie Eilish", image: "https://ui-avatars.com/api/?name=Billie+Eilish&background=random&color=fff&size=200" },
            { name: "Post Malone", query: "Post Malone", image: "https://ui-avatars.com/api/?name=Post+Malone&background=random&color=fff&size=200" },
            { name: "Atif Aslam", query: "Atif Aslam", image: "https://ui-avatars.com/api/?name=Atif+Aslam&background=random&color=fff&size=200" },
            { name: "Bruno Mars", query: "Bruno Mars", image: "https://ui-avatars.com/api/?name=Bruno+Mars&background=random&color=fff&size=200" },
            { name: "Armaan Malik", query: "Armaan Malik", image: "https://ui-avatars.com/api/?name=Armaan+Malik&background=random&color=fff&size=200" },
            { name: "Justin Bieber", query: "Justin Bieber", image: "https://ui-avatars.com/api/?name=Justin+Bieber&background=random&color=fff&size=200" },
            { name: "Kishore Kumar", query: "Kishore Kumar", image: "https://ui-avatars.com/api/?name=Kishore+Kumar&background=random&color=fff&size=200" },
            { name: "Eminem", query: "Eminem", image: "https://ui-avatars.com/api/?name=Eminem&background=random&color=fff&size=200" },
            { name: "Lata Mangeshkar", query: "Lata Mangeshkar", image: "https://ui-avatars.com/api/?name=Lata+Mangeshkar&background=random&color=fff&size=200" },
            { name: "Rihanna", query: "Rihanna", image: "https://ui-avatars.com/api/?name=Rihanna&background=random&color=fff&size=200" },
            { name: "Udit Narayan", query: "Udit Narayan", image: "https://ui-avatars.com/api/?name=Udit+Narayan&background=random&color=fff&size=200" },
            { name: "Kendrick Lamar", query: "Kendrick Lamar", image: "https://ui-avatars.com/api/?name=Kendrick+Lamar&background=random&color=fff&size=200" },
            { name: "Sonu Nigam", query: "Sonu Nigam", image: "https://ui-avatars.com/api/?name=Sonu+Nigam&background=random&color=fff&size=200" },
            { name: "Charlie Puth", query: "Charlie Puth", image: "https://ui-avatars.com/api/?name=Charlie+Puth&background=random&color=fff&size=200" }
        ];

        function renderArtists() {
            const row = document.getElementById('artistsRow');
            // Shuffle the array to make the artists section dynamic and changing
            const shuffledArtists = [...topArtists].sort(() => 0.5 - Math.random()).slice(0, 10);
            
            row.innerHTML = shuffledArtists.map(artist => `
                <div class="artist-card" onclick="fetchArtistSongs('${artist.query}', '${artist.name}')">
                    <img class="artist-img" src="${artist.image}" alt="${artist.name}" onerror="this.src='https://via.placeholder.com/100'">
                    <div class="artist-name">${artist.name}</div>
                </div>
            `).join('');
            document.getElementById('artistsSection').style.display = 'block';
        }

        async function fetchArtistSongs(query, name) {
            document.getElementById('sectionTitle').textContent = `Top Songs by ${name}`;
            const grid = document.getElementById('musicGrid');
            grid.innerHTML = '<div style="padding:20px;">Loading...</div>';
            try {
                const res = await fetch(`/api/music/search?q=${encodeURIComponent(query + ' official music video')}`);
                const songs = await res.json();
                renderGrid(songs);
            } catch (e) {
                grid.innerHTML = '<div style="padding:20px;">Failed to load.</div>';
            }
        }

        // Feature 4: Top Music (Home Feed)
        document.getElementById('topMusicIcon').addEventListener('click', async () => {
            resetViews();
            document.getElementById('topMusicIcon').classList.add('active');
            dynamicContainer.style.display = 'flex';
            document.getElementById('sectionTitle').textContent = 'Trending Music Right Now';
            renderArtists(); // Show Top Artists Row
            try {
                const res = await fetch('/api/music/search?type=chart');
                const songs = await res.json();
                renderGrid(songs);
            } catch (e) {}
        });

        // Load Top Music by Default on App Open
        window.addEventListener('DOMContentLoaded', () => {
            document.getElementById('topMusicIcon').click();
        });

        // Feature 5: Liked Songs (Playlists)
        document.getElementById('playlistsIcon').addEventListener('click', async () => {
            if (!isAuthenticated) return alert('Please login to view Liked Songs.');
            resetViews();
            document.getElementById('playlistsIcon').classList.add('active');
            dynamicContainer.style.display = 'flex';
            document.getElementById('sectionTitle').textContent = 'Liked Songs';
            try {
                const res = await fetch('/api/user/liked');
                const songs = await res.json();
                renderGrid(songs);
            } catch (e) {}
        });

        // Feature 6: Camera / Mood Sync
        document.getElementById('cameraIcon').addEventListener('click', () => {
            resetViews();
            document.getElementById('cameraIcon').classList.add('active');
            cameraView.style.display = 'flex';
        });

        document.getElementById('creditIcon').addEventListener('click', () => {
            alert('Created by Utkarsh Kumar. Thank you for using viOra!');
        });

        // Feature 7: Mood Sync (Camera)
        let moodInterval;
        let isSyncing = false;
        document.getElementById('cameraIcon').addEventListener('click', () => {
            resetViews();
            grayBox.style.alignItems = 'center';
            cameraView.style.display = 'flex';
        });

        document.getElementById('startSyncBtn').addEventListener('click', async () => {
            const btn = document.getElementById('startSyncBtn');
            const video = document.getElementById('videoElement');
            if (isSyncing) {
                isSyncing = false;
                clearInterval(moodInterval);
                if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
                btn.textContent = 'Start Camera Sync';
                document.getElementById('moodOutput').textContent = '';
                return;
            }
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
                await faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
                
                isSyncing = true;
                btn.textContent = 'Stop Sync';
                
                moodInterval = setInterval(async () => {
                    if (!isSyncing) return;
                    
                    const result = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
                    
                    if (!isSyncing) return;
                    
                    if (result.length > 0) {
                        // IMMEDIATELY stop the camera and interval so it doesn't loop while fetching
                        clearInterval(moodInterval);
                        isSyncing = false;
                        if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
                        btn.textContent = 'Start Camera Sync';

                        const ex = result[0].expressions;
                        const mood = Object.keys(ex).reduce((a, b) => ex[a] > ex[b] ? a : b);
                        document.getElementById('moodOutput').textContent = 'Detected Mood: ' + mood.toUpperCase();
                        
                        // Auto fetch playlist based on mood
                        resetViews();
                        dynamicContainer.style.display = 'flex';
                        document.getElementById('sectionTitle').textContent = `Mood Mix: ${mood.toUpperCase()}`;
                        const res = await fetch(`/api/music/mood/${mood.toLowerCase()}`);
                        const songs = await res.json();
                        renderGrid(songs);
                        if (!isPlaying && songs.length > 0) {
                            triggerPlay(songs[0].id.videoId, songs[0].snippet.title, songs[0].snippet.channelTitle, songs[0].snippet.thumbnails.medium.url);
                        }
                    }
                }, 5000);
            } catch (e) {
                alert("Camera access denied.");
            }
        });

        function addToQueue(videoId, title, artist, thumbnail) {
            userQueue.push({ videoId, title, artist, thumbnail });
            renderQueue();
            
            // Visual feedback
            const btn = event.currentTarget;
            if (btn) {
                const oldHTML = btn.innerHTML;
                btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#1db954" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                setTimeout(() => btn.innerHTML = oldHTML, 1000);
            }
        }

        function toggleQueue() {
            const queuePanel = document.getElementById('queuePanel');
            if (!queuePanel) return;
            if (queuePanel.style.display === 'flex') {
                queuePanel.style.display = 'none';
            } else {
                queuePanel.style.display = 'flex';
                renderQueue();
            }
        }

        function renderQueue() {
            const container = document.getElementById('queueList');
            if (!container) return;
            
            let html = '';
            
            if (userQueue.length === 0 && queue.length === 0) {
                container.innerHTML = '<div style="color: #888; text-align: center; padding: 20px;">Queue is empty</div>';
                return;
            }
            
            // Render user explicitly queued songs
            userQueue.forEach((song, i) => {
                const escapedTitle = song.title.replace(/'/g, "\\'");
                const escapedArtist = song.artist.replace(/'/g, "\\'");
                html += `
                    <div class="queue-item" style="cursor: pointer;" onclick="playFromQueue('user', ${i}, '${song.videoId}', '${escapedTitle}', '${escapedArtist}', '${song.thumbnail}')">
                        <img src="${song.thumbnail}" class="queue-item-img">
                        <div class="queue-item-info">
                            <div class="queue-item-title" style="color: #1db954;">${song.title}</div>
                            <div class="queue-item-artist">${song.artist}</div>
                        </div>
                        <button class="queue-remove-btn" onclick="event.stopPropagation(); removeUserQueue(${i})">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                `;
            });

            // Render auto-radio queue songs
            queue.forEach((song, i) => {
                const escapedTitle = song.title.replace(/'/g, "\\'");
                const escapedArtist = song.artist.replace(/'/g, "\\'");
                html += `
                    <div class="queue-item" style="cursor: pointer; opacity: 0.8;" onclick="playFromQueue('auto', ${i}, '${song.videoId}', '${escapedTitle}', '${escapedArtist}', '${song.thumbnail}')">
                        <img src="${song.thumbnail}" class="queue-item-img">
                        <div class="queue-item-info">
                            <div class="queue-item-title">${song.title}</div>
                            <div class="queue-item-artist">${song.artist}</div>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }

        function removeUserQueue(index) {
            userQueue.splice(index, 1);
            renderQueue();
        }

        function playFromQueue(type, index, videoId, title, artist, thumbnail) {
            if (type === 'user') {
                userQueue.splice(0, index + 1); // remove all up to the played one
            } else if (type === 'auto') {
                queue.splice(0, index + 1); // remove all up to the played one
            }
            renderQueue();
            triggerPlay(videoId, title, artist, thumbnail, true);
        }

        let currentGridSongs = [];
        let currentSongIndex = -1;
        
        // Rendering Grid
        function renderGrid(songs) {
            currentGridSongs = songs;
            const grid = document.getElementById('musicGrid');
            grid.innerHTML = songs.map(song => {
                const videoId = typeof song.id === 'string' ? song.id : (song.id?.videoId || song.videoId);
                const title = (song.snippet?.title || song.title).replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/[\r\n]+/g, ' ');
                const artist = (song.snippet?.channelTitle || song.artist || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/[\r\n]+/g, ' ');
                const thumbnail = song.snippet?.thumbnails?.medium?.url || song.thumbnail;
                return `
                <div class="music-card">
                    <div style="position: relative; overflow: hidden; border-radius: 12px 12px 0 0;" onclick="triggerPlay('${videoId}', '${title}', '${artist}', '${thumbnail}')">
                        <img class="music-thumbnail" src="${thumbnail}" alt="${title}" onerror="this.src='https://via.placeholder.com/300'">
                    </div>
                    <div class="music-info" style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1; overflow: hidden; cursor: pointer;" onclick="triggerPlay('${videoId}', '${title}', '${artist}', '${thumbnail}')">
                            <div class="music-title">${title}</div>
                            <div class="music-artist">${artist}</div>
                        </div>
                        <button class="add-queue-btn" title="Add to Queue" onclick="event.stopPropagation(); addToQueue('${videoId}', '${title}', '${artist}', '${thumbnail}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    </div>
                </div>`;
            }).join('');
        }

        // Playback Logic
        function onYouTubeIframeAPIReady() {
            player = new YT.Player('yt-player', {
                height: '0', width: '0',
                events: { onStateChange: onPlayerStateChange }
            });
        }

        // Progress Bar Formatting
        function formatTime(seconds) {
            if (isNaN(seconds)) return "0:00";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        }

        function onPlayerStateChange(event) {
            const btn = document.getElementById('playPauseBtn');
            const nowPlayingPill = document.getElementById('nowPlayingPill');
            clearInterval(progressInterval);
            
            if (event.data === YT.PlayerState.ENDED) {
                // 1. If the user explicitly queued songs, play them first!
                if (userQueue.length > 0) {
                    const n = userQueue.shift();
                    renderQueue(); // Update UI
                    triggerPlay(n.videoId, n.title, n.artist, n.thumbnail, true);
                } 
                // 2. Otherwise, if there is an auto artist radio queue, play from there
                else if (queue.length > 0) {
                    const n = queue.shift();
                    triggerPlay(n.videoId, n.title, n.artist, n.thumbnail, true);
                } 
                // 3. Finally, play next from the current visual grid
                else {
                    playNextSong();
                }
            } else if (event.data === YT.PlayerState.PLAYING) {
                isPlaying = true;
                btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
                if (nowPlayingPill) nowPlayingPill.classList.add('playing-active');
                
                progressInterval = setInterval(() => {
                    const currentTime = player.getCurrentTime();
                    const duration = player.getDuration();
                    document.getElementById('currentTimeLabel').textContent = formatTime(currentTime);
                    document.getElementById('totalTimeLabel').textContent = formatTime(duration);
                    if (duration > 0) {
                        document.getElementById('progressBar').value = (currentTime / duration) * 100;
                    }
                }, 500);
            } else if (event.data === YT.PlayerState.PAUSED) {
                isPlaying = false;
                btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
                if (nowPlayingPill) nowPlayingPill.classList.remove('playing-active');
            }
        }

        document.getElementById('progressBar').addEventListener('input', (e) => {
            if (player && player.getDuration) {
                const duration = player.getDuration();
                const seekTime = (e.target.value / 100) * duration;
                player.seekTo(seekTime, true);
                document.getElementById('currentTimeLabel').textContent = formatTime(seekTime);
            }
        });

        async function generateArtistRadio(artist) {
            if (!artist || artist === '-') return;
            const section = document.getElementById('sectionTitle').textContent;
            // Don't generate radio if we are ALREADY viewing a dedicated artist page
            if (section.includes('Top Songs by')) return;
            
            try {
                const res = await fetch(`/api/music/search?q=${encodeURIComponent(artist + ' hit songs')}`);
                const songs = await res.json();
                
                // Keep only top 3 unique songs that aren't the current song
                queue = songs
                    .filter(s => s.id.videoId !== currentSong.videoId)
                    .slice(0, 3)
                    .map(s => ({
                        videoId: s.id.videoId,
                        title: s.snippet.title,
                        artist: s.snippet.channelTitle,
                        thumbnail: s.snippet.thumbnails.medium.url
                    }));
            } catch (e) { console.log('Failed to generate radio'); }
        }

        function triggerPlay(videoId, title, artist, thumbnail, isFromQueue = false) {
            if (!isAuthenticated) {
                alert("Please login to play music.");
                window.location.href = '/login';
                return;
            }
            
            // If this is a manual click from the user (not from the queue), clear the old queue and start a new radio!
            if (!isFromQueue) {
                queue = [];
                generateArtistRadio(artist);
            }
            
            currentSong = { videoId, title, artist, thumbnail };
            
            document.getElementById('npTitle').textContent = title;
            document.getElementById('npArtist').textContent = artist;
            document.getElementById('npThumbnail').src = thumbnail;
            
            const isLiked = userLikedSongs.some(song => song.videoId === videoId);
            const likeBtn = document.getElementById('likeBtn');
            if (isLiked) {
                likeBtn.style.fill = '#1db954';
                likeBtn.style.color = '#1db954';
            } else {
                likeBtn.style.fill = 'none';
                likeBtn.style.color = 'currentColor';
            }

            player.loadVideoById(videoId);
            
            fetch('/api/user/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSong)
            }).catch(e => console.error(e));

            // Only track grid index if it wasn't an invisible queue item
            if (!isFromQueue) {
                currentSongIndex = currentGridSongs.findIndex(s => {
                    const id = typeof s.id === 'string' ? s.id : (s.id?.videoId || s.videoId);
                    return id === videoId;
                });
            }
                
            document.getElementById('nowPlayingPill').click();
        }

        function playNextSong() {
            if (userQueue.length > 0) {
                const n = userQueue.shift();
                renderQueue();
                triggerPlay(n.videoId, n.title, n.artist, n.thumbnail, true);
            } else if (queue.length > 0) {
                const n = queue.shift();
                triggerPlay(n.videoId, n.title, n.artist, n.thumbnail, true);
            } else if (currentSongIndex !== -1 && currentSongIndex < currentGridSongs.length - 1) {
                const n = currentGridSongs[currentSongIndex + 1];
                const vId = typeof n.id === 'string' ? n.id : (n.id?.videoId || n.videoId);
                const t = (n.snippet?.title || n.title).replace(/'/g, "\\'");
                const a = (n.snippet?.channelTitle || n.artist || '').replace(/'/g, "\\'");
                const thumb = n.snippet?.thumbnails?.medium?.url || n.thumbnail;
                triggerPlay(vId, t, a, thumb, false);
            }
        }

        function playPreviousSong() {
            if (currentSongIndex > 0) {
                const p = currentGridSongs[currentSongIndex - 1];
                const vId = typeof p.id === 'string' ? p.id : (p.id?.videoId || p.videoId);
                const t = (p.snippet?.title || p.title).replace(/'/g, "\\'");
                const a = (p.snippet?.channelTitle || p.artist || '').replace(/'/g, "\\'");
                const thumb = p.snippet?.thumbnails?.medium?.url || p.thumbnail;
                triggerPlay(vId, t, a, thumb);
            }
        }

        document.getElementById('playPauseBtn').addEventListener('click', () => {
            if (isPlaying) player.pauseVideo();
            else player.playVideo();
        });

        // Spacebar Play/Pause Toggle
        document.addEventListener('keydown', (e) => {
            // Prevent triggering if user is typing in the search input
            if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
                e.preventDefault(); // Prevent page scroll
                if (currentSong && player) {
                    if (isPlaying) player.pauseVideo();
                    else player.playVideo();
                }
            }
        });

        document.getElementById('likeBtn').addEventListener('click', async () => {
            if (!currentSong || !isAuthenticated) return;
            try {
                const res = await fetch('/api/user/liked', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(currentSong)
                });
                if (res.ok) {
                    const data = await res.json();
                    userLikedSongs = data.likedSongs;
                    
                    const likeBtn = document.getElementById('likeBtn');
                    if (data.isLiked) {
                        likeBtn.style.fill = '#1db954';
                        likeBtn.style.color = '#1db954';
                    } else {
                        likeBtn.style.fill = 'none';
                        likeBtn.style.color = 'currentColor';
                    }
                    
                    // If we are currently viewing the "Liked Songs" section, refresh the grid so the removed song disappears
                    if (document.getElementById('playlistsIcon').classList.contains('active')) {
                        renderGrid(userLikedSongs);
                    }
                }
            } catch (e) { console.error(e); }
        });