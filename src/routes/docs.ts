import { Router, Request, Response } from 'express';
import { getDocRoute, createDocRoute, updateDocRoute } from '../controllers/googleDocsController';

const router = Router();

router.get('/docs/create', createDocRoute);
router.get('/docs/:documentId', getDocRoute);
router.put('/docs/:documentId', updateDocRoute);

router.get('/docs', (_: Request, res: Response) => {
  res.send('This is the Documentation Page!');
});

export default router;
