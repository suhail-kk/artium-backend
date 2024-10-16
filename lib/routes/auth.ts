import { updateUserProfile } from '@/lib/controllers/auth/user';

const express = require('express');
const router = express.Router();

router.get('/me', () => {
	console.log('called');
});

router.post('/me', updateUserProfile);

export { router };
