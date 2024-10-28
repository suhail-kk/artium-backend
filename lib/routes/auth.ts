const express = require('express');
const router = express.Router();

import { getUser, updateUserProfile } from '@/lib/controllers/auth/user';
import { userUpdateValidator } from '@/lib/rules/validators/user';
import {
	me,
	login,
	registerUser,
	reGenereateToken,
} from '@/lib/controllers/auth/auth.controller';
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';

router.post('/login', login);
router.post('/register', registerUser);
router.post('/generate-token', reGenereateToken);

router.use(authenticateTokenMiddleware);

router.get('/me', me);
router.post('/me', userUpdateValidator(), updateUserProfile);

router.get('/user', getUser);

export { router };
