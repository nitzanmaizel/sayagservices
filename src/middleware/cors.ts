import cors, { CorsOptions } from 'cors';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const corsOptions: CorsOptions = {
  optionsSuccessStatus: 200,
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'credentials'],
  credentials: true,
};

export default cors(corsOptions);
