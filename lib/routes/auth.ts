import { updateUserProfile } from '@/lib/controllers/auth/user';
import { userUpdateValidator } from '../rules/validators/user';
import {me,login,registerUser,reGenereateToken} from "@/lib/controllers/auth/auth.controller"
import { authenticateTokenMiddleware } from '../middlewares/auth.middleware';
const express = require('express');
const router = express.Router();

router.get('/me',authenticateTokenMiddleware,me);

router.post('/login',login)
router.post('/register',registerUser)
router.post('/generate-token', reGenereateToken)
export { router as authRoutes }
