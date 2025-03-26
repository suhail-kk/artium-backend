import Stage from '@/lib/schemas/stage'
import mongoose, { PipelineStage } from 'mongoose'
import { IStage, IUpdateStage } from '@/lib/types/stage.interface'

const createStage = async (data: IStage) => {
    const res = await Stage.create(data)
    return res
}

const isStageExist = async (name: string) => {
    const res = await Stage.exists({ name });
    return res;
};

const isStageExistById = async (_id: mongoose.Types.ObjectId) => {
    const res = await Stage.exists({ _id });
    return res;
};


const updateStage = async (id: string, data: IUpdateStage) => {
    const res = await Stage.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const getStageById = async (id: string) => {

    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },
    ]

    const res = await Stage.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }

    return res[0] || null;
}

const getStages = async (search: string, page: number, limit: number) => {
    const searchRegex = new RegExp(search, 'i');

    const matchStage: PipelineStage.Match = {
        $match: {
            name: searchRegex,
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
        sortStage,
        ...paginationStages,
    ];

    const stages = await Stage.aggregate(pipeline);


    const countPipeline: PipelineStage[] = [
        matchStage,
        {
            $count: 'total',
        },
    ];

    const countResult = await Stage.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: stages,
        count: totalCount,
    };
};


const deleteStage = async (_id: string) => {
    const res = await Stage.findByIdAndDelete(_id)
    return res
}


export default {
    isStageExist,
    createStage,
    getStageById,
    updateStage,
    getStages,
    deleteStage,
    isStageExistById
}
