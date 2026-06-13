const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rate Limiter: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

// Mock endpoint for lessons list (to be expanded with database)
app.get('/api/lessons', (req, res) => {
  res.json([
    {
      id: 'bai-1',
      title: 'Bài 1: Hajimemashite (Rất hân hạnh được làm quen)',
      description: 'Học cách chào hỏi cơ bản, tự giới thiệu bản thân và từ vựng cơ bản.',
      vocabularyCount: 15,
      grammarPoints: 3
    }
  ]);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
