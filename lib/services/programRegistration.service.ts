import mongoose, { PipelineStage } from 'mongoose'

import schemaConstants from '@/lib/constants/schemaConstants'
import ProgramRegistration from '@/lib/schemas/programRegistration'
import { IProgramRegistration } from '@/lib/types/programRegistration.interface'

interface ICheckProgram {
    program_id: mongoose.Types.ObjectId,
    user_id: mongoose.Types.ObjectId
}

const registerProgram = async (data: IProgramRegistration) => {
    const res = await ProgramRegistration.create(data)
    return res
}

const isProgramRegitrationExist = async (data: ICheckProgram) => {
    const res = await ProgramRegistration.exists(data);
    return res;
};

const isProgramRegistrationExistById = async (_id: mongoose.Types.ObjectId) => {
    const res = await ProgramRegistration.exists({ _id });
    return res;
};


const getProgramRegistrationById = async (id: string) => {
    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'user_id',
                foriegnField: '_id',
                as: 'user_details'
            },
        },
        {
            $lookup: {
                from: schemaConstants.programSchema,
                localField: "program_id",
                foriegnField: "_id",
                as: "program_details"
            }
        },
        {
            $unwind: {
                path: '$user_details',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$program_details',
                preserveNullAndEmptyArrays: true
            }
        }
    ]

    const res = await ProgramRegistration.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }

    return res[0] || null;
}

const getProgramRegistrations = async ({ program_id, search, page, limit }: { search: string, page: number, limit: number, program_id: string }) => {
    const searchRegex = new RegExp(search, 'i');

    const matchEvent: PipelineStage.Match = {
        $match: {
            'program_id': program_id
        }
    };

    const matchProgram: PipelineStage.Match = {
        $match: {
            $or: [
                { 'user_details.full_name': searchRegex },
                { 'program_details.name': searchRegex },
            ],
        },
    };

    const lookupStages: PipelineStage.Lookup[] = [
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_details',
            },
        },
        {
            $lookup: {
                from: schemaConstants.programSchema,
                localField: 'program_id',
                foreignField: '_id',
                as: 'program_details',
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
                path: '$program_details',
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

    const sortProgram: PipelineStage.Sort = {
        $sort: { createdAt: -1 },
    };

    const paginationPrograms: (PipelineStage.Skip | PipelineStage.Limit)[] = [
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
    ];

    const pipeline: PipelineStage[] = [
        ...(search ? [matchProgram] : []),
        ...(program_id ? [matchEvent] : []),
        ...lookupStages,
        ...unwindStages,
        sortProgram,
        ...paginationPrograms,
    ];

    const programs = await ProgramRegistration.aggregate(pipeline);

    const countPipeline: PipelineStage[] = [
        ...(search ? [matchProgram] : []),
        ...(program_id ? [matchEvent] : []),
        ...lookupStages,
        {
            $count: 'total',
        },
    ];

    const countResult = await ProgramRegistration.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: programs,
        count: totalCount,
    };
};



const deleteProgramRegistration = async (_id: string) => {
    const res = await ProgramRegistration.findByIdAndDelete(_id)
    return res
}



export default {
    registerProgram,
    getProgramRegistrations,
    isProgramRegitrationExist,
    deleteProgramRegistration,
    getProgramRegistrationById,
    isProgramRegistrationExistById
}
