const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Global process error handlers to prevent crashes from unhandled promise rejections or exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Request logging middleware for debugging crashes
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Rate Limiter: 100 requests per 15 minutes (10000 in development/testing)
const isProd = process.env.NODE_ENV === 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 100 : 10000,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Nihongo Flow Backend API!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Interactive API Test Client endpoint
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../test_client.html'));
});
app.get('/test-client.js', (req, res) => {
  res.sendFile(path.join(__dirname, '../test_client.js'));
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Avoid port binding issue during tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
    
    // Tự động đồng bộ hóa dữ liệu lên Supabase khi khởi chạy
    try {
      const { runSeed } = require('./db/seed_supabase');
      runSeed().catch(err => {
        console.warn('⚠️ Supabase auto-seed warning:', err.message || err);
      });
    } catch (seedErr) {
      console.warn('⚠️ Failed to load auto-seed script:', seedErr.message || seedErr);
    }
  });
}

module.exports = app;
