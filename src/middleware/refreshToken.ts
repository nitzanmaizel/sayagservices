import { Request, Response, NextFunction } from 'express';
import { Credentials, OAuth2Client } from 'google-auth-library';
import { userTokens } from '../utils/userStore';

function isTokenExpiring(tokens: Credentials): boolean {
  const expiryDate = tokens.expiry_date;
  const now = Date.now();
  return expiryDate ? expiryDate - now <= 60 * 1000 : false;
}

export const refreshTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.body.user;

    let tokens = userTokens[user.userId];

    if (!tokens) {
      res.status(401).send('User not authenticated');
      return;
    }

    const oauth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET);

    oauth2Client.setCredentials(tokens);

    if (isTokenExpiring(tokens)) {
      const newTokensResponse = await oauth2Client.refreshAccessToken();
      tokens = newTokensResponse.credentials;
      oauth2Client.setCredentials(tokens);
      userTokens[user.userId] = tokens;
    }

    req.oauth2Client = oauth2Client;

    next();
  } catch (error) {
    console.error('Error refreshing access token:', error);
    res.status(500).send('Failed to refresh access token');
  }
};
