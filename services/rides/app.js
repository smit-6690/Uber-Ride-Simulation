require('dotenv').config();
const express = require('express');
const connectDB = require('./db');
const rideRoutes = require('./routes/rideRoutes');
const cors = require('cors');

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

const { connectKafkaProducer } = require('./kafkaProducer');
connectKafkaProducer();


// Connect to Redis
const { connectRedis } = require('./redisClient');
connectRedis().catch(err => {
  console.error('Failed to connect to Redis:', err);
  process.exit(1);
});

app.use(express.json());

// Routes
app.use('/api/rides', rideRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`🚗 Rides Service running on port ${PORT}`);
});


