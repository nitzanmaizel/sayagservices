import { Router } from 'express';
import docsRoute from './docs';
import authRoute from './auth';
import productRoute from './products';
import { authenticateJWT, refreshTokenMiddleware } from '../middleware';

const router = Router();

router.use('/auth', authRoute);

router.use(authenticateJWT, refreshTokenMiddleware);
router.use('/docs', docsRoute);
router.use('/products', productRoute);

export default router;
