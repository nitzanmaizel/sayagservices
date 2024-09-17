import { Router } from 'express';
import docsRoute from './docs';
import authRoute from './auth';

const router = Router();

router.use('/auth', authRoute);

router.use(docsRoute);

export default router;
