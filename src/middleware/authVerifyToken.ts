import { Request, Response, NextFunction } from 'express';

const authVerifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const accessToken = authHeader.split(' ')[1]; // Extract the token from the header

  try {
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userInfoResponse.ok) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const userInfo = await userInfoResponse.json();

    const user = {
      ...userInfo,
      accessToken,
    };
    req.user = user;

    return next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Failed to verify token' });
  }
};

export default authVerifyToken;
