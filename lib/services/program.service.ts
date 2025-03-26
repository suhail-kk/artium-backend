import Program from '@/lib/schemas/program'
import mongoose, { PipelineStage } from 'mongoose'
import { IProgram, IUpdateProgram, IUpdateProgramStatus } from '@/lib/types/program.interface'
import schemaNameConstants from '@/lib/constants/schemaConstants'

const createProgram = async (data: IProgram) => {
    const res = await Program.create(data)
    return res
}

const isProgramExist = async (program_name: string) => {
    const res = await Program.exists({ program_name });
    return res;
};

const isProgramExistById = async (_id: mongoose.Types.ObjectId) => {
    const res = await Program.exists({ _id });
    return res;
};

const updateProgram = async (id: string, data: IUpdateProgram) => {
    const res = await Program.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const updateProgramStatus = async (id: string, data: IUpdateProgramStatus) => {
    const res = await Program.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}


const getProgramById = async (id: string) => {
    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.programType,
                localField: 'program_type',
                foreignField: '_id',
                as: 'program_type_details',
            },
        },
        {
            $unwind: {
                path: '$program_type_details',
                preserveNullAndEmptyArrays: true,
            },
        },
    ]

    const res = await Program.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }

    return res[0];
}

const getPrograms = async (search: string, page: number, limit: number) => {
    const searchRegex = new RegExp(search, 'i');

    const matchStage: PipelineStage.Match = {
        $match: {
            program_name: searchRegex,
        },
    };

    const lookupStages: PipelineStage.Lookup[] = [
        {
            $lookup: {
                from: schemaNameConstants.programType,
                localField: 'program_type',
                foreignField: '_id',
                as: 'program_type_details',
            },
        },
    ];

    const unwindStages: PipelineStage.Unwind[] = [
        {
            $unwind: {
                path: '$program_type_details',
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
        matchStage,
        ...lookupStages,
        ...unwindStages,
        sortStage,
        ...paginationStages,
    ];

    const programs = await Program.aggregate(pipeline);

    const countPipeline: PipelineStage[] = [
        matchStage,
        ...lookupStages,
        {
            $count: 'total',
        },
    ];

    const countResult = await Program.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: programs,
        count: totalCount,
    };
};


const deleteProgram = async (_id: string) => {
    const res = await Program.findByIdAndDelete(_id)
    return res
}


export default {
    createProgram,
    getProgramById,
    updateProgram,
    getPrograms,
    deleteProgram,
    isProgramExist,
    isProgramExistById,
    updateProgramStatus
}
