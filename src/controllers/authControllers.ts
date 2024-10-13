import { Request, Response } from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

import { oAuth2Client, SCOPES } from '../config/oauth2Client';
import { UserInfoType } from '../types/UserType';
import AdminUser from '../models/UserModal';

const jwtSecret = process.env.JWT_SECRET as string;
const frontendUrl = process.env.FRONTEND_URL as string;

export const login = (_req: Request, res: Response) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  res.redirect(authUrl);
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;

  if (!code) {
    res.status(400).send('Authorization code not provided');
    return;
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);

    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oAuth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    const { id: googleId, email, name, picture } = userInfo.data as UserInfoType;

    const adminUser = await AdminUser.findOne({ email });

    if (!adminUser || !adminUser.isAdmin) {
      res.redirect(`${frontendUrl}/admin/unauthorized`);
      return;
    }

    adminUser.accessToken = tokens.access_token!;
    adminUser.refreshToken = tokens.refresh_token || adminUser.refreshToken;
    adminUser.tokenExpiryDate = tokens.expiry_date ? new Date(tokens.expiry_date) : undefined;

    if (!adminUser.googleId) {
      adminUser.googleId = googleId;
    }

    await adminUser.save();

    const jwtPayload = {
      userId: (adminUser._id as string).toString(),
      googleId,
      email,
      name,
      picture,
      isAdmin: true,
    };

    const jwtToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: '1h' });

    res.redirect(`${frontendUrl}?token=${jwtToken}`);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).send('Authentication failed');
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).send('User not authenticated');
      return;
    }

    console.log('getProfile', { user });

    const { name, email, picture, isAdmin } = user;
    res.json({ name, email, picture, isAdmin });
  } catch (error) {
    console.error('Error fetching profile or files:', error);
    res.status(500).send('Failed to fetch profile');
  }
};
