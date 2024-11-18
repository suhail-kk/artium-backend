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

        const existingApplicant = await applicantsServices.isExist(new Types.ObjectId(user?._id), new Types.ObjectId(campaign_id));
        if (existingApplicant) {
            return createErrorResponse(res, {
                message: "You're already applied for this campaign"
            });
        } else {
            const payload = {
                campaign_id,
                rating: 0,
                status: "",
                user_id: new Types.ObjectId(user?._id),
            }

            const response = await applicantsServices.createApplicant(payload)

            return sendSuccessResponse(res, "Successfully applied for the campaign", {
                data: response
            });
        }
    } catch (error) {
        return new BadRequestError('Failed to create campaign');
    }
}

export async function getApplicantStatus(req: Request, res: Response,
    next: NextFunction) {
    try {
        const user = req.user
        const campaign_id = req.query.campaign_id as string

        const existingApplicant = await applicantsServices.isExist(new Types.ObjectId(user?._id), new Types.ObjectId(campaign_id));

        return sendSuccessResponse(res, "Applicant status fetched successfully", {
            data: {
                status: existingApplicant ? true : false
            }
        });
    } catch (error) {
        return new BadRequestError('Failed to fetch applicant status');
    }
}


export async function updateApplicant(req: any, res: any) {
    try {
        const body = await req.body

        const {
            status,
            rating,
            campaign_id,
            application_id
        } = body

        const payload = {
            rating,
            status,
            campaign_id,
        }

        const response = await applicantsServices.updateApplicant(application_id, payload)


        return sendSuccessResponse(res, "Applicant updated successfully", {
            data: response
        });

    } catch (error) {
        return new BadRequestError('Failed to update campaign details');
    }
}

export async function updateApplicantsTrack(req: any, res: any) {
    try {
        const body = await req.body

        const {
            application_id,
            campaign_end_date,
        } = body

        const payload = {
            application_id,
            campaign_end_date,
        }

        const response = await applicantsServices.updateApplicantTracks(application_id, payload)


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
        const filter_by = req.query.filter_by as string
        const campaign_id = req.query.campaign_id as string
        const page = parseInt((req.query.page as string) || '1')
        const limit = parseInt((req.query.limit as string) || '10')

        if (!campaign_id) {
            return new BadRequestError('Campaign id is required');
        }

        const { data, count } = await applicantsServices.getApplicants(
            search,
            campaign_id,
            filter_by,
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
