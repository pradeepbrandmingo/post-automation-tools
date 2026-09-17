import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import connectDB from './config/db.js';
import { processScheduledPosts } from './services/cronService.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import postRoutes from './routes/postRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
const allowedOrigins = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000'] : true;
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/posts', postRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Meta Auto-Posting API Engine',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});


// Setup Fallback Local Cron Job (Runs every 1 minute)
cron.schedule('* * * * *', async () => {
  try {
    await processScheduledPosts();
  } catch (err) {
    console.error('Cron Execution Error:', err.message);
  }
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Meta Auto-Post Server Running on Port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});

// Firebase Cloud Functions Export Handler (only when running inside Firebase)
// Dynamic import used because firebase-functions may not be installed in local mode
let api, scheduledPublisher;
try {
  const { default: functions } = await import('firebase-functions');
  api = functions.https.onRequest(app);
  scheduledPublisher = functions.pubsub
    .schedule('every 1 minutes')
    .onRun(async (context) => {
      console.log('⏰ Firebase Scheduled Publisher Triggered');
      await processScheduledPosts();
      return null;
    });
} catch (e) {
  // Ignored when running standard Node.js server outside Firebase emulator
}

export { api, scheduledPublisher };

