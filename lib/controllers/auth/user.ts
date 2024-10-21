import { Request, Response } from 'express';

import s3paths from '@/lib/constants/s3paths';
import { s3PutURL } from '@/lib/utils/s3utils';
import { updateUser } from '@/lib/services/user.services';
import { interest, IupdateUser, language } from '@/lib/types/user';
import { createBulkInterest } from '@/lib/services/interest.services';
import { createBulkLanguage } from '@/lib/services/language.services';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import { createResponse, createErrorResponse } from '@/lib/utils/apiResponse';
import { getFileExtensionAndCategory } from '@/lib/utils/fileHelper';

export async function getUser(_req: Request, res: Response) {
	try {
		// const { email } = req.user
		// const user = await userServices.getUserByEmail(email)
		return sendSuccessResponse(res, 'success');
	} catch (error) {
		return createErrorResponse(res, error);
	}
}

export async function updateUserProfile(req: any, res: Response) {
	try {
		const body: IupdateUser = req.body;

		const userId = req.user._id;

		let interests: Array<string> = [];
		let languages: Array<string> = [];
		let profilePutURL: string = '';

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

		if (body.profileImage)
			profilePutURL = s3PutURL(
				s3paths.userProfileImage +
					userId +
					getFileExtensionAndCategory(body.profileImage.type).extension
			);

		const updatedUser = await updateUser(userId, {
			...body,
			interests,
			languages,
		});

		return createResponse(res, {
			data: { profilePutURL, updatedUser },
			status: 200,
		});
	} catch (error) {
		console.error(error);
		return createErrorResponse(res, error);
	}
}
