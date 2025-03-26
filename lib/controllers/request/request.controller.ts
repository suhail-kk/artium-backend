import mongoose from 'mongoose';
import { NextFunction, Request, Response } from 'express';

import requestServices from '@/lib/services/request.services';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';


export async function getRequests(req: Request, res: Response, next: NextFunction) {
    try {
        const page = parseInt((req.query.page as string) || '1', 10);
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const user_id = req.query.user_id ? new mongoose.Types.ObjectId(req.query.user_id as string) : undefined;

        const { data, count } = await requestServices.getRequests({ page, limit, user_id: new mongoose.Types.ObjectId(user_id) });
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Requests fetched successfully', {
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
