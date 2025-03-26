import userServices from '@/lib/services/auth.services';
import { NextFunction, Request, Response } from 'express';

import { createErrorResponse } from '@/lib/utils/apiResponse';
import invigilatorServices from '@/lib/services/invigilator.service';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import { IUpdateInvigilatorStatus } from '@/lib/types/invigilator.interface';
import requestServices from '@/lib/services/request.services';
import { IUpdateEventStatus } from '@/lib/types/event.interface';
import eventService from '@/lib/services/event.service';


export async function inviteInvigilator(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            user_id,
        } = req.body;

        const user = req.user

        const isValidUser = await userServices.isExistById(user_id)

        if (!isValidUser) {
            return createErrorResponse(res, { message: 'User not found' }, 400);
        }

        const isValidSender = await userServices.isExistById(user?._id)

        if (!isValidSender) {
            return createErrorResponse(res, { message: 'Invalid sender' }, 400);
        }

        if (user_id == user?._id) {
            return createErrorResponse(res, { message: 'Sender and reciever should not be same' }, 400);
        }

        const requestPayload = {
            recipient: user_id,
            sender: user?._id,
            data: {
                user_id
            },
            type: "invite_as_an_invigilator"
        };

        const retVal = await requestServices.createRequest(requestPayload);

        return sendSuccessResponse(res, 'Request send successfully', retVal);
    } catch (error) {
        next(error);
    }
}

export async function changeInviteStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            action,
            user_id,
            invite_id,
        } = req.body;

        if (action === "accept") {
            const isAlreadyExist = await invigilatorServices.checkExist(user_id)

            if (isAlreadyExist) {
                return createErrorResponse(res, { message: 'Invigilator Already exist' }, 400);
            }
        }

        const isValidUser = await userServices.isExistById(user_id)

        if (!isValidUser) {
            return createErrorResponse(res, { message: 'User not found' }, 400);
        }

        let retVal
        if (action === "accept") {
            const invigilatorPayload = {
                user_id,
                is_approved: true
            };
            retVal = await invigilatorServices.createInvigilator(invigilatorPayload);
        }
        const deleteRes = await requestServices.deleteRequest(invite_id);
        return sendSuccessResponse(res, action === "accept" ? 'Invigilator created successfully' : "Request deleted successfully", retVal || deleteRes);
    } catch (error) {
        next(error);
    }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            id,
            is_approved
        } = req.body;

        const invigilatorPayload: IUpdateInvigilatorStatus = {
            is_approved
        };
        const updatedInvigilator = await invigilatorServices.updateInvigilator(id, invigilatorPayload);

        return sendSuccessResponse(res, 'Invigilator updated successfully', { data: updatedInvigilator });
    } catch (error) {
        next(error);
    }
}


export async function updateInvigilator(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            id,
            user_id,
            assigned_events
        } = req.body;

        const invigilatorPayload = {
            user_id,
            assigned_events
        };
        const updatedInvigilator = await invigilatorServices.updateInvigilator(id, invigilatorPayload);

        return sendSuccessResponse(res, 'Invigilator updated successfully', { data: updatedInvigilator });
    } catch (error) {
        next(error);
    }
}

export async function deleteInvigilator(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.query.id as string;

        if (!id) {
            return createErrorResponse(res, { message: 'Invigilator ID is required' }, 400);
        }

        await invigilatorServices.deleteInvigilator(id);

        return sendSuccessResponse(res, 'Invigilator deleted successfully');
    } catch (error) {
        next(error);
    }
}

export async function getInvigilators(req: Request, res: Response, next: NextFunction) {
    try {
        const status = (req.query.status as string) || '';
        const search = (req.query.search as string) || '';
        const page = parseInt((req.query.page as string) || '1', 10);
        const limit = parseInt((req.query.limit as string) || '10', 10);

        const { data, count } = await invigilatorServices.getInvigilators({ search, page, limit, status });
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Invigilators fetched successfully', {
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

export async function getFacultiesNotInvited(req: Request, res: Response, next: NextFunction) {
    try {
        const search = (req.query.search as string) || '';
        const page = parseInt((req.query.page as string) || '1', 10);
        const limit = parseInt((req.query.limit as string) || '10', 10);

        const { data, count } = await invigilatorServices.getFacultiesNotInvited({ search, page, limit });
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Not invited faculties fetched successfully', {
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

export async function getInvigilatorById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.query.id as string;

        if (!id) {
            return createErrorResponse(res, { message: 'Invigilator ID is required' }, 400);
        }

        const invigilator = await invigilatorServices.getInvigilatorById(id);

        if (!invigilator) {
            return createErrorResponse(res, { message: 'Invigilator not found' }, 404);
        }

        return sendSuccessResponse(res, 'Invigilator details fetched successfully', { data: invigilator });
    } catch (error) {
        next(error);
    }
}

export async function updateEventStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            status,
            event_id,
        } = req.body;

        const event = await eventService.getEventById(event_id)

        if (!event) {
            return createErrorResponse(res, { message: "Event not found" }, 400)
        }

        if (!event?.is_published) {
            return createErrorResponse(res, { message: "Event not published yet" }, 400)
        }
        const invigilatorPayload: IUpdateEventStatus = {
            status
        };
        const updatedInvigilator = await eventService.updateEventStatus(event_id, invigilatorPayload);

        return sendSuccessResponse(res, 'Event status updated successfully', { data: updatedInvigilator });
    } catch (error) {
        next(error);
    }
}
