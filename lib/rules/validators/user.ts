import { param } from 'express-validator';

import { validateParams } from '@/lib/utils/validateRequest';

export const userUpdateValidator = () => {
	return validateParams([param('id').notEmpty().isNumeric()]);
};
