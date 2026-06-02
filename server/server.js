require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);

// Database Connection
console.log('Connecting to MongoDB...');
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/face_auth')
  .then(() => {
    console.log('MongoDB Connected');
    // Start Server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB Connection Error: ', err);
    process.exit(1);
  });