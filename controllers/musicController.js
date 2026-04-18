const axios = require('axios');

exports.searchMusic = async (req, res) => {
    try {
        const { q } = req.query;
        const key = process.env.YOUTUBE_API_KEY;

        console.log(`🔎 Searching for: ${q}`); // Log the search query

        if (!key || key === "YOUR_YOUTUBE_API_KEY_HERE") {
            console.error("❌ Error: YouTube API Key is missing in .env file!");
            return res.status(500).json({ error: "API Key not configured" });
        }

        const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: {
                part: 'snippet',
                maxResults: 12,
                q: q,
                type: 'video',
                key: key
            }
        });

        console.log(`✅ Found ${response.data.items.length} songs`);
        res.json(response.data.items);
    } catch (err) {
        // This will print the EXACT reason Google rejected your request
        console.error("❌ YouTube API Error:", err.response ? err.response.data : err.message);
        res.status(500).json({ error: "YouTube Search Failed" });
    }
};