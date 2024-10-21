const express = require('express');
const router = express.Router();

import { updateUserProfile } from '@/lib/controllers/auth/user';
import { userUpdateValidator } from '@/lib/rules/validators/user';
import {
	me,
	login,
	registerUser,
	reGenereateToken, logoutUser
} from '@/lib/controllers/auth/auth.controller';
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';

router.post('/login', login);
router.post('/register', registerUser);
router.post('/generate-token', reGenereateToken);

router.use(authenticateTokenMiddleware);
router.post('/logout', logoutUser)
router.get('/me', authenticateTokenMiddleware, me);
router.post('/me', userUpdateValidator(), updateUserProfile);

export { router as authRoutes };
