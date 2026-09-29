import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import presenceRoutes from './routes/presenceRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import heroSlideRoutes from './routes/heroSlideRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'CampusConnect',
    institution: 'Knowledge Institute of Technology (KIOT)',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/presence', presenceRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/hero-slides', heroSlideRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/uploads', uploadRoutes);

// Centralized error handling
app.use(errorHandler);

export default app;
