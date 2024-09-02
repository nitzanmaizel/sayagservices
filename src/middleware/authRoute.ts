import { Request, Response, NextFunction } from 'express';
import { oAuth2Client } from '../config/oauth2Client';
import rateLimit from 'express-rate-limit';
import { google } from 'googleapis';

/**
 * Middleware to protect routes by ensuring the user is authenticated.
 * This middleware checks for the presence of OAuth2 tokens in the session,
 * sets them on the OAuth2 client, and fetches user information if not already present.
 * If the access token is expired, it attempts to refresh the token.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 * @returns {Promise<void>} - A promise that resolves when the middleware completes.
 */
const authRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (req.session && req.session.tokens) {
    try {
      // Set the credentials using the tokens stored in the session
      oAuth2Client.setCredentials(req.session.tokens);

      // Check if the access token has expired and refresh it if necessary
      const expiryDate = oAuth2Client.credentials.expiry_date;
      const now = Date.now();

      if (expiryDate && expiryDate <= now) {
        const refreshResponse = await oAuth2Client.refreshAccessToken();
        req.session.tokens = refreshResponse.credentials;
      }

      if (!req.session.userInfo) {
        const oauth2 = google.oauth2('v2');
        const userInfoResponse = await oauth2.userinfo.get({ auth: oAuth2Client });
        req.session.userInfo = userInfoResponse.data;
      }

      next();
    } catch (error) {
      console.error('Error setting OAuth2 client credentials or fetching user info:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    console.warn(
      `Unauthorized access attempt to ${req.originalUrl} from IP ${req.ip} using ${req.headers['user-agent']}`
    );
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

/**
 * Handles user logout by revoking the OAuth2 token, clearing session data,
 * and destroying the session. After logout, the user is redirected to the home page.
 *
 * @param {Request} req - The Express request object, containing the session data.
 * @param {Response} res - The Express response object, used to redirect the user.
 * @param {NextFunction} next - The next middleware function in the stack, used for error handling.
 * @returns {Promise<void>} - A promise that resolves when the logout process is complete.
 */
export async function logoutRoute(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.session.tokens) {
      await oAuth2Client.revokeToken(req.session.tokens.access_token);
    }

    req.session.tokens = null;
    req.session.userInfo = null;

    req.session.destroy((err) => {
      if (err) {
        console.error('Failed to destroy session during logout:', err);
        return res.status(500).send('Failed to log out');
      }

      return res.redirect('/');
    });
  } catch (error) {
    next(error);
  }
}

export default [limiter, authRoute];
