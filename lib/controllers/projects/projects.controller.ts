import { NextFunction, Request, Response } from 'express'

import { v4 as uuidv4 } from 'uuid'

import { ObjectId } from 'mongodb';
import { s3PutURL } from '@/lib/utils/s3utils';
import { BadRequestError } from '@/lib/utils/errors/errors';
import { createErrorResponse } from '@/lib/utils/apiResponse'
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import projectsServices from '@/lib/services/projects.services';

export async function createProjects(req: Request, res: Response,
    next: NextFunction) {
    try {
        const data = req.body
        const user = req.user
        const { files, type } = data

        if (!Array.isArray(files)) {
            return next(new BadRequestError("Files should be an array."));
        }

        const count = await projectsServices.ProjectsCount(type)

        if (type === 'featured' && count + files?.length > 4) {
            return next(new BadRequestError("Can't able to upload more than 3 projects"));
        }
        let urls: string[] = []
        const payload = files?.map((project: {
            name: string,
            size: number,
            type: string
        }) => {
            const UUID = uuidv4()
            const image_key = `additional_projects/${UUID}${project?.name}`
            const presigned_url = s3PutURL(
                image_key
            );
            urls.push(presigned_url)
            return (
                {
                    type,
                    url: image_key,
                    user_id: new ObjectId(user._id),
                    title: `${user?.firstName}'s  projects`,
                }
            )
        })
        const retVal = await projectsServices.bulkInsertProject(payload)
        return sendSuccessResponse(res, " projects added successfully", {
            data: retVal,
            urls
        });
    } catch (error) {
        return new BadRequestError('Failed to create campaign');
    }
}

export async function deleteProject(req: Request, res: Response) {
    try {
        const id = req.query.id as string

        if (!id || typeof id !== 'string') {
            return createErrorResponse({ message: 'ID is required and must be a string' }, 400);
        }

        const response = await projectsServices.deleteProject(id)

        return sendSuccessResponse(res, "Project deleted successfully", response);
    } catch (error) {
        return new BadRequestError('Failed to delete this project');
    }
}

export async function getProjects(req: Request, res: Response) {
    try {
        const profile_id = req.user?._id as string
        const guest_user_id = req.query?.user_id as string
        const type = (req.query.type as string) || 'additional';
        const limit = parseInt((req.query.limit as string) || '10')
        const page = parseInt((req.query.page as string) || '1')

        const { data, count } = await projectsServices.getprojects(
            {
                type,
                page: page || 1,
                limit: limit || 10,
                user_id: guest_user_id ? guest_user_id : profile_id,
            }
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
