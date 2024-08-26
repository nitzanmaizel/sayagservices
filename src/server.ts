import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import routes from './routes';
import authRoutes from './routes/auth';
import uiRoutes from './routes/uiRoutes';
import { logger, cors, helmet } from './middleware';
import { errorHandler } from './middleware/errorHandler';
import path from 'path';
import process from 'process';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Apply middleware
app.use(logger);
app.use(cors);
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com'],
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure SESSION_SECRET is set in production
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET must be set in production');
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  })
);

declare module 'express-session' {
  interface SessionData {
    tokens?: any;
    userInfo?: {
      id?: string | null;
      email?: string | null;
      name?: string | null;
      picture?: string | null;
    };
  }
}

// Add a simple health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

app.use('/api/v1', routes);
app.use('/auth', authRoutes);
app.use('/', uiRoutes);

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
