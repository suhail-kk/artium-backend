import { NextFunction, Request, Response } from 'express';

import userServices from '@/lib/services/auth.services';
import { createErrorResponse } from '@/lib/utils/apiResponse';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import programRegistrationServices from '@/lib/services/programRegistration.service';
import { Types } from 'mongoose';

export async function registerForProgram(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            program_id,
            user_id
        } = req.body;

        const user = req.user

        const userRole = await userServices.getUserRoleFromEmailAndId({ email: user?.email, _id: new Types.ObjectId(user?._id) })

        if (!(userRole?.name === "Student")) {
            return createErrorResponse(res, { message: "You don't have permission to register for this program" }, 400);
        }
        const programRegistrationPayload = {
            program_id,
            user_id
        };

        const isAleadyCreated = await programRegistrationServices.isProgramRegitrationExist(programRegistrationPayload)

        if (isAleadyCreated) {
            return createErrorResponse(res, { message: "You're already registered for this program" }, 400);
        }

        const retVal = await programRegistrationServices.registerProgram(programRegistrationPayload);

        return sendSuccessResponse(res, 'Applied successfully', { data: retVal });
    } catch (error) {
        next(error);
    }
}

export async function deleteProgramRegistration(req: Request, res: Response, next: NextFunction) {
    try {
        const programRegistration_id = req.query.id as string;

        if (!programRegistration_id) {
            return createErrorResponse(res, { message: 'Registration ID is required' }, 400);
        }

        await programRegistrationServices.deleteProgramRegistration(programRegistration_id);

        return sendSuccessResponse(res, 'Registration withdrawn successfully');
    } catch (error) {
        next(error);
    }
}

export async function getRegisteredUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const search = (req.query.search as string) || '';
        const program_id = (req.query.program_id as string) || '';
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const page = parseInt((req.query.page as string) || '1', 10);

        const { data, count } = await programRegistrationServices.getProgramRegistrations({ search, page, limit, program_id });
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'ProgramRegistrations fetched successfully', {
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

export async function getProgramRegistrationById(req: Request, res: Response, next: NextFunction) {
    try {
        const programRegistration_id = req.query.id as string;

        if (!programRegistration_id) {
            return createErrorResponse(res, { message: 'ProgramRegistration ID is required' }, 400);
        }

        const programRegistration = await programRegistrationServices.getProgramRegistrationById(programRegistration_id);

        if (!programRegistration) {
            return createErrorResponse(res, { message: 'ProgramRegistration not found' }, 404);
        }

        return sendSuccessResponse(res, 'ProgramRegistration details fetched successfully', { data: programRegistration });
    } catch (error) {
        next(error);
    }
}
