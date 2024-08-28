import express, { Request, Response } from 'express';
import { authUrl, oAuth2Client } from '../config/oauth2Client';
import authRoute from '../middleware/authRoute';
import { getRecentDocs } from '../controllers/googleDocsController';

const router = express.Router();

// Home page route
router.get('/', async (req: Request, res: Response) => {
  let userInfo;
  let recentDocs = [] as any[];
  if (req.session.tokens && req.session.userInfo) {
    userInfo = req.session.userInfo;
    oAuth2Client.setCredentials(req.session.tokens);
    recentDocs = await getRecentDocs(oAuth2Client);
  }

  res.render('home', { userInfo, recentDocs, authUrl });
});

// Login page route
router.get('/login', (_req: Request, res: Response) => {
  res.render('login', { authUrl, userInfo: null });
});

router.use(authRoute);

// Create document page route
router.get('/doc', (req: Request, res: Response) => {
  res.render('doc', { userInfo: req.session.userInfo });
});

export default router;
