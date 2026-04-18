const express = require('express');
const router = express.Router();

const { searchMusic } = require('../controllers/musicController');

router.get('/search', searchMusic); 

module.exports = router;