const yts = require('yt-search');

const moodSearchTerms = {
    happy: [
        'latest bollywood party song official video t-series',
        'bollywood upbeat dance hits 2026 official',
        'hindi trending party songs official music video'
    ],
    sad: [
        'latest bollywood sad song arijit singh official video',
        'hindi emotional heartbreak songs official music video',
        'trending sad songs 2026 bollywood official'
    ],
    angry: [
        'bollywood rock song official video',
        'intense rap hindi official video',
        'hindi rock anthem official music video'
    ],
    neutral: [
        'bollywood lofi chill track official video',
        'hindi indie pop official music video',
        'relaxing hindi acoustic songs official'
    ],
    surprised: [
        'latest hindi pop song official video',
        'bollywood trending hit official music video',
        'viral hindi song 2026 official video'
    ]
};

const homeChartQueries = [
    'latest hindi song official video t-series zee music',
    'new bollywood hit songs 2026 official video',
    'trending indian pop songs 2026 official',
    'global top 50 official music video'
];

exports.searchMusic = async (req, res) => {
    try {
        const { q, mood, type } = req.query;

        let queriesToRun = [];
        if (type === 'chart') {
            queriesToRun = homeChartQueries;
        } else if (mood && moodSearchTerms[mood.toLowerCase()]) {
            queriesToRun = moodSearchTerms[mood.toLowerCase()];
        } else if (q) {
            queriesToRun = [q];
        } else {
            queriesToRun = ['trending music official'];
        }


        
        const results = await Promise.all(queriesToRun.map(query => yts(query)));
        
        let allVideos = [];
        results.forEach(r => allVideos.push(...r.videos));
        
        const uniqueMap = new Map();
        allVideos.forEach(v => {
            if (!uniqueMap.has(v.videoId)) {
                uniqueMap.set(v.videoId, v);
            }
        });
        
        let items = Array.from(uniqueMap.values())
            .filter(v => v.seconds >= 70 && v.seconds <= 600)
            .map(v => ({
                id: { videoId: v.videoId },
                snippet: {
                    title: v.title,
                    channelTitle: v.author.name,
                    thumbnails: { medium: { url: v.thumbnail } }
                }
            }))
            .slice(0, 50);


        
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

        const axios = require('axios');
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

        const axios = require('axios');
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

exports.getMoodPlaylist = async (req, res) => {
    try {
        req.query.mood = req.params.mood;
        return exports.searchMusic(req, res);
    } catch (error) {
        res.status(500).json({ error: "Failed to get mood playlist" });
    }
};