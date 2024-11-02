import { NextFunction, Request, Response } from 'express'

import { Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'

import { BadRequestError } from '@/lib/utils/errors/errors';
import { createErrorResponse } from '@/lib/utils/apiResponse'
import productServices from '@/lib/services/product.services'
import campaignServices from '@/lib/services/campaign.services'
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import { s3DeleteURL, s3PutURL } from '@/lib/utils/s3utils';

export async function createCampaign(req: Request, res: Response,
    next: NextFunction) {
    try {
        const data = req.body
        const userId = new Types.ObjectId(req.user._id);

        // const images: any = req.files || {};
        // const logo_image = images?.logo_image ? images.logo_image[0] : null;
        // const product_image = images?.product_image ? images.product_image[0] : null;

        const logoUUID = uuidv4()
        const producutUUID = uuidv4()
        const logo_image_key = `logo_images/${logoUUID}${data?.logo_image}`
        const product_image_key = `product_images/${producutUUID}${data?.product_image}`

        // if (logo_image) {
        //     const logoUUID = uuidv4()
        //     logo_image_key = `logo_images/${logoUUID}${logo_image?.filename}`
        //     //upload original file in to s3
        //     const fileUploadRes = await uploadFile({ source: logo_image.path, targetName: logo_image_key })
        //     if (!fileUploadRes)
        //         return new BadRequestError('Failed to upload logo image file');
        // }

        // if (product_image) {
        //     const producutUUID = uuidv4()
        //     product_image_key = `product_images/${producutUUID}${product_image?.filename}`
        //     //upload original file in to s3
        //     const fileUploadRes = await uploadFile({ source: product_image.path, targetName: product_image_key })

        //     if (!fileUploadRes)
        //         return new BadRequestError('Failed to upload product file');
        // }


        const {
            campaign_title,
            campaign_description,
            end_date,
            start_date,
            delivery_type,
            video_duration,
            reference_link,
            video_notes,
            product_url,
            product_title,
            product_description,
            video_types,
            brand_id,
            number_of_creators,
            min_price,
            max_price,
            video_script,
        } = data

        const productPayload = {
            brand_id,
            product_title,
            product_image_key,
            product_url,
            product_description,
            user_id: userId
        }

        const product = await productServices.createProduct(productPayload)

        const campaignPayload = {
            user_id: userId,
            brand_id,
            end_date,
            start_date,
            video_types,
            delivery_type,
            campaign_title,
            video_duration,
            video_notes,
            reference_link,
            campaign_description,
            product_id: product?._id,
            campaign_status: 'Ongoing',
            number_of_creators,
            min_price,
            max_price,
            video_script,
            logo_image_key,
        }
        const retVal = await campaignServices.createCampaign(campaignPayload)

        // const presigned_url_logo_image = s3GetURL(logo_image_key);
        // const presigned_url_product_image = s3GetURL(product_image_key);

        const presigned_url_logo_image = s3PutURL(
            logo_image_key
        );
        const presigned_url_product_image = s3PutURL(
            product_image_key
        );

        return sendSuccessResponse(res, "Campaign created successfully", {
            data: retVal,
            presigned_url_logo_image,
            presigned_url_product_image
        });

    } catch (error) {
        return new BadRequestError('Failed to create campaign');
    }
}

export async function updateCampaign(req: any, res: any) {
    try {
        const data = await req.body
        const userId = new Types.ObjectId(req.user._id);

        const {
            campaign_id,
            product_id,
            campaign_title,
            campaign_description,
            end_date,
            start_date,
            delivery_type,
            video_duration,
            reference_link,
            video_notes,
            product_url,
            product_title,
            product_description,
            video_types,
            brand_id,
            number_of_creators,
            min_price,
            max_price,
            video_script,
            logo_image,
            product_image,
            campaign_status
        } = data

        const retVal = await campaignServices.getCampaignById(campaign_id);

        let logo_image_key
        let product_image_key
        let presigned_url_logo_image
        let presigned_url_product_image
        if (data?.logo_image) {
            const logoUUID = uuidv4()
            logo_image_key = `logo_images/${logoUUID}${logo_image}`
            await s3DeleteURL(retVal?.logo_image_key)

            presigned_url_logo_image = s3PutURL(
                logo_image_key
            );

        }

        if (data?.product_image) {
            const producutUUID = uuidv4()
            product_image_key = `product_images/${producutUUID}${product_image}`

            await s3DeleteURL(retVal?.product_details?.product_image_key)

            presigned_url_product_image = s3PutURL(
                product_image_key
            );
        }


        const productPayload = {
            brand_id,
            product_title,
            product_image_key,
            product_url,
            product_description,
            user_id: userId
        }

        await productServices.updateProduct(product_id, productPayload)

        const campaignPayload = {
            user_id: userId,
            brand_id,
            end_date,
            start_date,
            video_types,
            delivery_type,
            campaign_title,
            video_duration,
            video_notes,
            reference_link,
            campaign_description,
            product_id: product_id,
            campaign_status,
            number_of_creators,
            min_price,
            max_price,
            video_script,
            logo_image_key,
        }
        const campaign = await campaignServices.updateCampaign(
            campaign_id,
            campaignPayload
        )

        return sendSuccessResponse(res, "Campaign updated successfully", {
            data: campaign,
            presigned_url_logo_image,
            presigned_url_product_image
        });

    } catch (error) {
        return new BadRequestError('Failed to update campaign details');
    }
}

export async function deleteCampaign(req: Request, res: Response) {
    try {
        const id = req.query.id as string

        if (!id || typeof id !== 'string') {
            return createErrorResponse({ message: 'ID is required and must be a string' }, 400);
        }

        const response = await campaignServices.deleteCampaign(id)

        return sendSuccessResponse(res, "Campaign deleted successfully", response);
    } catch (error) {
        return new BadRequestError('Failed to delete a campaign');
    }
}

export async function getCampaigns(req: Request, res: Response) {
    try {

        const search = req.query.search as string || ''
        const limit = parseInt((req.query.limit as string) || '10')
        const page = parseInt((req.query.page as string) || '1')

        const { data, count } = await campaignServices.getCampaigns(
            search,
            page || 1,
            limit || 10
        )
        const totalPages = Math.ceil(count / limit)

        return sendSuccessResponse(res, "Campaign fetched successfully", {
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

export async function getCampaignById(req: Request, res: Response) {
    try {
        const campaign_id = req.query.id as string

        if (!campaign_id) {
            throw new Error('Campaign ID is required')
        }

        const retVal = await campaignServices.getCampaignById(campaign_id)

        return sendSuccessResponse(res, "Campaign details fetched successfully", retVal);
    } catch (error) {
        return new BadRequestError('Failed to fetch campaign details');
    }
}
