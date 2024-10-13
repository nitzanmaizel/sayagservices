import express from 'express';
import { getProfile, googleCallback, login } from '../controllers/authControllers';
import { authenticateJWT } from '../middleware';
import { refreshTokenMiddleware } from '../middleware/refreshToken';

const router = express.Router();

router.get('/login', login);
router.get('/oauth2callback', googleCallback);

router.use(authenticateJWT, refreshTokenMiddleware);
router.get('/user', getProfile);

export default router;
