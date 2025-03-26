import mongoose, { PipelineStage } from 'mongoose'

import User from '@/lib/schemas/user'
import Invigilator from '@/lib/schemas/invigilator'
import schemaNameConstants from '@/lib/constants/schemaConstants'
import { IInvigilator, IUpdateInvigilator } from '@/lib/types/invigilator.interface'

const createInvigilator = async (data: IInvigilator) => {
    const res = await Invigilator.create(data)
    return res
}

const checkExist = async (_id: mongoose.Types.ObjectId) => {
    const res = await Invigilator.exists({
        user_id: _id
    })
    return res
}

const updateInvigilator = async (id: string, data: IUpdateInvigilator) => {
    const res = await Invigilator.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const getInvigilatorById = async (id: string) => {

    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.eventSchema,
                localField: 'assigned_events',
                foreignField: '_id',
                as: 'event_details',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.userSchema,
                localField: 'user_id',
                foreignField: '_id',
                as: 'invigilator',
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
                path: '$assigned_events',
                preserveNullAndEmptyArrays: true,
            },
        },
    ]

    const res = await Invigilator.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }

    return res[0];
}

const getInvigilators = async ({ search, page, limit, status }: {
    search: string,
    page: number,
    limit: number,
    status: string
}) => {
    const searchRegex = new RegExp(search, 'i');

    let statusMatch: PipelineStage.Match = { $match: {} };

    if (status === 'approved') {
        statusMatch = { $match: { 'is_approved': true } };
    } else if (status === 'not_approved') {
        statusMatch = { $match: { 'is_approved': false } };
    }

    const lookupInvigilator: PipelineStage.Lookup = {
        $lookup: {
            from: schemaNameConstants.userSchema,
            localField: 'user_id',
            foreignField: '_id',
            as: 'invigilator',
        },
    };

    const unwindInvigilator: PipelineStage.Unwind = {
        $unwind: {
            path: '$invigilator',
            preserveNullAndEmptyArrays: true,
        },
    };

    const filterByFullName: PipelineStage.Match = {
        $match: { 'invigilator.full_name': searchRegex },
    };

    const addFields: PipelineStage.AddFields = {
        $addFields: {
            no_of_assigned_events: { $size: { $ifNull: ['$assigned_events', []] } },
        },
    };

    const lookupCompletedEvents: PipelineStage.Lookup = {
        $lookup: {
            from: schemaNameConstants.eventSchema,
            localField: 'assigned_events',
            foreignField: '_id',
            as: 'completed_events',
        },
    };

    const addCompletedEventsCount: PipelineStage.AddFields = {
        $addFields: {
            no_of_completed_events: {
                $size: {
                    $filter: {
                        input: '$completed_events',
                        as: 'event',
                        cond: { $eq: ['$$event.status', 'Completed'] },
                    },
                },
            },
        },
    };

    const projectFields: PipelineStage.Project = {
        $project: {
            _id: 1,
            full_name: '$invigilator.full_name',
            no_of_assigned_events: 1,
            no_of_completed_events: 1,
            user_id: 1,
            status: '$is_approved',
        },
    };

    const sortStage: PipelineStage.Sort = {
        $sort: { createdAt: -1 },
    };

    const paginationStages: (PipelineStage.Skip | PipelineStage.Limit)[] = [
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ];

    const pipeline: PipelineStage[] = [
        lookupInvigilator,
        unwindInvigilator,
        filterByFullName,
        statusMatch,
        addFields,
        lookupCompletedEvents,
        addCompletedEventsCount,
        projectFields,
        sortStage,
        ...paginationStages,
    ];

    const invigilators = await Invigilator.aggregate(pipeline);

    // Count pipeline
    const countPipeline: PipelineStage[] = [
        lookupInvigilator,
        unwindInvigilator,
        filterByFullName,
        statusMatch,
        { $count: 'total' },
    ];

    const countResult = await Invigilator.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: invigilators,
        count: totalCount,
    };
};



const deleteInvigilator = async (_id: string) => {
    const res = await Invigilator.findByIdAndDelete(_id)
    return res
}

const getFacultiesNotInvited = async ({ search, page, limit }: {
    search: string,
    page: number,
    limit: number
}) => {
    const searchRegex = new RegExp(search, 'i');

    // Lookup Role Schema to filter "Faculty" users
    const lookupRole: PipelineStage.Lookup = {
        $lookup: {
            from: schemaNameConstants.roleSchema,
            localField: 'role',
            foreignField: '_id',
            as: 'roleInfo',
        },
    };

    const unwindRole: PipelineStage.Unwind = {
        $unwind: {
            path: '$roleInfo',
            preserveNullAndEmptyArrays: true,
        },
    };

    // Match only "Faculty" users
    const matchFacultyRole: PipelineStage.Match = {
        $match: { 'roleInfo.name': 'Faculty' },
    };

    // Lookup Invigilator Table to check invitation status
    const lookupInvigilator: PipelineStage.Lookup = {
        $lookup: {
            from: schemaNameConstants.invigilatorSchema,
            localField: '_id',
            foreignField: 'user_id',
            as: 'invigilatorInfo',
        },
    };

    // Filter out users who are invited (is_invited: true)
    const filterNotInvited: PipelineStage.Match = {
        $match: {
            $or: [
                { invigilatorInfo: { $size: 0 } }, // No invigilator record
                { 'invigilatorInfo.is_invited': false }, // Not invited
            ],
        },
    };

    // Search filter
    const filterByFullName: PipelineStage.Match = {
        $match: { full_name: searchRegex },
    };

    // Select only required fields
    const projectFields: PipelineStage.Project = {
        $project: {
            _id: 1,
            full_name: 1,
            email: 1,
        },
    };

    const sortStage: PipelineStage.Sort = {
        $sort: { createdAt: -1 },
    };

    const paginationStages: (PipelineStage.Skip | PipelineStage.Limit)[] = [
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ];

    const pipeline: PipelineStage[] = [
        lookupRole,
        unwindRole,
        matchFacultyRole,
        lookupInvigilator,
        filterNotInvited,
        filterByFullName,
        projectFields,
        sortStage,
        ...paginationStages,
    ];

    const faculties = await User.aggregate(pipeline);

    // Count pipeline
    const countPipeline: PipelineStage[] = [
        lookupRole,
        unwindRole,
        matchFacultyRole,
        lookupInvigilator,
        filterNotInvited,
        filterByFullName,
        { $count: 'total' },
    ];

    const countResult = await User.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: faculties,
        count: totalCount,
    };
};


export default {
    checkExist,
    getInvigilators,
    updateInvigilator,
    deleteInvigilator,
    createInvigilator,
    getInvigilatorById,
    getFacultiesNotInvited,
}
