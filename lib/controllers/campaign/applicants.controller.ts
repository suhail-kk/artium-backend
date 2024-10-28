import { Types } from 'mongoose';
import { NextFunction, Request, Response } from 'express'

import { BadRequestError } from '@/lib/utils/errors/errors';
import { createErrorResponse } from '@/lib/utils/apiResponse'
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import applicantsServices from '@/lib/services/applicants.services';

export async function createApplicant(req: Request, res: Response,
    next: NextFunction) {
    try {
        const data = req.body
        const user = req.user

        const {
            campaign_id
        } = data

        const payload = {
            campaign_id,
            rating: 0,
            status: "s",
            user_id: new Types.ObjectId(user?._id),
        }

        const response = await applicantsServices.createApplicant(payload)

        return sendSuccessResponse(res, "Successfully applied for the campaign", {
            data: response
        });

    } catch (error) {
        return new BadRequestError('Failed to create campaign');
    }
}

export async function updateApplicant(req: any, res: any) {
    try {
        const user = req.user
        const body = await req.body

        const {
            status,
            rating,
            campaign_id,
        } = body

        const payload = {
            rating,
            status,
            campaign_id,
            user_id: new Types.ObjectId(user?._id),
        }

        const response = await applicantsServices.updateApplicant(campaign_id, payload)


        return sendSuccessResponse(res, "Applicant updated successfully", {
            data: response
        });

    } catch (error) {
        return new BadRequestError('Failed to update campaign details');
    }
}

export async function deleteApplicant(req: Request, res: Response) {
    try {
        const id = req.query.id as string

        if (!id || typeof id !== 'string') {
            return createErrorResponse({ message: 'ID is required and must be a string' }, 400);
        }

        const response = await applicantsServices.deleteApplicant(id)

        return sendSuccessResponse(res, "Applicant deleted successfully", response);
    } catch (error) {
        return new BadRequestError('Failed to delete a campaign');
    }
}

export async function getApplicants(req: Request, res: Response) {
    try {

        const search = req.query.search as string
        const campaign_id = req.query.campaign_id as string
        const limit = parseInt((req.query.limit as string) || '10')
        const page = parseInt((req.query.page as string) || '1')

        const { data, count } = await applicantsServices.getApplicants(
            search,
            campaign_id,
            page || 1,
            limit || 10
        )
        const totalPages = Math.ceil(count / limit)


        return sendSuccessResponse(res, "Applicant fetched successfully", {
            data: data,
            meta: {
                page: page,
                limit: limit,
                total: count,
                totalPages,
            }, status: 200
        });

    } catch (error) {
        return new BadRequestError('Failed to fetch campaigns');
    }
}
