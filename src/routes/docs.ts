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

const router = Router();

router.post('/create', createDoc);
router.get('/recent', getRecentDocs);
router.get('/search', searchDocs);
router.get('/:documentId', getDocRoute);
router.get('/download/:documentId', downloadDocAsPDF);
router.put('/:documentId', updateDoc);
router.delete('/:documentId', deleteDocById);
router.delete('/', deleteDocsByName);

export default router;
