import Event from '@/lib/schemas/event'
import mongoose, { PipelineStage } from 'mongoose'
import { IEvent, IUpdateEvent, IUpdateEventStatus, IUpdatePublish } from '@/lib/types/event.interface'
import schemaNameConstants from '@/lib/constants/schemaConstants'

interface ICheckEvent {
    name: string,
    ideal_for: string,
    program: mongoose.Types.ObjectId
}
const createEvent = async (data: IEvent) => {
    const res = await Event.create(data)
    return res
}

const checkExist = async (data: ICheckEvent) => {
    const res = await Event.exists(data)
    return res
}

const updateEventStatus = async (id: string, data: IUpdateEventStatus) => {
    const res = await Event.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const updatePulishStatus = async (id: string, data: IUpdatePublish) => {
    const res = await Event.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}


const updateEvent = async (id: string, data: IUpdateEvent) => {
    const res = await Event.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const getEventById = async (id: string) => {

    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },
    ]

    const res = await Event.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }

    return res[0];
}

const getEvents = async (search: string, page: number, limit: number, status?: string, is_published?: boolean) => {
    const searchRegex = new RegExp(search, 'i');

    const matchStage: PipelineStage.Match = {
        $match: {
            name: searchRegex,
            ...(status && { status }), // Filter by status if provided
            ...(is_published !== undefined && { is_published }), // Filter by is_published if provided
        },
    };

    const lookupStages: PipelineStage.Lookup[] = [
        {
            $lookup: {
                from: schemaNameConstants.eventType,
                localField: 'type',
                foreignField: '_id',
                as: 'event_type',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.programSchema,
                localField: 'program',
                foreignField: '_id',
                as: 'program_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.stagesSchema,
                localField: 'stage',
                foreignField: '_id',
                as: 'stage',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.userSchema,
                localField: 'invigilator',
                foreignField: '_id',
                as: 'invigilator',
            },
        },
    ];

    const unwindStages: PipelineStage.Unwind[] = [
        {
            $unwind: {
                path: '$event_type',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$stage',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: '$invigilator',
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

    const events = await Event.aggregate(pipeline);

    const countPipeline: PipelineStage[] = [
        matchStage,
        ...lookupStages,
        {
            $count: 'total',
        },
    ];

    const countResult = await Event.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: events,
        count: totalCount,
    };
};



const deleteEvent = async (_id: string) => {
    const res = await Event.findByIdAndDelete(_id)
    return res
}


export default {
    createEvent,
    getEventById,
    updateEvent,
    getEvents,
    checkExist,
    deleteEvent,
    updateEventStatus,
    updatePulishStatus,
}
