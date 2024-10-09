import { Router } from 'express';
import docsRoute from './docs';
import authRoute from './auth';
import productRoute from './products';
import userRoute from './user';
import { authenticateJWT, refreshTokenMiddleware } from '../middleware';

const router = Router();

router.use('/auth', authRoute);
router.use('/products', productRoute);

router.use(authenticateJWT, refreshTokenMiddleware);
router.use('/docs', docsRoute);
router.use('/user', userRoute);

export default router;
