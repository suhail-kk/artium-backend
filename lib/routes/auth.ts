const express = require('express');
const router = express.Router();

import { updateUserProfile } from '@/lib/controllers/auth/user';
import { userUpdateValidator } from '@/lib/rules/validators/user';

router.get('/me', () => {
	console.log('called');
});

router.post('/me', userUpdateValidator(), updateUserProfile);

export { router };
