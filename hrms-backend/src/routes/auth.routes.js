import express from 'express';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { login, refreshToken, logout, register, me } from '../controllers/auth.controller.js';

const router = express.Router();

// @route   POST /api/auth/login
router.post('/login', login);
router.post('/register', register);

// @route   POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// @route   POST /api/auth/logout
router.post('/logout', logout);

router.get('/me', verifyJWT, me);
export default router;
