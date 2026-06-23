import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import apiRouter from './routes/api.js';
import authRoutes from './routes/authRoutes.js';
import { connectDatabase } from './config/db.js';
import { seedIfEmpty } from './scripts/seedDatabase.js';
import { ensureUserProfiles } from './scripts/ensureUserProfiles.js';

dotenv.config();



const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Expose io to all requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5001;

// ✅ BASE URL (IMPORTANT FOR PRODUCTION)
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// ✅ CORS (ALLOW YOUR VERCEL FRONTEND)
app.use(cors({
  origin: [
    "https://app-z-makers.vercel.app", 
    "https://app-z-makers-8peo.vercel.app", 
    "http://localhost:5173", 
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'WorkForge Backend Service is running!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dataSource: 'MongoDB Atlas',
    swagger: `http://localhost:${PORT}/api-docs`,
    timestamp: new Date(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', apiRouter);

let swaggerSpec;
try {
  const mod = await import('./config/swagger.js');
  swaggerSpec = mod.default;
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'WorkForge API Docs',
  }));
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));
} catch (err) {
  console.warn('⚠️  Swagger setup skipped:', err.message);
}

const startServer = async () => {
  try {
    await connectDatabase();
    await seedIfEmpty();
    await ensureUserProfiles();

    const server = httpServer.listen(PORT, () => {
      console.log(`🚀 WorkForge Server running on port ${PORT}`);
      console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
      console.log(`🔐 Auth API:  http://localhost:${PORT}/api/auth/login`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Stop the other process or change PORT in backend/.env`);
      } else {
        console.error('❌ Failed to start server:', error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start server if not running in a serverless environment like Vercel
if (process.env.NODE_ENV !== 'production') {
  startServer();
} else {
  // In production (Vercel Serverless), connect to the database
  // but do not call app.listen()
  connectDatabase()
    .then(() => console.log('✅ MongoDB connected in Vercel Serverless'))
    .catch((err) => console.error('❌ Failed to connect to MongoDB:', err.message));
}

export default app;
