import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Import Middleware
import { protect } from './middleware/authMiddleware.js';
export { protect };

// Import Routes
import authRoutes from './routes/authRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import rateCardRoutes from './routes/rateCardRoutes.js';
import khataRoutes from './routes/khataRoutes.js';
import staffRoutes from './routes/staffRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(morgan('dev'));

// Serve static compiled invoice PDFs and uploaded media
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rate-cards', rateCardRoutes);
app.use('/api/khata', khataRoutes);
app.use('/api/staff', staffRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('TradeDesk SaaS API is fully operational!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error Stack:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred',
  });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trade_desk';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running in development mode on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
