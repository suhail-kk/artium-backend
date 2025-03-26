const express = require('express');
const router = express.Router();

import { getUser } from '@/lib/controllers/auth/user';
import {
	me,
	login,
	registerUser,
	reGenereateToken,
	logoutUser,
	forgotPassword,
	resetPassword,
} from '@/lib/controllers/auth/auth.controller';
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';

router.post('/login', login);
router.post('/register', registerUser);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', forgotPassword);

router.post('/generate-token', reGenereateToken);

router.use(authenticateTokenMiddleware);

router.post('/logout', logoutUser);
router.get('/me', me);

router.get('/user', getUser);

export { router };
