import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import donorRoutes from './routes/donorRoutes';
import ngoRoutes from './routes/ngoRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import aadhaarRoutes from './routes/aadhaarRoutes';
import chatbotRoutes from './routes/chatbotRoutes';
import advertisementRoutes from './routes/advertisementRoutes';
import complaintRoutes from './routes/complaintRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import donationRoutes from './routes/donationRoutes';

// Load environment variables
dotenv.config();

// Initialize express app
const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for receipts with proper configuration
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/aadhaar', aadhaarRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString() 
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path 
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
const startServer = async () => {
  try {
    console.log('🔄 Starting server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
    
    // Connect to database
    await connectDB();
    
    // Start listening - bind to 0.0.0.0 for production
    const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Server is running on ${HOST}:${PORT}`);
      console.log(`📡 API available at: http://${HOST}:${PORT}/api`);
      console.log(`💚 Health check: http://${HOST}:${PORT}/api/health`);
      console.log(`📄 Uploads served from: http://${HOST}:${PORT}/uploads`);
    });

    // Set timeouts for production
    if (process.env.NODE_ENV === 'production') {
      server.keepAliveTimeout = 120000; // 120 seconds
      server.headersTimeout = 120000; // 120 seconds
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();