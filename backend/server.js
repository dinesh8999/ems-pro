import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import performanceRoutes from './routes/performance.routes.js';
import departmentRoutes from './routes/department.routes.js';
import activityRoutes from './routes/activity.routes.js';
import errorHandler from './middleware/error.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
// Configure CORS: allow all in dev, restrict via CORS_ORIGIN in production (comma-separated list)
const corsOptions = {};
if (process.env.CORS_ORIGIN) {
  const whitelist = process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
  corsOptions.origin = function(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  };
}
app.use(cors(Object.keys(corsOptions).length ? corsOptions : undefined));
// Security headers
app.use(helmet());

// Basic rate limiting (generous limits for dev & dashboard polling)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use(limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Validate required env vars in non-test environments
if (process.env.NODE_ENV !== 'test') {
  const requiredEnvs = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = requiredEnvs.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
}

// Database connection (only if MONGODB_URI provided)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
      }
    });
} else if (process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ MONGODB_URI not set; skipping DB connection');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/activity', activityRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Start server (skip listening in test environment)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Stop the existing process or set a different PORT in backend/.env`);
    } else {
      console.error('❌ Server startup error:', error);
    }
    process.exit(1);
  });
}

export default app;
