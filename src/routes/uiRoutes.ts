import express, { Request, Response } from 'express';
import { authUrl } from '../config/oauth2Client';
import authRoute from '../middleware/authRoute';

const router = express.Router();

// Home page route
router.get('/', (req: Request, res: Response) => {
  const userInfo = req.session.userInfo;
  // Replace with actual logic to get recent docs
  const recentDocs = getRecentDocs();
  res.render('home', { userInfo, recentDocs });
});

// Login page route
router.get('/login', (_req: Request, res: Response) => {
  res.render('login', { authUrl, userInfo: null });
});

router.use(authRoute);

// Create document page route
router.get('/doc', (req: Request, res: Response) => {
  console.log({ userInfo: req.session.userInfo });
  res.render('doc', { userInfo: req.session.userInfo });
});

export default router;

// Replace `getRecentDocs()` with actual logic or a service call to get recent documents
function getRecentDocs() {
  // This is just a placeholder. Replace it with your actual logic.
  return [
    { title: 'Document 1', created_at: new Date() },
    { title: 'Document 2', created_at: new Date() },
  ];
}
