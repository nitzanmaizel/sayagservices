import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import routes from './routes';
import { logger, cors, helmetMiddleware, errorHandler } from './middleware';
import { connectDB, disconnectDB } from './config/MongoDB';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(logger);
app.use(cors);
app.use(helmetMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

declare module 'express' {
  interface Request {
    user?: {
      id: string | null;
      email: string | null;
      name: string | null;
      picture: string | null;
      accessToken?: string;
    } | null;
    oauth2Client?: OAuth2Client;
  }
}

app.get('/health', (_, res) => {
  res.status(200).json({ message: 'Server is healthy!' });
});

app.use('/api/v1', routes);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await disconnectDB();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
