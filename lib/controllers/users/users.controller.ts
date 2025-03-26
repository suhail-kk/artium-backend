import userServices from '@/lib/services/users.service';
import { NextFunction, Request, Response } from 'express';
import { createErrorResponse } from '@/lib/utils/apiResponse';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';


export async function getUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const search = (req.query.search as string) || '';

        const limit = parseInt((req.query.limit as string) || '10', 10);
        const page = parseInt((req.query.page as string) || '1', 10);

        const { data, count } = await userServices.getUsers({ search, page, limit });
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Users fetched successfully', {
            data,
            meta: {
                page,
                limit,
                total: count,
                totalPages,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
    try {
        const user_id = req.query.id as string;

        if (!user_id) {
            return createErrorResponse(res, { message: 'User ID is required' }, 400);
        }

        const user = await userServices.getUserById(user_id);

        if (!user) {
            return createErrorResponse(res, { message: 'User not found' }, 404);
        }

        return sendSuccessResponse(res, 'User details fetched successfully', { data: user });
    } catch (error) {
        next(error);
    }
}
