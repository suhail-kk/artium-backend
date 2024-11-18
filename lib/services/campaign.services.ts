import campaignServices from '@/lib/services/campaign.services';
import Campaign from '@/lib/schemas/campaign'
import { ICampaign, IUpdateCampaign } from '@/lib/types/campaign.interface'
import schemaNameConstants from '@/lib/constants/schemaConstants'
import mongoose, { PipelineStage } from 'mongoose'
import { s3GetURL } from '../utils/s3utils'
import Applicants from '@/lib/schemas/applicants'

const createCampaign = async (data: ICampaign) => {
    const res = await Campaign.create(data)
    return res
}

const updateCampaign = async (id: string, data: IUpdateCampaign) => {
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
                _id: new mongoose.Types.ObjectId(id),
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
                from: schemaNameConstants.applicantsSchema,
                localField: '_id',
                foreignField: 'campaign_id',
                as: 'applicants',
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
        {
            $addFields: {
                applicants_count: { $size: "$applicants" }
            }
        }
    ]

    const res = await Campaign.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }


    let logo_image_preview = ""
    let product_image_preview = ""
    const logoImageKey = res[0]?.logo_image_key;
    const productImageKey = res[0]?.product_details?.product_image_key;

    if (productImageKey) {
        product_image_preview = await s3GetURL(productImageKey)
    }

    if (logoImageKey) {
        logo_image_preview = await s3GetURL(logoImageKey)
    }

    const data = {
        ...res[0],
        logo_image_preview,
        product_image_preview,
    };

    return data;
}

const getCampaigns = async (search: string, page: number, limit: number) => {
    const searchRegex = new RegExp(search, 'i');

    const matchStage: PipelineStage.Match = {
        $match: {
            campaign_title: searchRegex,
            campaign_status: { $ne: "Completed" },
        },
    };

    const lookupStages: PipelineStage.Lookup[] = [
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
            $lookup: {
                from: schemaNameConstants.applicantsSchema,
                localField: '_id',
                foreignField: 'campaign_id',
                as: 'applicants',
            },
        },
    ];

    const unwindStages: PipelineStage.Unwind[] = [
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

    ];

    const addFieldStage: PipelineStage.AddFields = {
        $addFields: {
            applicants_count: { $size: '$applicants' }
        },
    };

    const sortStage: PipelineStage.Sort = {
        $sort: { createdAt: -1 },
    };

    const paginationStages: (PipelineStage.Skip | PipelineStage.Limit)[] = [
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
    ];

    const pipeline: PipelineStage[] = [
        matchStage,
        ...lookupStages,
        ...unwindStages,
        addFieldStage,
        sortStage,
        ...paginationStages,
    ];

    const campaigns = await Campaign.aggregate(pipeline);


    const countPipeline: PipelineStage[] = [
        matchStage,
        ...lookupStages,
        {
            $count: 'total',
        },
    ];

    const countResult = await Campaign.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    let campaignsWithSignedUrl = []
    if (campaigns?.length > 0) {
        campaignsWithSignedUrl = campaigns.map(campaign => {
            if (campaign?.product_details?.product_image_key) {
                campaign.product_image_url = s3GetURL(campaign?.product_details?.product_image_key);
            }
            if (campaign?.logo_image_key) {
                campaign.logo_image_url = s3GetURL(campaign?.logo_image_key);
            }
            return campaign;
        });

    }

    return {
        data: campaignsWithSignedUrl,
        count: totalCount,
    };
};


const deleteCampaign = async (_id: string) => {
    const res = await Campaign.findByIdAndDelete(_id)
    return res
}

const getUserCampaigns = async (user_id: string, search: string, page: number, limit: number) => {
    try {
        const searchRegex = new RegExp(search, 'i')
        const pipeline = [
            {
                $match: {
                    user_id: new mongoose.Types.ObjectId(user_id),
                    campaign_title: searchRegex,
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
                $lookup: {
                    from: schemaNameConstants.applicantsSchema,
                    localField: '_id',
                    foreignField: 'campaign_id',
                    as: 'applicants',
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
            {
                $addFields: {
                    applicants_count: { $size: '$applicants' }
                },
            }
        ]

        const campaigns = await Campaign.aggregate([
            ...pipeline,
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            }
        ])
        const count = await Campaign.aggregate([
            ...pipeline,
            {
                $count: 'total',
            },
        ])

        let campaignsWithSignedUrl = []
        if (campaigns?.length > 0) {
            campaignsWithSignedUrl = campaigns.map(campaign => {
                if (campaign?.product_details?.product_image_key) {
                    campaign.product_image_url = s3GetURL(campaign?.product_details?.product_image_key);
                }
                if (campaign?.logo_image_key) {
                    campaign.logo_image_url = s3GetURL(campaign?.logo_image_key);
                }
                return campaign;
            });

        }


        return {
            data: campaignsWithSignedUrl,
            count: count[0]?.total,
        }
    } catch (error) {
        console.error("Error fetching user campaigns:", error);
        throw error;
    }
}

const getAppliedCampaigns = async (user_id: string, search: string, page: number, limit: number) => {
    try {
        // const searchRegex = new RegExp(search, 'i')
        const pipeline = [
            {
                $lookup: {
                    from: schemaNameConstants.applicantsSchema,
                    localField: '_id',
                    foreignField: 'campaign_id',
                    as: 'applicant_details',
                },
            },
            {
                $unwind: {
                    path: '$applicant_details',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    'applicant_details.user_id': new mongoose.Types.ObjectId(user_id)
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
                $lookup: {
                    from: schemaNameConstants.applicantsSchema,
                    localField: '_id',
                    foreignField: 'campaign_id',
                    as: 'applicants',
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
            {
                $addFields: {
                    applicants_count: { $size: '$applicants' }
                },
            }
        ]

        const campaigns = await Campaign.aggregate([
            ...pipeline,
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
        ])

        const count = await Campaign.aggregate([
            ...pipeline,
            {
                $count: 'total',
            },
        ])

        let campaignsWithSignedUrl = []
        if (campaigns?.length > 0) {
            campaignsWithSignedUrl = campaigns.map(campaign => {
                if (campaign?.product_details?.product_image_key) {
                    campaign.product_image_url = s3GetURL(campaign?.product_details?.product_image_key);
                }
                if (campaign?.logo_image_key) {
                    campaign.logo_image_url = s3GetURL(campaign?.logo_image_key);
                }
                return campaign;
            });

        }

        return {
            data: campaignsWithSignedUrl,
            count: count[0]?.total,
        }
    } catch (error) {
        console.error("Error fetching user campaigns:", error);
        throw error;
    }
}

const getNumberOfApplicants = async (campaign_id: string) => {
    try {

        const id = new mongoose.Types.ObjectId(campaign_id);

        const result = await Applicants.aggregate([
            {
                $match: {
                    campaign_id: id,
                },
            },
            {
                $count: 'totalApplicants',
            },
        ]);

        return result.length > 0 ? result[0].totalApplicants : 0;
    } catch (error) {
        console.error('Error fetching number of applicants:', error);
        throw error;
    }
};

export default {
    createCampaign,
    getCampaignById,
    updateCampaign,
    getCampaigns,
    deleteCampaign,
    getUserCampaigns,
    getAppliedCampaigns,
    getNumberOfApplicants
}
