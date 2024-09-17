import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import routes from './routes';
import { logger, cors, helmetMiddleware } from './middleware';
import { errorHandler } from './middleware/errorHandler';
import process from 'process';

const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(logger);
app.use(cors);
app.use(helmetMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

declare module 'express' {
  interface Request {
    user?: {
      id: string | null;
      email: string | null;
      name: string | null;
      picture: string | null;
      accessToken?: string;
    } | null;
  }
}

// Add a simple health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({ message: 'Server is healthy!' });
});

app.use('/api/v1', routes);

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
