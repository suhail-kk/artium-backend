import { NextFunction, Request, Response } from 'express';

import eventService from '@/lib/services/event.service';
import { createErrorResponse } from '@/lib/utils/apiResponse';
import attendanceServices from '@/lib/services/attendance.service';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import applicantService from '@/lib/services/applicant.service';

export async function markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            event_id,
            attendees,
            absentees
        } = req.body;


        const attendancePayload = {
            event_id,
            attendees,
            absentees
        };

        const isAleadyCreated = await attendanceServices.isAttendanceExist(attendancePayload)

        if (isAleadyCreated) {
            return createErrorResponse(res, { message: "Already marked the attendance" }, 400);
        }

        const event = await eventService.getEventById(event_id);

        if (!(event?.status === "Started")) {
            return createErrorResponse(res, { message: "Event is not started, cancelled or already completed" }, 400)
        }

        const isValid = await applicantService.isValidApplicants(attendancePayload)


        if (isValid.invalidAttendees.length > 0 || isValid.invalidAbsentees.length > 0) {
            return createErrorResponse(res, {
                message: "Some attendees or absentees are not registered applicants for this event",
            }, 400);
        }

        const retVal = await attendanceServices.createAttendance(attendancePayload);

        return sendSuccessResponse(res, 'Attendance marked successfully', { data: retVal });
    } catch (error) {
        next(error);
    }
}

export async function updateAttendance(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            event_id,
            attendees,
            absentees,
            attendance_id,
        } = req.body;


        const attendancePayload = {
            attendees,
            absentees
        };

        const event = await eventService.getEventById(event_id);

        if (!(event?.status === "Completed")) {
            return createErrorResponse(res, { message: "Event is already completed" }, 400)
        }
        const retVal = await attendanceServices.updateAttendance(attendance_id, attendancePayload);

        return sendSuccessResponse(res, 'Attendance marked successfully', { data: retVal });
    } catch (error) {
        next(error);
    }
}

export async function deleteAttendance(req: Request, res: Response, next: NextFunction) {
    try {
        const attendance_id = req.query.id as string;

        if (!attendance_id) {
            return createErrorResponse(res, { message: 'Attendance ID is required' }, 400);
        }

        await attendanceServices.deleteAttendance(attendance_id);

        return sendSuccessResponse(res, 'Attendance deleted successfully');
    } catch (error) {
        next(error);
    }
}

export async function getAttendances(req: Request, res: Response, next: NextFunction) {
    try {
        const search = (req.query.search as string) || '';
        const event_id = (req.query.event_id as string) || '';
        const limit = parseInt((req.query.limit as string) || '10', 10);
        const page = parseInt((req.query.page as string) || '1', 10);

        const { data, count } = await attendanceServices.getAttendances({ search, page, limit, event_id });
        const totalPages = Math.ceil(count / limit);

        return sendSuccessResponse(res, 'Attendances fetched successfully', {
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

export async function getAttendanceById(req: Request, res: Response, next: NextFunction) {
    try {
        const attendance_id = req.query.id as string;

        if (!attendance_id) {
            return createErrorResponse(res, { message: 'Attendance ID is required' }, 400);
        }

        const attendance = await attendanceServices.getAttendanceById(attendance_id);

        if (!attendance) {
            return createErrorResponse(res, { message: 'Attendance not found' }, 404);
        }

        return sendSuccessResponse(res, 'Attendance details fetched successfully', { data: attendance });
    } catch (error) {
        next(error);
    }
}
