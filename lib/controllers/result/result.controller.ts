import { NextFunction, Request, Response } from 'express';

import eventService from '@/lib/services/event.service';
import resultServices from '@/lib/services/result.service';
import { createErrorResponse } from '@/lib/utils/apiResponse';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';

export async function addResult(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            event_id,
            results
        } = req.body;


        const resultPayload = {
            event_id,
            results
        };

        const isAleadyCreated = await resultServices.isResultExist({ event_id })

        if (isAleadyCreated) {
            return createErrorResponse(res, { message: "Already added the result" }, 400);
        }

        const event = await eventService.getEventById(event_id);

        if (!(event?.status === "Completed")) {
            return createErrorResponse(res, { message: "Event is not completed. you can can add the result once it is completed" }, 400)
        }

        const retVal = await resultServices.addResult(resultPayload);

        return sendSuccessResponse(res, 'Result added successfully', { data: retVal });
    } catch (error) {
        next(error);
    }
}

export async function updateResult(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            results,
            result_id,
        } = req.body;


        const resultPayload = {
            results
        };

        const result = await resultServices.getResultById(result_id);

        if (result?.is_published) {
            return createErrorResponse(res, { message: "Result is already published" }, 400)
        }
        const retVal = await resultServices.updateResult(result_id, resultPayload);

        return sendSuccessResponse(res, 'Result updated successfully', { data: retVal });
    } catch (error) {
        next(error);
    }
}

export async function updatePublishStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            result_id,
            is_published
        } = req.body;


        const payload = {
            is_published
        };

        const retVal = await resultServices.publishResult(result_id, payload);

        return sendSuccessResponse(res, 'Result publish status updated successfully', { data: retVal });
    } catch (error) {
        next(error);
    }
}


export async function deleteResult(req: Request, res: Response, next: NextFunction) {
    try {
        const result_id = req.query.id as string;

        if (!result_id) {
            return createErrorResponse(res, { message: 'ID is required' }, 400);
        }

        await resultServices.deleteResult(result_id);

        return sendSuccessResponse(res, 'Result deleted successfully');
    } catch (error) {
        next(error);
    }
}

export async function getResults(req: Request, res: Response, next: NextFunction) {
    try {
        const search = (req.query.search as string) || '';
        const event_id = (req.query.event_id as string) || '';
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const page = parseInt((req.query.page as string) || '1', 10);

        const { data, count } = await resultServices.getResults({ search, page, limit, event_id });
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Results fetched successfully', {
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

export async function getResultById(req: Request, res: Response, next: NextFunction) {
    try {
        const result_id = req.query.id as string;

        if (!result_id) {
            return createErrorResponse(res, { message: 'Result ID is required' }, 400);
        }

        const result = await resultServices.getResultById(result_id);

        if (!result) {
            return createErrorResponse(res, { message: 'Result not found' }, 404);
        }

        return sendSuccessResponse(res, 'Result details fetched successfully', { data: result });
    } catch (error) {
        next(error);
    }
}
