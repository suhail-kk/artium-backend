import mongoose, { PipelineStage } from 'mongoose'

import Result from '@/lib/schemas/results'
import schemaConstants from '@/lib/constants/schemaConstants'
import { IResult, IUpdateResult, IUpdateResultStatus } from '@/lib/types/results.interface'

interface ICheckResult {
    event_id: mongoose.Types.ObjectId
}
const addResult = async (data: IResult) => {
    const res = await Result.create(data)
    return res
}

const isResultExist = async (data: ICheckResult) => {
    const res = await Result.exists(data);
    return res;
};

const isResultExistById = async (_id: mongoose.Types.ObjectId) => {
    const res = await Result.exists({ _id });
    return res;
};


const getResultById = async (id: string) => {

    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'results.user_id',
                foreignField: '_id',
                as: 'user_details'
            },
        },
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'event_id',
                foreignField: '_id',
                as: 'event_details'
            },
        },
        {
            $unwind: {
                path: '$user_details',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$event_details',
                preserveNullAndEmptyArrays: true
            }
        }
    ]

    const res = await Result.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }

    return res[0] || null;
}

const getResults = async ({ event_id, search, page, limit }: { search: string, page: number, limit: number, event_id: string }) => {
    const searchRegex = new RegExp(search, 'i');

    const matchEvent: PipelineStage.Match = {
        $match: {
            'event_id': event_id
        }
    };

    const matchResult: PipelineStage.Match = {
        $match: {
            $or: [
                { 'user_details.full_name': searchRegex },
                { 'event_details.name': searchRegex },
            ],
        },
    };

    const lookupStages: PipelineStage.Lookup[] = [
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'results.user_id',
                foreignField: '_id',
                as: 'user_details'
            },
        },
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'event_id',
                foreignField: '_id',
                as: 'event_details'
            },
        },
    ];

    const unwindStages: PipelineStage.Unwind[] = [
        {
            $unwind: {
                path: '$user_details',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$event_details',
                preserveNullAndEmptyArrays: true
            }
        }
    ];

    const sortResult: PipelineStage.Sort = {
        $sort: { createdAt: -1 },
    };

    const paginationResults: (PipelineStage.Skip | PipelineStage.Limit)[] = [
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
    ];

    const pipeline: PipelineStage[] = [
        ...(search ? [matchResult] : []),
        ...(event_id ? [matchEvent] : []),
        ...lookupStages,
        ...unwindStages,
        sortResult,
        ...paginationResults,
    ];

    const results = await Result.aggregate(pipeline);

    const countPipeline: PipelineStage[] = [
        ...(search ? [matchResult] : []),
        ...(event_id ? [matchEvent] : []),
        ...lookupStages,
        {
            $count: 'total',
        },
    ];

    const countResult = await Result.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: results,
        count: totalCount,
    };
};



const deleteResult = async (_id: string) => {
    const res = await Result.findByIdAndDelete(_id)
    return res
}

const updateResult = async (_id: mongoose.Types.ObjectId, data: IUpdateResult) => {
    const res = await Result.updateOne({
        _id
    }, data)
    return res
}

const publishResult = async (_id: mongoose.Types.ObjectId, data: IUpdateResultStatus) => {
    const res = await Result.updateOne({
        _id
    }, data)
    return res
}

export default {
    getResults,
    addResult,
    deleteResult,
    updateResult,
    isResultExist,
    getResultById,
    publishResult,
    isResultExistById
}
