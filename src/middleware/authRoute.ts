import { Request, Response, NextFunction } from 'express';
import { oAuth2Client } from '../config/oauth2Client';

/**
 * Middleware to protect routes by ensuring the user is authenticated.
 * If the user has valid tokens in the session, their credentials are set on the OAuth2 client.
 * Otherwise, the user is redirected to the authentication route.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {void}
 */
const authRoute = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.tokens) {
    oAuth2Client.setCredentials(req.session.tokens);

    next();
  } else {
    res.status(401).redirect('/auth/');
  }
};

export default authRoute;
