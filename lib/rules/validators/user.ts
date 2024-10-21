import { body } from 'express-validator';

import { validateParams } from '@/lib/utils/validateRequest';

export const userUpdateValidator = () => {
	return validateParams([
		body('firstName').notEmpty().withMessage('First name is required'),
		body('lastName').notEmpty().withMessage('Last name is required'),
		body('email')
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Not a valid email'),
	]);
};
