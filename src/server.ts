import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import session from 'express-session';
import routes from './routes';
import authRoutes from './routes/auth';
import { logger, cors, helmet } from './middleware';
import { errorHandler } from './middleware/errorHandler';
dotenv.config();

const app = express();
const PORT = 3000;

// Apply middleware
app.use(logger);
app.use(cors);
app.use(helmet);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
  }
}

app.use('/api/v1', routes);
app.use('/auth', authRoutes);

app.get('/', (_: Request, res: Response) => {
  res.send('Hello, TypeScript Server with Structure!');
});

// Global error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
