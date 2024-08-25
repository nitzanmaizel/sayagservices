// authRoute.ts
import { Request, Response, NextFunction } from 'express';
import { oAuth2Client } from '../config/oauth2Client';
import rateLimit from 'express-rate-limit';
import { google } from 'googleapis';

// Middleware to protect routes by ensuring the user is authenticated.
const authRoute = async (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.tokens) {
    try {
      oAuth2Client.setCredentials(req.session.tokens);
      const oauth2 = google.oauth2('v2');

      const userInfoResponse = await oauth2.userinfo.get({ auth: oAuth2Client });
      const userInfo = userInfoResponse.data;
      if (userInfo) {
        const { id, email, name, picture } = userInfo;
        req.session.userInfo = { id, email, name, picture };
      }

      next();
    } catch (error) {
      console.error('Error setting OAuth2 client credentials:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    console.warn(`Unauthorized access attempt to ${req.originalUrl} from IP ${req.ip}`);
    res.status(401).redirect('/login/');
  }
};

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

export async function logoutRoute(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.session.tokens) {
      await oAuth2Client.revokeToken(req.session.tokens.access_token);
      req.session.tokens = null;
    }

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Failed to destroy session during logout:', err);
        return res.status(500).send('Failed to log out');
      }

      return res.redirect('/login');
    });
  } catch (error) {
    next(error);
  }
}

export default [limiter, authRoute];
