import { Router } from 'express';
import homeRoute from './home';
import docsRoute from './docs';
import authRoute from '../middleware/authRoute';

const router = Router();

router.use(authRoute);
router.use(homeRoute);
router.use(docsRoute);

export default router;
