import { body } from 'express-validator';

import { validateParams } from '@/lib/utils/validateRequest';

export const userUpdateValidator = () => {
	return validateParams([
		body('firstName').notEmpty().withMessage('First name is required'),
		body('firstName').notEmpty().withMessage('Last name is required'),
		body('email').notEmpty().withMessage('Email is required'),
	]);
};
