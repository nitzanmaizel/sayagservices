import { Router, Request, Response } from 'express';
import { getDocRoute, createDocRoute, updateDocRoute } from '../controllers/googleDocsController';

const router = Router();

router.post('/docs/create', createDocRoute);
router.get('/docs/:documentId', getDocRoute);
router.put('/docs/:documentId', updateDocRoute);

router.get('/docs', (req: Request, res: Response) => {
  res.json({ page: 'This is the Documentation Page!', userInfo: req.session.userInfo });
});

export default router;
