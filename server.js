// importing dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Setting up the app
dotenv.config();
const app = express();

// Middle
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//Routes
// app.use('/api/auth',         require('./routes/auth'));


// Fallback Route
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

// Connect to dataBase MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('✅ MongoDB connected');
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server live → http://localhost:${process.env.PORT}`);
    });
  })
.catch(err => console.error('❌ Connection failed:', err));