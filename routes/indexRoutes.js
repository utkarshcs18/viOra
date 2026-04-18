const express = require('express');
const router = express.Router();

// This renders the main Music Player page
router.get('/', (req, res) => {
    res.render('index'); 
});

// This renders the Login page
router.get('/login', (req, res) => {
    res.render('login');
});

// This renders the Signup page
router.get('/signup', (req, res) => {
    res.render('signup');
});

module.exports = router;