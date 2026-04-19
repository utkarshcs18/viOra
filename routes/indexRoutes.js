const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');

const jwt = require('jsonwebtoken');

const User = require('../models/User');

router.get('/', async (req, res) => {
    let isAuthenticated = false;
    let userEmail = '';
    let userName = '';
    const token = req.cookies ? req.cookies.token : null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'viora_secret_key');
            const user = await User.findById(decoded.id);
            if (user) {
                isAuthenticated = true;
                userEmail = user.email;
                userName = user.name ? user.name : user.email.split('@')[0];
            }
        } catch (e) {}
    }
    res.render('index', { isAuthenticated, userEmail, userName }); 
});

router.get('/login', (req, res) => {
    res.render('auth');
});

router.get('/signup', (req, res) => {
    res.render('auth');
});

module.exports = router;