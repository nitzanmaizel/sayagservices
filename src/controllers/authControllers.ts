import { Request, Response } from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

import { oAuth2Client, SCOPES } from '../config/oauth2Client';
import { userTokens } from '../utils/userStore';

const jwtSecret = process.env.JWT_SECRET as string;

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

    const userId = userInfo.data.id as string;
    userTokens[userId] = tokens;

    const jwtPayload = {
      userId,
      email: userInfo.data.email,
      name: userInfo.data.name,
    };

    const jwtToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: '1h' });

    res.redirect(`http://localhost:3000/home?token=${jwtToken}`);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).send('Authentication failed');
  }
};
