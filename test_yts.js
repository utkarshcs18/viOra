const yts = require('yt-search');
async function run() {
    const r = await yts('top global hit songs official audio');
    console.log("Found:", r.videos.length);
    if (r.videos.length > 0) {
        console.log(r.videos[0]);
    }
}
run();
