const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  likedSongs: [{ videoId: String, title: String, thumbnail: String, artist: String }],
  history: [{ videoId: String, title: String, playedAt: { type: Date, default: Date.now } }],
  playlists: [{ name: String, songs: Array }]
});

module.exports = mongoose.model('User', userSchema);