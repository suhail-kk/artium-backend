import { NextFunction, Request, Response } from 'express'

import { v4 as uuidv4 } from 'uuid'

import { ObjectId } from 'mongodb';
import { s3PutURL } from '@/lib/utils/s3utils';
import { BadRequestError } from '@/lib/utils/errors/errors';
import { createErrorResponse } from '@/lib/utils/apiResponse'
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import featuredProjectServices from '@/lib/services/featuredProject.services';

export async function createFeaturedProjects(req: Request, res: Response,
    next: NextFunction) {
    try {
        const data = req.body
        const user = req.user
        const { files } = data

        if (!Array.isArray(files)) {
            return next(new BadRequestError("Files should be an array."));
        }

        const count = await featuredProjectServices.featuredProjectCount()
        if (count + files?.length < 3) {
            let urls: string[] = []
            const payload = files?.map((project: string) => {
                const UUID = uuidv4()
                const image_key = `additional_projects/${UUID}${project}`
                const presigned_url = s3PutURL(
                    image_key
                );
                urls.push(presigned_url)
                return (
                    {
                        url: presigned_url,
                        user_id: new ObjectId(user._id),
                        title: `${user?.firstName}'s Featured projects`,
                    }
                )
            })

            const retVal = await featuredProjectServices.bulkInsertFeaturedProject(payload)
            return sendSuccessResponse(res, "Featured projects added successfully", {
                data: retVal,
                urls
            });
        } else {
            return next(new BadRequestError("Can't able to upload more than 3 projects"));
        }



    } catch (error) {
        return new BadRequestError('Failed to create campaign');
    }
}

export async function deleteFeaturedProject(req: Request, res: Response) {
    try {
        const id = req.query.id as string

        if (!id || typeof id !== 'string') {
            return createErrorResponse({ message: 'ID is required and must be a string' }, 400);
        }

        const response = await featuredProjectServices.deleteFeaturedProject(id)

        return sendSuccessResponse(res, "Project deleted successfully", response);
    } catch (error) {
        return new BadRequestError('Failed to delete this project');
    }
}

export async function getFeaturedProjects(req: Request, res: Response) {
    try {
        const limit = parseInt((req.query.limit as string) || '10')
        const page = parseInt((req.query.page as string) || '1')

        const { data, count } = await featuredProjectServices.getFeaturedProjects(
            page || 1,
            limit || 10
        )
        const totalPages = Math.ceil(count / limit)


        return sendSuccessResponse(res, "Projects fetched successfully", {
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
