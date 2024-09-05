import cors, { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  optionsSuccessStatus: 200,
  origin: ['http://localhost:3000', 'https://polar-oasis-90047-4d8ad94d27f3.herokuapp.com/'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'credentials'],
  credentials: true,
};

export default cors(corsOptions);
