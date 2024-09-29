// src/middleware/refreshToken.ts
import { Request, Response, NextFunction } from 'express';
import { userTokens } from '../utils/userStore';
import { Credentials } from 'google-auth-library';
import { oAuth2Client } from '../config/oauth2Client';

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

    oAuth2Client.setCredentials(tokens);

    if (isTokenExpiring(tokens)) {
      console.log('Access token is expiring. Refreshing token...');
      const newTokensResponse = await oAuth2Client.refreshAccessToken();
      tokens = newTokensResponse.credentials;
      oAuth2Client.setCredentials(tokens);
      userTokens[user.userId] = tokens;
      console.log('Token refreshed successfully.');
    }

    next();
  } catch (error) {
    console.error('Error refreshing access token:', error);
    res.status(500).send('Failed to refresh access token');
  }
};
