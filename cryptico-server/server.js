// importing dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { startCronJobs } = require('./utils/cronJobs');

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;


// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",          // Live Server
      "http://127.0.0.1:5500",
      "https://cryptico.vercel.app",    // Replace with your Vercel URL
      "https://cryptico.com"            // Your future domain
    ],
    credentials: true,
  })
);
app.use(express.json());

// ─── API Routes ────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// add after your routes
app.use((err, req, res, next) => {
  if (err.message) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cryptico API is running 🚀",
  });
});


// Connect to database then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    // start cron jobs after DB connects
    startCronJobs();
  })
  .catch(err => console.error('❌ Connection failed:', err));