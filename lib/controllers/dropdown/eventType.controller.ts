import { Request, Response } from "express";
import EventType from "@/lib/services/eventType.service"
import { createErrorResponse, createResponse } from "@/lib/utils/apiResponse";

export async function getEventType(req: Request, res: Response) {
    try {
        const retVal = await EventType.getAll()
        return createResponse(res, { data: retVal, status: 200 });
    } catch (error) {
        return createErrorResponse(res, error)
    }
}
