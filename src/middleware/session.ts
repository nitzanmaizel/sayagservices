import session from 'express-session';

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: true,
  // cookie: {
  //   secure: process.env.NODE_ENV === 'production',
  //   httpOnly: true,
  //   sameSite: 'strict',
  // },
});

export default sessionMiddleware;
