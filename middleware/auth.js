const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET || 'viora_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};

module.exports = authenticate;
