import { Router } from 'express';
import {
  createDocRoute,
  getDocRoute,
  getRecentDocs,
  updateDocRoute,
} from '../controllers/googleDocsController';

const router = Router();

router.post('/docs/create', createDocRoute);
router.get('/docs/recent', getRecentDocs);
router.get('/docs/:documentId', getDocRoute);
router.put('/docs/:documentId', updateDocRoute);

export default router;
