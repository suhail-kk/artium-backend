const express = require('express');
const router = express.Router();

import { updateUserProfile } from '@/lib/controllers/auth/user';
import { userUpdateValidator } from '../rules/validators/user';

router.get('/me', () => {});

router.post('/me', userUpdateValidator(), updateUserProfile);

export { router };
