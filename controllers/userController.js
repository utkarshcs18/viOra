const User = require('../models/User');

exports.addToHistory = async (req, res) => {
  try {
    const { videoId, title, thumbnail, artist } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Add to beginning of history
    user.history.unshift({ videoId, title, thumbnail, artist, playedAt: new Date() });
    
    // Keep only last 50 songs
    if (user.history.length > 50) {
      user.history = user.history.slice(0, 50);
    }
    
    await user.save();
    res.json(user.history);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.history);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.likeSong = async (req, res) => {
  try {
    const { videoId, title, thumbnail, artist } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    // Toggle liked status
    const existsIndex = user.likedSongs.findIndex(song => song.videoId === videoId);
    let isLiked = false;
    
    if (existsIndex > -1) {
      user.likedSongs.splice(existsIndex, 1);
    } else {
      user.likedSongs.push({ videoId, title, thumbnail, artist });
      isLiked = true;
    }
    
    await user.save();
    
    res.json({ likedSongs: user.likedSongs, isLiked });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getLikedSongs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.likedSongs);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    user.playlists.push({ name, songs: [] });
    await user.save();
    
    res.json(user.playlists);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getPlaylists = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.playlists);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
