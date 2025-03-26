import { Request, Response } from "express";
import Gender from "@/lib/services/gender.service"
import { createErrorResponse, createResponse } from "@/lib/utils/apiResponse";

export async function getGender(req: Request, res: Response) {
    try {
        const retVal = await Gender.getAll()
        return createResponse(res, { data: retVal, status: 200 });
    } catch (error) {
        return createErrorResponse(res, error)
    }
}
