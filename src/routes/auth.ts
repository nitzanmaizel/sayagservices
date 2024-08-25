import express, { Request, Response, NextFunction } from 'express';
import { oAuth2Client } from '../config/oauth2Client';
import { logoutRoute } from '../middleware/authRoute';

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

    res.redirect('/');
  } catch (error) {
    console.error('Error during OAuth2 callback:', error);
    res.status(500).send('Authentication error');
  }
});

router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  return logoutRoute(req, res, next);
});

export default router;
