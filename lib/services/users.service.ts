import mongoose, { PipelineStage } from 'mongoose'
import Users from '@/lib/schemas/user'
import schemaConstants from '../constants/schemaConstants'


const getUserById = async (id: string) => {
    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: schemaConstants.roleSchema,
                localField: 'role',
                foreignField: '_id',
                as: 'user_role',
            },
        },
        // {
        //     $lookup: {
        //         from: schemaConstants.profileDetailsSchema,
        //         localField: '_id',
        //         foriegnField: 'user_id',
        //         as: 'user_details'
        //     },
        // },
        // {
        //     $unwind: {
        //         path: '$user_details',
        //         preserveNullAndEmptyArrays: true
        //     }
        // }
        {
            $unwind: {
                path: '$user_role',
                preserveNullAndEmptyArrays: true,
            },
        }
    ]

    const res = await Users.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }

    return res[0] || null;
}

const getUsers = async ({ search, page, limit }: { search: string, page: number, limit: number }) => {
    const searchRegex = new RegExp(search, 'i');

    const lookupStages: PipelineStage.Lookup[] = [
        {
            $lookup: {
                from: schemaConstants.profileDetailsSchema,
                localField: '_id',
                foreignField: 'user_id',
                as: 'user_details',
            },
        },
        {
            $lookup: {
                from: schemaConstants.roleSchema,
                localField: 'role',
                foreignField: '_id',
                as: 'user_role',
            },
        }
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
                path: '$user_role',
                preserveNullAndEmptyArrays: true,
            },
        }
    ];

    const matchUsers: PipelineStage.Match = {
        $match: {
            $or: [{ 'user_details.full_name': searchRegex }],
        },
    };

    const sortUsers: PipelineStage.Sort = {
        $sort: { createdAt: -1 },
    };

    const paginationUsers: (PipelineStage.Skip | PipelineStage.Limit)[] = [
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ];

    // Complete aggregation pipeline
    const pipeline: PipelineStage[] = [
        ...lookupStages,
        ...unwindStages,
        ...(search ? [matchUsers] : []),
        sortUsers,
        ...paginationUsers,
    ];

    const users = await Users.aggregate(pipeline);

    // Count pipeline
    const countPipeline: PipelineStage[] = [
        ...lookupStages,
        ...unwindStages,
        ...(search ? [matchUsers] : []),
        { $count: 'total' },
    ];

    const countResult = await Users.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: users,
        count: totalCount,
    };
};



export default {
    getUsers,
    getUserById,
}
