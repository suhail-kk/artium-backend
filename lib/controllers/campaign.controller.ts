
import productServices from '@/lib/services/product.services'
import campaignServices from '@/lib/services/campaign.services'
import {createResponse, createErrorResponse } from '@/lib/utils/apiResponse'
import { NextFunction, Request, Response } from 'express'

export async function createCampaign(req: Request,  res: Response,
    next: NextFunction) {
    try {
        const body = await req.body

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
            product_image_key,
            product_description,
            video_types,
            brand_id,
            user_id,
            number_of_creators,
            min_price,
            max_price,
            video_script,
        } = body

        const productPayload = {
            brand_id,
            product_title,
            product_image_key,
            product_url,
            product_description,
        }

        const product = await productServices.createProduct(productPayload)

        const campaignPayload = {
            user_id,
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
        }
        const retVal = await campaignServices.createCampaign(campaignPayload)

        return  createResponse(res, { data: retVal, status: 200 });

    } catch (error) {
        return createErrorResponse(res, error);
    }
}

export async function updateCampaign(req: Request,res:Response) {
    try {
        const body = await req.body

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
            product_image_key,
            product_description,
            video_types,
            brand_id,
            user_id,
            product_id,
            campaign_id,
            campaign_status,
            number_of_creators,
            min_price,
            max_price,
            video_script,
        } = body

        const productPayload = {
            brand_id,
            product_title,
            product_image_key,
            product_url,
            product_description,
        }

        await productServices.updateProduct(product_id, productPayload)

        const campaignPayload = {
            user_id,
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
        }
        const campaign = await campaignServices.updateCampaign(
            campaign_id,
            campaignPayload
        )

        return  createResponse(res, { data: {data:campaign}, status: 200 });

    } catch (error) {
        return createErrorResponse(res, error);
}
}

export async function deleteCampaign(req: Request,res:Response) {
    try {
        const id = req.query.id as string

        if (!id || typeof id !== 'string') {
            return createErrorResponse({ message: 'ID is required and must be a string' }, 400);
        }

        const response = await campaignServices.deleteCampaign(id)

        return  createResponse(res, { data: response, status: 200 });
    } catch (error) {
        return createErrorResponse(res, error);
    }
}

export async function getCampaigns(req: Request,res:Response) {
    try {
    
        const search = req.query.search as string
        const limit = parseInt((req.query.limit as string) || '10')
        const page = parseInt((req.query.page as string) || '1')

        const { data, count } = await campaignServices.getCampaigns(
            search,
            page || 1,
            limit || 10
        )
        const totalPages = Math.ceil(count / limit)

        return  createResponse(res, { data: data,
            meta: {
                page: page,
                limit: limit,
                total: count,
                totalPages,
            }, status: 200 })

    } catch (error) {
        return createErrorResponse(res, error);
    }
}

export async function getCampaignById(req: Request,res:Response) {
    try {
        const campaign_id = req.query.id as string

        if (!campaign_id) {
            throw new Error('Campaign ID is required')
        }

        const retVal = await campaignServices.getCampaignById(campaign_id)

        return  createResponse(res, { data: retVal, status: 200 });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        return createErrorResponse(res, error);
    }
}
