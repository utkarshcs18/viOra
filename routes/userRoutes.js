const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  addToHistory,
  getHistory,
  likeSong,
  getLikedSongs,
  createPlaylist,
  getPlaylists
} = require('../controllers/userController');

router.use(authenticate);

router.post('/history', addToHistory);
router.get('/history', getHistory);

router.post('/liked', likeSong);
router.get('/liked', getLikedSongs);

router.post('/playlists', createPlaylist);
router.get('/playlists', getPlaylists);

module.exports = router;
