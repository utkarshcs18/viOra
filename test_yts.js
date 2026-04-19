const yts = require('yt-search');

const homeQueries = [
    'latest hindi song official video t-series zee music',
    'new bollywood hit songs 2026 official video',
    'trending indian pop songs 2026 official'
];

async function run() {
    console.log("Fetching multiple queries for home...");
    const results = await Promise.all(homeQueries.map(q => yts(q)));
    
    let allVideos = [];
    results.forEach(r => allVideos.push(...r.videos));
    
    const uniqueMap = new Map();
    allVideos.forEach(v => {
        if (!uniqueMap.has(v.videoId)) {
            uniqueMap.set(v.videoId, v);
        }
    });
    
    const uniqueVideos = Array.from(uniqueMap.values());
    console.log(`Total unique videos before filter: ${uniqueVideos.length}`);
    
    const filtered = uniqueVideos.filter(v => v.seconds >= 70 && v.seconds <= 600);
    console.log(`Valid single songs (70s - 600s): ${filtered.length}`);
    
    console.log(`First 5 songs:`);
    filtered.slice(0, 5).forEach(v => console.log(`- ${v.title} (${v.seconds}s)`));
}
run();
