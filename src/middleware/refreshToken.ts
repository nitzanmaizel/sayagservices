import { Request, Response, NextFunction } from 'express';
import AdminUser from '../models/UserModal';
import { refreshAccessToken } from '../services/authServices';
import { oAuth2Client } from '../config/oauth2Client';

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.userId;

  try {
    const adminUser = await AdminUser.findById(userId);

    if (!adminUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const tokenExpiryDate = adminUser.tokenExpiryDate;
    const accessToken = adminUser.accessToken;

    if (!accessToken || !tokenExpiryDate || tokenExpiryDate <= new Date()) {
      await refreshAccessToken(userId);
    }

    oAuth2Client.setCredentials({ access_token: adminUser.accessToken });

    req.oauth2Client = oAuth2Client;
    req.accessToken = adminUser.accessToken;

    next();
  } catch (error) {
    console.error('Error in ensureValidAccessToken middleware:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
