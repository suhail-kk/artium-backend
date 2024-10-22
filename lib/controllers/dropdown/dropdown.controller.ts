import { Request, Response } from "express";
import creatorsCountServices from "@/lib/services/creatorsCount.services"
import { createErrorResponse, createResponse } from "@/lib/utils/apiResponse";
import deliveryTypeServices from "@/lib/services/deliveryType.services";
import videoTypeServices from "@/lib/services/videoType.services";

export async function getCreatorsCount(req: Request,res:Response) {
    try {
        const retVal = await creatorsCountServices.getAll()
        return  createResponse(res, { data: retVal, status: 200 });
    } catch (error) {
        return createErrorResponse(res,error)
    }
}

export async function getDeliveryTypes(req: Request,res:Response) {
    try {
        const retVal = await deliveryTypeServices.getAll()
        return  createResponse(res, { data: retVal, status: 200 });
    } catch (error) {
        return createErrorResponse(res,error)
    }
}

export async function getVideoTypes(req: Request,res:Response) {
    try {
        const retVal = await videoTypeServices.getAll()
        return  createResponse(res, { data: retVal, status: 200 });
    } catch (error) {
        return createErrorResponse(res,error)
    }
}