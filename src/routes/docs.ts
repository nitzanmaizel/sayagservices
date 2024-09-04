import { Router } from 'express';
import { getDocRoute, updateDocRoute } from '../controllers/googleDocsController';

const router = Router();

// router.post('/docs/create', createDocRoute);
router.get('/docs/:documentId', getDocRoute);
router.put('/docs/:documentId', updateDocRoute);

export default router;
