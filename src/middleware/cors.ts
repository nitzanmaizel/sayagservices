import cors, { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  optionsSuccessStatus: 200,
  origin: ['http://localhost:3000', 'https://sayagservices-app-c8e753671a56.herokuapp.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'credentials'],
  credentials: true,
};

export default cors(corsOptions);
