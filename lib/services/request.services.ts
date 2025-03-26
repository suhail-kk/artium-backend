import schemaNameConstants from '@/lib/constants/schemaConstants';
import Request from '@/lib/schemas/request'
import { ICreateRequest } from '@/lib/types/request.interface'
import mongoose, { PipelineStage, Types } from 'mongoose'

interface ICheckRequest {
    type: string,
    data: Object,
    recipient: Types.ObjectId,
    sender: Types.ObjectId,
}
const createRequest = async (data: ICreateRequest) => {
    const res = await Request.create(data)
    return res
}

const checkExist = async (data: ICheckRequest) => {
    const res = await Request.exists(data)
    return res
}

const deleteRequest = async (_id: string) => {
    const res = await Request.findByIdAndDelete(_id)
    return res
}

const getRequests = async ({ user_id, page, limit }: {
    user_id: mongoose.Types.ObjectId, page: number, limit: number
}) => {

    let userIdMatch: PipelineStage.Match = {
        $match: {}
    };

    if (user_id) {
        userIdMatch = {
            $match: {
                'recipient': user_id
            }
        };
    }
    const lookupStages: PipelineStage.Lookup[] = [
        {
            $lookup: {
                from: schemaNameConstants.userSchema,
                localField: 'sender',
                foreignField: '_id',
                as: 'sender_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.userSchema,
                localField: 'recipient',
                foreignField: '_id',
                as: 'recipient_details',
            },
        },
    ];

    const unwindStages: PipelineStage.Unwind[] = [
        {
            $unwind: {
                path: '$sender_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$recipient_details',
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

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
        ...lookupStages,
        ...unwindStages,
        userIdMatch,
        sortStage,
        ...paginationStages,
    ];

    const events = await Request.aggregate(pipeline);


    const countPipeline: PipelineStage[] = [
        ...lookupStages,
        {
            $count: 'total',
        },
    ];

    const countResult = await Request.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: events,
        count: totalCount,
    };
};


export default {
    checkExist,
    getRequests,
    createRequest,
    deleteRequest,
}
