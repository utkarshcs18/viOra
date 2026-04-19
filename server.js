require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

const app = express();
connectDB();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Routes
app.use('/', require('./routes/indexRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/music', require('./routes/musicRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

app.listen(process.env.PORT, () => console.log(`Server: http://localhost:${process.env.PORT}`));