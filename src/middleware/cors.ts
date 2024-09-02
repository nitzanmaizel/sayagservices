import cors from 'cors';

const corsOptions = {
  optionsSuccessStatus: 200,
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'credentials'],
  credentials: true,
};

export default cors(corsOptions);
