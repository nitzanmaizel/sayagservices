import { Router } from 'express';
import {
  createDoc,
  deleteDocById,
  deleteDocsByName,
  downloadDocAsPDF,
  getDocRoute,
  getRecentDocs,
  searchDocs,
  updateDoc,
} from '../controllers/googleDocsController';
import { authenticateJWT, refreshTokenMiddleware } from '../middleware';

const router = Router();

router.use(authenticateJWT, refreshTokenMiddleware);
router.post('/docs/create', createDoc);
router.get('/docs/recent', getRecentDocs);
router.get('/docs/search', searchDocs);
router.get('/docs/:documentId', getDocRoute);
router.get('/docs/download/:documentId', downloadDocAsPDF);
router.put('/docs/:documentId', updateDoc);
router.delete('/docs/:documentId', deleteDocById);
router.delete('/docs', deleteDocsByName);

export default router;
