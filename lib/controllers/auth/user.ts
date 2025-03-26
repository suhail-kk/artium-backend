import { Types } from 'mongoose';
import { NextFunction, Request, Response } from 'express';

import { BadRequestError } from '@/lib/utils/errors/errors';
import { getUserProifleById } from '@/lib/services/auth.services';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';

export async function getUser(req: Request, res: Response, next: NextFunction) {
	try {
		const { _id } = req?.user;
		const userId = req.query.userId as string;

		const id = userId ? new Types.ObjectId(userId) : new Types.ObjectId(_id)
		const user: any = await getUserProifleById(id);
		if (!user) throw new BadRequestError("User doesn't exists");

		sendSuccessResponse(res, 'Success', {
			...user[0]
		});
	} catch (error) {
		next(error);
	}
}

