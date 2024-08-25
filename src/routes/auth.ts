import express, { Request, Response } from 'express';
import { authUrl, oAuth2Client } from '../config/oauth2Client';

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
    res.redirect('/api/v1/docs');
  } catch (error) {
    console.error('Error during OAuth2 callback:', error);
    res.status(500).send('Authentication error');
  }
});

router.get('/', (_: Request, res: Response) => {
  res.send(`<h1>Google Docs API</h1><a href=${authUrl}>Login</a>`);
});

export default router;
