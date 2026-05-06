const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── PROTECT (any logged in user) ────────────
exports.protect = async (req, res, next) => {
  try {
    // 1. Check if token exists in the request header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // 2. Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user in the database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account has been deactivated' });
    }

    // 5. Attach user to the request and move on
    req.user = user;
    next();

  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// ─── ADMIN ONLY ───────────────────────────────
exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admins only' });
  }
  next();
};