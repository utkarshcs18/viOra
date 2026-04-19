const express = require('express');
const router = express.Router();

const { 
    searchMusic, 
    getRelatedVideos, 
    getVideoDetails, 
    getMoodPlaylist 
} = require('../controllers/musicController');

router.get('/search', searchMusic);
router.get('/related/:videoId', getRelatedVideos);
router.get('/details/:videoId', getVideoDetails);
router.get('/mood/:mood', getMoodPlaylist);

module.exports = router;