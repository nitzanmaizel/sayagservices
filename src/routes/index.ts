import { Router } from 'express';
import homeRoute from './home';
import docsRoute from './docs';
import authVerifyToken from '../middleware/authVerifyToken';

const router = Router();

router.use(authVerifyToken);
router.use(homeRoute);
router.use(docsRoute);

export default router;
