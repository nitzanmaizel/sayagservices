import express, { Request, Response } from 'express';

const router = express.Router();

router.post('/login', async (req: Request, res: Response) => {
  const { access_token } = req.body;

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to retrieve user information:', response.statusText);
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const userInfo = await response.json();
    const { email, name, picture } = userInfo;
    return res.status(200).json({ email, name, picture });
  } catch (error) {
    console.error('Error retrieving user information:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
