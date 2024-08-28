import helmet from 'helmet';

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: [
        "'self'",
        'data:',
        'https://work.fife.usercontent.google.com',
        'https://lh3.googleusercontent.com',
        'https://drive.google.com',
      ],
    },
  },
  referrerPolicy: { policy: 'no-referrer' },
});

export default helmetMiddleware;
