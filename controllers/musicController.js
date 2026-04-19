const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

const moodSearchTerms = {
    happy: 'bollywood upbeat happy party songs hindi',
    sad: 'bollywood sad emotional songs hindi',
    angry: 'bollywood intense rock rap hindi',
    neutral: 'bollywood chill lofi indie hindi',
    surprised: 'bollywood trending pop hindi'
};

const CACHE_FILE = path.join(__dirname, '../data/apiCache.json');
const CACHE_DURATION = 60 * 60 * 1000 * 24; // 24 hours in ms

// Load cache from file if it exists
let cache = {};
try {
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } else {
        // Create data directory if not exists
        const dataDir = path.join(__dirname, '../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
    }
} catch (e) {
    console.error("Cache load error:", e);
}

function saveCache() {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
    } catch (e) {
        console.error("Cache save error:", e);
    }
}

exports.searchMusic = async (req, res) => {
    try {
        const { q, mood, type } = req.query;

        const cacheKey = type === 'chart' ? 'chart' : (q || mood || 'default');
        if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_DURATION)) {
            console.log(`? Serving from PERSISTENT cache: ${cacheKey}`);
            return res.json(cache[cacheKey].data);
        }

        let searchQuery = q;
        if (type === 'chart') {
            console.log(`? Fetching Top Charts via Scraper...`);
            searchQuery = 'top hit bollywood songs india official music video';
        } else if (mood && moodSearchTerms[mood.toLowerCase()]) {
            searchQuery = moodSearchTerms[mood.toLowerCase()];
        } else if (!searchQuery) {
            searchQuery = 'trending music official';
        }

        console.log(`? Scraping YouTube for: ${searchQuery}`);
        
        // Use yt-search to bypass Google API Quotas completely!
        const r = await yts(searchQuery);
        
        // Filter out Shorts (< 70s) and format to match exactly what the frontend expects
        let items = r.videos
            .filter(v => v.seconds >= 70) 
            .map(v => ({
                id: { videoId: v.videoId },
                snippet: {
                    title: v.title,
                    channelTitle: v.author.name,
                    thumbnails: { medium: { url: v.thumbnail } }
                }
            }))
            .slice(0, 50);

        console.log(`? Found ${items.length} valid songs`);
        
        cache[cacheKey] = {
            data: items,
            timestamp: Date.now()
        };
        saveCache(); // Persist to disk
        
        res.json(items);
    } catch (err) {
        console.error("yt-search Error:", err.message);
        res.status(500).json({ error: "Search Failed" });
    }
};

exports.getRelatedVideos = async (req, res) => {
    try {
        const { videoId } = req.params;
        const key = process.env.YOUTUBE_API_KEY;

        if (!key || key === "YOUR_YOUTUBE_API_KEY_HERE") {
            return res.status(500).json({ error: "API Key not configured" });
        }

        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                relatedToVideoId: videoId,
                type: 'video',
                maxResults: 10,
                key: key
            }
        });

        res.json(response.data.items);
    } catch (err) {
        console.error("Related Videos Error:", err.response ? err.response.data : err.message);
        res.status(500).json({ error: "Failed to get related videos" });
    }
};

exports.getVideoDetails = async (req, res) => {
    try {
        const { videoId } = req.params;
        const key = process.env.YOUTUBE_API_KEY;

        if (!key || key === "YOUR_YOUTUBE_API_KEY_HERE") {
            return res.status(500).json({ error: "API Key not configured" });
        }

        const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: videoId,
                key: key
            }
        });

        res.json(response.data.items[0]);
    } catch (err) {
        console.error("Video Details Error:", err.response ? err.response.data : err.message);
        res.status(500).json({ error: "Failed to get video details" });
    }
};