// importing dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ─── API Routes ────────────────────────────────
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// add after your routes
app.use((err, req, res, next) => {
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

// ─── Static files ─────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Fallback ──────────────────────────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});



// Connect to database then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server live → http://localhost:${process.env.PORT}`);
    });
  })
  .catch(err => console.error('❌ Connection failed:', err));