import userServices from '@/lib/services/auth.services';
import applicantServices from '@/lib/services/applicant.service';
import { NextFunction, Request, Response } from 'express';
import { createErrorResponse } from '@/lib/utils/apiResponse';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import { Types } from 'mongoose';
import programRegistrationServices from '@/lib/services/programRegistration.service';
import eventService from '@/lib/services/event.service';


export async function createApplicant(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            event_id,
            user_id
        } = req.body;

        const user = req.user

        const event = await eventService.getEventById(event_id)

        if (!event) {
            return createErrorResponse(res, { message: "Event not found" }, 400)
        }

        const isUserRegisteredForProgram = await programRegistrationServices.isProgramRegitrationExist({ program_id: event?.program, user_id: user?._id })

        if (!isUserRegisteredForProgram) {
            return createErrorResponse(res, { message: 'User not registered for this program' }, 400);
        }

        const userRole = await userServices.getUserRoleFromEmailAndId({ email: user?.email, _id: new Types.ObjectId(user?._id) })

        if (userRole?.name === "Faculty") {
            return createErrorResponse(res, { message: "You don't have permission to apply for this task" }, 400);
        }
        const applicantPayload = {
            event_id,
            user_id
        };

        const isAleadyCreated = await applicantServices.isApplicantExist(applicantPayload)

        if (isAleadyCreated) {
            return createErrorResponse(res, { message: "You're already applied for this event" }, 400);
        }

        const retVal = await applicantServices.createApplicant(applicantPayload);

        return sendSuccessResponse(res, 'Applied successfully', { data: retVal });
    } catch (error) {
        next(error);
    }
}

export async function deleteApplicant(req: Request, res: Response, next: NextFunction) {
    try {
        const applicant_id = req.query.id as string;

        if (!applicant_id) {
            return createErrorResponse(res, { message: 'Applicant ID is required' }, 400);
        }

        await applicantServices.deleteApplicant(applicant_id);

        return sendSuccessResponse(res, 'Applicant deleted successfully');
    } catch (error) {
        next(error);
    }
}

export async function getApplicants(req: Request, res: Response, next: NextFunction) {
    try {
        const search = (req.query.search as string) || '';
        const event_id = (req.query.event_id as string) || '';
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const page = parseInt((req.query.page as string) || '1', 10);

        const { data, count } = await applicantServices.getApplicants({ search, page, limit, event_id: new Types.ObjectId(event_id) });
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Applicants fetched successfully', {
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

export async function getApplicantById(req: Request, res: Response, next: NextFunction) {
    try {
        const applicant_id = req.query.id as string;

        if (!applicant_id) {
            return createErrorResponse(res, { message: 'Applicant ID is required' }, 400);
        }

        const applicant = await applicantServices.getApplicantById(applicant_id);

        if (!applicant) {
            return createErrorResponse(res, { message: 'Applicant not found' }, 404);
        }

        return sendSuccessResponse(res, 'Applicant details fetched successfully', { data: applicant });
    } catch (error) {
        next(error);
    }
}
