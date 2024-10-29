
import { NextFunction, Request, Response } from 'express'

import { BadRequestError } from '@/lib/utils/errors/errors'
import creatorsServices from "@/lib/services/creators.services"
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler'
import { getUserProifleById } from '@/lib/services/user.services'


export async function getCreators(req: Request, res: Response, next: NextFunction) {
    try {

        const userId = req?.user?._id
        const search = req.query.search as string || ''
        const gender = req.query.gender as string || ''
        const country = req.query.country as string || ''
        const languages = req.query.languages as string || ''
        const max_age: any = req.query.max_age
        const min_age: any = req.query.min_age
        const page = parseInt((req.query.page as string) || '1')
        const limit = parseInt((req.query.limit as string) || '10')

        const { data, count } = await creatorsServices.getCreators({
            search,
            page,
            limit,
            country,
            gender,
            languages,
            min_age,
            max_age,
            userId
        }
        )
        const totalPages = Math.ceil(count / limit)

        return sendSuccessResponse(res, "Creators fetched successfully", {
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

export async function saveCreator(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.body
        const { _id: userId } = req.user

        const user = getUserProifleById(userId)
        if (!user) {
            new BadRequestError('User not found');
        }

        const response = await creatorsServices.saveACreator(id, userId)

        return sendSuccessResponse(res, "Creator saved successfully", {
            data: response,
            status: 200
        });

    } catch (error) {
        return new BadRequestError('Failed to fetch campaigns');
    }
}

export async function RemoveASavedCreator(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.body
        const { _id: userId } = req.user

        const user = getUserProifleById(userId)
        if (!user) {
            new BadRequestError('User not found');
        }

        const response = await creatorsServices.removeASavedCreator(id, userId)

        return sendSuccessResponse(res, "Creator removed from saved list successfully", {
            data: response,
            status: 200
        });

    } catch (error) {
        return new BadRequestError('Failed to fetch campaigns');
    }
}
