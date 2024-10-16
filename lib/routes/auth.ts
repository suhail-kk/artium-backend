import { updateUserProfile } from '@/lib/controllers/auth/user';
import { userUpdateValidator } from '../rules/validators/user';

const express = require('express');
const router = express.Router();

router.get('/me', () => {
	console.log('called');
});

router.post('/me', userUpdateValidator(), updateUserProfile);

export { router };
