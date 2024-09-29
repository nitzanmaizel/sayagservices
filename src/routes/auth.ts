import express from 'express';
import { googleCallback, login } from '../controllers/authControllers';

const router = express.Router();

router.get('/login', login);
router.get('/oauth2callback', googleCallback);

export default router;
