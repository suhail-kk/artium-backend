import stageServices from '@/lib/services/stage.service';
import { NextFunction, Request, Response } from 'express';
import { createErrorResponse } from '@/lib/utils/apiResponse';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import { BadRequestError } from '@/lib/utils/errors/errors';

export async function createStage(req: Request, res: Response, next: NextFunction) {
    try {
        const { url, name, image, location } = req.body;

        const stagePayload = { url, name, image, location };

        // Check if the stage already exists
        const existingStage = await stageServices.isStageExist(name);

        if (existingStage) {
            throw new BadRequestError('Stage with this name already exists');
        }

        // Create a new stage
        const newStage = await stageServices.createStage(stagePayload);

        return sendSuccessResponse(res, "Stage created successfully", { data: newStage });
    } catch (error) {
        next(error); // Pass error to middleware
    }
}


export async function updateStage(req: Request, res: Response, next: NextFunction) {
    try {
        const { stage_id, ...updatePayload } = req.body;

        if (!stage_id) {
            return createErrorResponse(res, { message: 'Stage ID is required' }, 400);
        }

        const existingStage = await stageServices.getStageById(stage_id);

        if (!existingStage) {
            return createErrorResponse(res, { message: 'Stage not found' }, 404);
        }

        const updatedStage = await stageServices.updateStage(stage_id, updatePayload);

        return sendSuccessResponse(res, 'Stage updated successfully', { data: updatedStage });
    } catch (error) {
        next(error);
    }
}

export async function deleteStage(req: Request, res: Response, next: NextFunction) {
    try {
        const stage_id = req.query.id as string;

        if (!stage_id) {
            return createErrorResponse(res, { message: 'Stage ID is required' }, 400);
        }

        await stageServices.deleteStage(stage_id);

        return sendSuccessResponse(res, 'Stage deleted successfully');
    } catch (error) {
        next(error);
    }
}

export async function getStages(req: Request, res: Response, next: NextFunction) {
    try {
        const search = (req.query.search as string) || '';
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const page = parseInt((req.query.page as string) || '1', 10);

        const { data, count } = await stageServices.getStages(search, page, limit);
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Stages fetched successfully', {
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

export async function getStageById(req: Request, res: Response, next: NextFunction) {
    try {
        const stage_id = req.query.id as string;

        if (!stage_id) {
            return createErrorResponse(res, { message: 'Stage ID is required' }, 400);
        }

        const stage = await stageServices.getStageById(stage_id);

        if (!stage) {
            return createErrorResponse(res, { message: 'Stage not found' }, 404);
        }

        return sendSuccessResponse(res, 'Stage details fetched successfully', { data: stage });
    } catch (error) {
        next(error);
    }
}
