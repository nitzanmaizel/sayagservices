import { Router } from 'express';
import {
  createDocRoute,
  downloadDocAsPDF,
  getDocRoute,
  getRecentDocs,
  updateDocRoute,
} from '../controllers/googleDocsController';

const router = Router();

router.post('/docs/create', createDocRoute);
router.get('/docs/recent', getRecentDocs);
router.get('/docs/:documentId', getDocRoute);
router.put('/docs/:documentId', updateDocRoute);
router.get('/docs/:documentId/download', downloadDocAsPDF);

export default router;
