import { body } from 'express-validator';

import userRules from '@/lib/rules/user.json';
import { validateParams } from '@/lib/utils/validateRequest';
import { validImageTypes } from '@/lib/utils/fileHelper';

export const userUpdateValidator = () => {
	return validateParams([
		body('firstName')
			.notEmpty()
			.withMessage('First name is required')
			.isLength({ max: userRules.name.max })
			.withMessage(`First name not to exceed ${userRules.name.max} characters`),
		body('lastName')
			.notEmpty()
			.withMessage('Last name is required')
			.isLength({ max: userRules.name.max })
			.withMessage(`Last name not to exceed ${userRules.name.max} characters`),
		body('about')
			.optional()
			.isLength({ max: userRules.about.max })
			.withMessage(`about should be within ${userRules.about.max} characters`),
		body('email')
			.notEmpty()
			.withMessage('Email is required')
			.isEmail()
			.withMessage('Not a valid email'),
		body('profileImage')
			.optional()
			.custom((value) => {
				if (typeof value == 'object') {
					if (value.size >= userRules.profileImage.max) {
						throw new Error('Profile image size to be less than 2 MB');
					}
					if (typeof value.type !== 'string') {
						throw new Error('profileImage type must be a string');
					}
					if (!validImageTypes.includes(value.type)) {
						throw new Error(
							'Invalid image type. Allowed types are: jpeg, png, gif, webp'
						);
					}
				}
				return true;
			}),
	]);
};
