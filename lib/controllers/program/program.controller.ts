import programServices from '@/lib/services/program.service';
import { NextFunction, Request, Response } from 'express';
import { createErrorResponse } from '@/lib/utils/apiResponse';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';

export async function createProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            image,
            notes,
            to_date,
            location,
            dead_line,
            from_date,
            program_type,
            organized_by,
            program_name,
            contact_info,
            is_published,
            registration_status,
        } = req.body;

        const isAlreadyExist = await programServices.isProgramExist(program_name)
        if (isAlreadyExist) {
            return createErrorResponse(res, { message: 'Program already exist with this name' }, 400);
        }

        const programPayload = {
            image,
            notes,
            to_date,
            location,
            dead_line,
            from_date,
            program_type,
            organized_by,
            program_name,
            contact_info,
            is_published,
            registration_status,
        };

        const retVal = await programServices.createProgram(programPayload);

        return sendSuccessResponse(res, 'Program created successfully', { data: retVal });
    } catch (error) {
        next(error);
    }
}

export async function updateProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const { program_id, ...updatePayload } = req.body;

        if (!program_id) {
            return createErrorResponse(res, { message: 'Program ID is required' }, 400);
        }

        const existingProgram = await programServices.getProgramById(program_id);

        if (!existingProgram) {
            return createErrorResponse(res, { message: 'Program not found' }, 404);
        }

        const updatedProgram = await programServices.updateProgram(program_id, updatePayload);

        return sendSuccessResponse(res, 'Program updated successfully', { data: updatedProgram });
    } catch (error) {
        next(error);
    }
}

export async function lockProgramStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { program_id, registration_status } = req.body;

        if (!program_id) {
            return createErrorResponse(res, { message: 'Program ID is required' }, 400);
        }

        const existingProgram = await programServices.getProgramById(program_id);

        if (!existingProgram) {
            return createErrorResponse(res, { message: 'Program not found' }, 404);
        }

        if (!existingProgram?.is_published) {
            return createErrorResponse(res, { message: 'Program not published yet' }, 404);
        }

        const updatedProgram = await programServices.updateProgramStatus(program_id, { registration_status });

        return sendSuccessResponse(res, 'Program status updated successfully', { data: updatedProgram });
    } catch (error) {
        next(error);
    }
}

export async function deleteProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const program_id = req.query.id as string;

        if (!program_id) {
            return createErrorResponse(res, { message: 'Program ID is required' }, 400);
        }

        await programServices.deleteProgram(program_id);

        return sendSuccessResponse(res, 'Program deleted successfully');
    } catch (error) {
        next(error);
    }
}

export async function getPrograms(req: Request, res: Response, next: NextFunction) {
    try {
        const search = (req.query.search as string) || '';
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const page = parseInt((req.query.page as string) || '1', 10);

        const { data, count } = await programServices.getPrograms(search, page, limit);
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Programs fetched successfully', {
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

export async function getProgramById(req: Request, res: Response, next: NextFunction) {
    try {
        const program_id = req.query.id as string;

        if (!program_id) {
            return createErrorResponse(res, { message: 'Program ID is required' }, 400);
        }

        const program = await programServices.getProgramById(program_id);

        if (!program) {
            return createErrorResponse(res, { message: 'Program not found' }, 404);
        }

        return sendSuccessResponse(res, 'Program details fetched successfully', { data: program });
    } catch (error) {
        next(error);
    }
}
