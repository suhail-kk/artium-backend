import { body } from 'express-validator';

import projectsRules from '@/lib/rules/projects.json';
import { validateParams } from '@/lib/utils/validateRequest';
import { validVideoTypes } from '@/lib/utils/fileHelper';

export const projectsValidator = () => {
	return validateParams([
		body('files').isArray().withMessage('Files should be an array'),
		body('files').custom((files) => {
			if (!files || files.length === 0) {
				throw new Error('Files array should not be empty');
			}

			const maxSize = projectsRules.video.max

			for (const file of files) {
				if (!validVideoTypes.includes(file.type)) {
					throw new Error(
						'Invalid file type'
					);
				}
				if (file.size > maxSize) {
					throw new Error(`Each file size must not exceed 150MB`);
				}
			}

			return true;
		})
	]);
};
