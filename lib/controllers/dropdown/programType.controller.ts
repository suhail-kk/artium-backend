import { Request, Response } from "express";
import ProgramType from '@/lib/services/programType.service';
import { createErrorResponse, createResponse } from "@/lib/utils/apiResponse";

export async function getProgramTypes(req: Request, res: Response) {
    try {
        const retVal = await ProgramType.getAll()
        return createResponse(res, { data: retVal, status: 200 });
    } catch (error) {
        return createErrorResponse(res, error)
    }
}
