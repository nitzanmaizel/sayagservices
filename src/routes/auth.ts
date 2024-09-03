import express, { Request, Response, NextFunction } from 'express';
import { authUrl, oAuth2Client } from '../config/oauth2Client';
import authRoute from '../middleware/authRoute';
import { google } from 'googleapis';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const router = express.Router();

/**
 * Handles OAuth2 callback from Google.
 * Retrieves the authorization code from the query string,
 * exchanges it for tokens, and stores the tokens in the session.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A promise that resolves when the callback is handled.
 */
router.get('/oauth2callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const { tokens } = await oAuth2Client.getToken(code);
    req.session.tokens = tokens;

    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2('v2');

    const userInfoResponse = await oauth2.userinfo.get({ auth: oAuth2Client });
    const userInfo = userInfoResponse.data;

    console.log('User info:', userInfo);

    if (userInfo) {
      const { id, email, name, picture } = userInfo;
      req.session.userInfo = { id, email, name, picture };

      res.redirect(FRONTEND_URL + '/about');
    } else {
      res.status(400).json({ message: 'User information not found' });
    }
  } catch (error) {
    console.error('Error during OAuth2 callback:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
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
router.get('/logout', async (req: Request, res: Response, next: NextFunction) => {
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

      return res.redirect('http://localhost:3000');
    });
  } catch (error) {
    next(error);
  }
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
router.get('/login', (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).json({ name: 'Nitzan', picture: '' });
});

router.get('/authUrl', (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).json({ authUrl });
});

router.get('/user', authRoute, (req: Request, res: Response, _next: NextFunction) => {
  if (req.session && req.session.userInfo) {
    const { name, picture } = req.session.userInfo;
    res.status(200).json({ name, picture });
  } else {
    res.status(400).send('User information not found');
  }
});

export default router;
