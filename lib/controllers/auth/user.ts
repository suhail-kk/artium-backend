import { Response } from 'express';

import { interest, IupdateUser, language } from '@/lib/types/user';
import { updateUser } from '@/lib/services/user.services';
import { createResponse, createErrorResponse } from '@/lib/utils/apiResponse';
import { createBulkInterest } from '@/lib/services/interest.services';
import { createBulkLanguage } from '@/lib/services/language.services';

export async function getUser(_req: Request, res: Response) {
	try {
		// const { email } = req.user
		// const user = await userServices.getUserByEmail(email)
		return createResponse(res, { data: {}, status: 200 });
	} catch (error) {
		return createErrorResponse(res, error);
	}
}

export async function updateUserProfile(req: any, res: Response) {
	try {
		const body: IupdateUser = req.body;

		const userId = '6708c2bdf6efc4f53419d71f';
		// const userId = req.user

		let interests: Array<string> = [];
		let languages: Array<string> = [];

		if (body.interests) {
			let nonExistingInterests: interest[] = [];
			let existingInterests: interest[] = [];
			body.interests.forEach((interest) => {
				if (!interest._id) return nonExistingInterests.push(interest);
				existingInterests.push(interest);
			});
			const ret = await createBulkInterest(nonExistingInterests);
			interests = [...existingInterests, ...ret].map(
				(item: interest) => item._id
			);
		}
		if (body.languages) {
			let nonExistinglanguages: language[] = [];
			let existinglanguages: language[] = [];
			body.languages.forEach((language) => {
				if (!language._id) return nonExistinglanguages.push(language);
				existinglanguages.push(language);
			});
			const ret = await createBulkLanguage(nonExistinglanguages);
			languages = [...existinglanguages, ...ret].map(
				(item: language) => item._id
			);
		}

		const updatedUser = await updateUser(userId, {
			...body,
			interests,
			languages,
		});

		return createResponse(res, { data: updatedUser, status: 200 });
	} catch (error) {
		console.error(error);
		return createErrorResponse(res, error);
	}
}
