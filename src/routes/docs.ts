import { Router } from 'express';
import {
  createDocRoute,
  deleteDocById,
  deleteDocsByName,
  downloadDocAsPDF,
  getDocRoute,
  getRecentDocs,
  searchDocs,
  updateDocRoute,
} from '../controllers/googleDocsController';
import authVerifyToken from '../middleware/authVerifyToken';

const router = Router();

router.use(authVerifyToken);
router.post('/docs/create', createDocRoute);
router.get('/docs/recent', getRecentDocs);
router.get('/docs/search', searchDocs);
router.get('/docs/:documentId', getDocRoute);
router.get('/docs/:documentId/download', downloadDocAsPDF);
router.put('/docs/:documentId', updateDocRoute);
router.delete('/docs/:documentId', deleteDocById);
router.delete('/docs', deleteDocsByName);

export default router;
