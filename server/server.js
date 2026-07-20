import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import roomRoutes from './routes/roomRoutes.js';

const app = express();

app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((error) => console.error('❌ MongoDB Connection Error:', error.message));

app.use('/api/rooms', roomRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Roommate-Finder API is active!' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});