import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import routes from './routes';
import authRoutes from './routes/auth';
import { logger, cors, helmetMiddleware, sessionMiddleware, csurf } from './middleware';
import { errorHandler } from './middleware/errorHandler';
import process from 'process';

const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(logger);
app.use(cors);
app.use('/api', csurf({ cookie: true }));
app.use(helmetMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure SESSION_SECRET is set in production
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET must be set in production');
}

app.use(sessionMiddleware);

declare module 'express-session' {
  interface SessionData {
    tokens?: any;
    userInfo?: {
      id?: string | null;
      email?: string | null;
      name?: string | null;
      picture?: string | null;
    } | null;
  }
}

// Add a simple health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

app.use('/api/v1', routes);
app.use('/auth', authRoutes);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
