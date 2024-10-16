import Campaign from '@/lib/schemas/campaign'
import { ICampaign } from '@/lib/types/campaign.interface'
import schemaNameConstants from '@/lib/constants/schemaConstants'
import mongoose from 'mongoose'

const createCampaign = async (data: ICampaign) => {
    const res = await Campaign.create(data)
    return res
}

const updateCampaign = async (id: string, data: ICampaign) => {
    const res = await Campaign.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const getCampaignById = async (id: string) => {
    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id), // Ensure the ID is a valid ObjectId
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.userSchema,
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.brandSchema,
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.productSchema,
                localField: 'product_id',
                foreignField: '_id',
                as: 'product_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.deliveryTypeSchema,
                localField: 'delivery_type',
                foreignField: '_id',
                as: 'delivery_type_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.videoTypeSchema,
                localField: 'video_types',
                foreignField: '_id',
                as: 'video_types_details',
            },
        },
        {
            $unwind: {
                path: '$user_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$brand_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$product_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$delivery_type_details',
                preserveNullAndEmptyArrays: true,
            },
        },
    ]

    const res = await Campaign.aggregate(pipeline).exec()

    return res[0] || null
}

const getCampaigns = async (search: string, page: number, limit: number) => {
    const searchRegex = new RegExp(search, 'i')

    const pipeline = [
        {
            $match: {
                $or: [{ campaign_title: searchRegex }],
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.userSchema,
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.brandSchema,
                localField: 'brand_id',
                foreignField: '_id',
                as: 'brand_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.productSchema,
                localField: 'product_id',
                foreignField: '_id',
                as: 'product_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.deliveryTypeSchema,
                localField: 'delivery_type',
                foreignField: '_id',
                as: 'delivery_type_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.videoTypeSchema,
                localField: 'video_types',
                foreignField: '_id',
                as: 'video_types_details',
            },
        },
        {
            $unwind: {
                path: '$user_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$brand_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$product_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$delivery_type_details',
                preserveNullAndEmptyArrays: true,
            },
        },
    ]

    const res = await Campaign.aggregate([
        ...pipeline,
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
        {
            $sort: { createdAt: -1 },
        },
    ])
    const count = await Campaign.aggregate([
        ...pipeline,
        {
            $count: 'total',
        },
    ])

    return {
        data: res,
        count: count[0]?.total,
    }
}

const deleteCampaign = async (_id: string) => {
    const res = await Campaign.findByIdAndDelete(_id)
    return res
}

export default {
    createCampaign,
    getCampaignById,
    updateCampaign,
    getCampaigns,
    deleteCampaign,
}
