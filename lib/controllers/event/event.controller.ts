import { NextFunction, Request, Response } from 'express';

import userServices from '@/lib/services/auth.services';
import eventServices from '@/lib/services/event.service';
import stageService from '@/lib/services/stage.service';
import programService from '@/lib/services/program.service';
import { createErrorResponse } from '@/lib/utils/apiResponse';
import eventTypeService from '@/lib/services/eventType.service';
import invigilatorService from '@/lib/services/invigilator.service';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';

export async function createEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            name,
            type,
            stage,
            date,
            time,
            image,
            rules,
            program,
            ideal_for,
            invigilator,
            is_published,
            maxium_num_participants,
        } = req.body;


        if (!name || !type) {
            return createErrorResponse(res, { message: 'Name and type are required' }, 400);
        }

        const isAlreadyExist = await eventServices.checkExist({
            name,
            ideal_for,
            program
        })

        if (isAlreadyExist) {
            return createErrorResponse(res, { message: 'Event Already exist' }, 400);
        }

        const isValidProgram = await programService.isProgramExistById(program)

        if (!isValidProgram) {
            return createErrorResponse(res, { message: 'Program not found' }, 400);
        }

        const isValidStage = await stageService.isStageExistById(stage)

        if (!isValidStage) {
            return createErrorResponse(res, { message: 'Stage not found' }, 400);
        }
        const isValidType = await eventTypeService.isExistById(type)

        if (!isValidType) {
            return createErrorResponse(res, { message: 'Event category not found' }, 400);
        }

        const isValidInvigilator = await userServices.isExistById(invigilator)

        if (!isValidInvigilator) {
            return createErrorResponse(res, { message: 'Invigilator not found' }, 400);
        }

        const eventPayload = {
            name,
            type,
            stage,
            date,
            time,
            image,
            rules,
            program,
            ideal_for,
            invigilator,
            is_published,
            maxium_num_participants,
        };

        const retVal = await eventServices.createEvent(eventPayload);

        return sendSuccessResponse(res, 'Event created successfully', { data: retVal });
    } catch (error) {
        next(error); // Pass error to middleware
    }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            name,
            type,
            stage,
            date,
            time,
            image,
            rules,
            program,
            event_id,
            ideal_for,
            invigilator,
            is_published,
            maxium_num_participants,
        } = req.body;

        const eventPayload = {
            name,
            type,
            stage,
            date,
            time,
            image,
            rules,
            program,
            ideal_for,
            invigilator,
            is_published,
            maxium_num_participants,
        };

        const isValidProgram = await programService.isProgramExistById(program)

        if (!isValidProgram) {
            return createErrorResponse(res, { message: 'Program not found' }, 400);
        }

        const isValidStage = await stageService.isStageExistById(stage)

        if (!isValidStage) {
            return createErrorResponse(res, { message: 'Stage not found' }, 400);
        }
        const isValidType = await eventTypeService.isExistById(type)

        if (!isValidType) {
            return createErrorResponse(res, { message: 'Event category not found' }, 400);
        }

        const isValidInvigilator = await invigilatorService.getInvigilatorById(invigilator)

        if (!isValidInvigilator) {
            return createErrorResponse(res, { message: 'Invigilator not found' }, 400);
        }
        const updatedEvent = await eventServices.updateEvent(event_id, eventPayload);

        return sendSuccessResponse(res, 'Event updated successfully', { data: updatedEvent });
    } catch (error) {
        next(error);
    }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = req.query.id as string;

        if (!event_id) {
            return createErrorResponse(res, { message: 'Event ID is required' }, 400);
        }

        await eventServices.deleteEvent(event_id);

        return sendSuccessResponse(res, 'Event deleted successfully');
    } catch (error) {
        next(error);
    }
}

export async function getEvents(req: Request, res: Response, next: NextFunction) {
    try {
        const search = (req.query.search as string) || '';
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const page = parseInt((req.query.page as string) || '1', 10);

        const { data, count } = await eventServices.getEvents(search, page, limit);
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Events fetched successfully', {
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

export async function getEventById(req: Request, res: Response, next: NextFunction) {
    try {
        const event_id = req.query.id as string;

        if (!event_id) {
            return createErrorResponse(res, { message: 'Event ID is required' }, 400);
        }

        const event = await eventServices.getEventById(event_id);

        if (!event) {
            return createErrorResponse(res, { message: 'Event not found' }, 404);
        }

        return sendSuccessResponse(res, 'Event details fetched successfully', { data: event });
    } catch (error) {
        next(error);
    }
}

export async function publishEvent(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            event_id,
            is_published,
        } = req.body;

        if (!event_id) {
            return createErrorResponse(res, { message: 'Event ID is required' }, 400);
        }

        const event = await eventServices.getEventById(event_id)

        if (!event) {
            return createErrorResponse(res, { message: "Event not found" }, 400)
        }

        const response = await eventServices.updatePulishStatus(event_id, { is_published });

        return sendSuccessResponse(res, 'Event publish status changed successfully', { data: response });
    } catch (error) {
        next(error);
    }
}