import { Response } from 'express';

import { createResponse, createErrorResponse } from '@/lib/utils/apiResponse';
import { getInterests } from '@/lib/services/interest.services';
import { getLanguages } from '@/lib/services/language.services';

export async function interestData(req: any, res: Response) {
	try {
		const { match, limit } = req?.query;
		const interests = await getInterests(match);

		return createResponse(res, { data: interests, status: 200 });
	} catch (error) {
		return createErrorResponse(res, error);
	}
}

export async function languagesData(req: any, res: Response) {
	try {
		const { match, limit } = req?.query;
		const languages = await getLanguages(match);

		return createResponse(res, { data: languages, status: 200 });
	} catch (error) {
		return createErrorResponse(res, error);
	}
}
