require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db');
const cors = require('cors');
const redis = require('redis');
const adminRoutes = require('./routes/adminRoutes'); // ✅ Import your route file

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(cors());
app.use(express.json());

console.log("🔍 Using Mongo URI:", process.env.MONGO_URI);

// Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected (admin-service)');
});

connectDB();

// Import the Administrator model
require('./models/administrator');

// ✅ MOUNT ALL ROUTES
app.use('/api/admin', adminRoutes); // this enables /api/admin/signup, /drivers, etc.

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`👨‍💼 Admin Service running on port ${PORT}`);
});
