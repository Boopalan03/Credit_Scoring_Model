const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const dataService = require('./dataService');
const helmet = require('helmet');

// Routes
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (e.g. Render load balancer) for rate-limiting
app.set('trust proxy', 1);

// Enable security headers and CORS
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts and chart canvas in UI
}));

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Allow if in configured origins or if wildcard is set
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // Dynamically allow any vercel.app or onrender.com subdomains (preview deployments)
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Mount API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Root route welcome message
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the CreditScoreAI API Server.',
    version: '1.0 — AI-Powered Credit Scoring System',
    status: 'operational',
    fallback_database_active: !mongoose.connection.readyState,
    endpoints: {
      auth: '/api/auth',
      applications: '/api/applications',
      admin: '/api/admin',
      chat: '/api/chat',
    },
  });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creditscoreai';
console.log(`Connecting to database: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 3000
})
.then(() => {
  console.log('MongoDB connection successful.');
  dataService.setMongoConnected(true);
})
.catch((err) => {
  console.warn('MongoDB connection failed. Enabling local JSON file-based database fallback.');
  console.warn(`Connection error detail: ${err.message}`);
  dataService.setMongoConnected(false);
});

// Listen on configured port
app.listen(PORT, () => {
  console.log(`CreditScoreAI server is running on http://localhost:${PORT}`);
});
