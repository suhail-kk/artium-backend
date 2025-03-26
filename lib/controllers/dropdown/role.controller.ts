import { Request, Response } from "express";
import Role from "@/lib/services/role.service"
import { createErrorResponse, createResponse } from "@/lib/utils/apiResponse";

export async function getRole(req: Request, res: Response) {
    try {
        const retVal = await Role.getAll()
        return createResponse(res, { data: retVal, status: 200 });
    } catch (error) {
        return createErrorResponse(res, error)
    }
}
