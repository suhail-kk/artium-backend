import mongoose, { PipelineStage } from 'mongoose'

import Attendance from '@/lib/schemas/attendence'
import schemaConstants from '@/lib/constants/schemaConstants'
import { IAttendence, IUpdateAttendence } from '@/lib/types/attendence.interface'

interface ICheckAttendance {
    event_id: mongoose.Types.ObjectId
}
const createAttendance = async (data: IAttendence) => {
    const res = await Attendance.create(data)
    return res
}

const isAttendanceExist = async (data: ICheckAttendance) => {
    const res = await Attendance.exists(data);
    return res;
};

const isAttendanceExistById = async (_id: mongoose.Types.ObjectId) => {
    const res = await Attendance.exists({ _id });
    return res;
};


const getAttendanceById = async (id: string) => {

    const pipeline = [
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id),
            },
        },
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'attendees',
                foreignField: '_id',
                as: 'attendeese_details'
            },
        },
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'absentees',
                foreignField: '_id',
                as: 'absentees_details'
            },
        },
        {
            $lookup: {
                from: schemaConstants.eventSchema,
                localField: "event_id",
                foreignField: "_id",
                as: "event_details"
            }
        },
        {
            $unwind: {
                path: '$attendeese_details',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$absentees_details',
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

    const res = await Attendance.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }

    return res[0] || null;
}

const getAttendances = async ({ event_id, search, page, limit }: { search: string, page: number, limit: number, event_id: string }) => {
    const searchRegex = new RegExp(search, 'i');

    const matchEvent: PipelineStage.Match = {
        $match: {
            'event_id': event_id
        }
    };

    const matchAttendance: PipelineStage.Match = {
        $match: {
            $or: [
                { 'attendeese_details.full_name': searchRegex },
                { 'absentees_details.full_name': searchRegex },
                { 'event_details.name': searchRegex },
            ],
        },
    };

    const lookupStages: PipelineStage.Lookup[] = [
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'attendees',
                foreignField: '_id',
                as: 'attendeese_details'
            },
        },
        {
            $lookup: {
                from: schemaConstants.userSchema,
                localField: 'absentees',
                foreignField: '_id',
                as: 'absentees_details'
            },
        },
        {
            $lookup: {
                from: schemaConstants.eventSchema,
                localField: "event_id",
                foreignField: "_id",
                as: "event_details"
            }
        },
    ];

    const unwindStages: PipelineStage.Unwind[] = [
        {
            $unwind: {
                path: '$attendeese_details',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$absentees_details',
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

    const sortAttendance: PipelineStage.Sort = {
        $sort: { createdAt: -1 },
    };

    const paginationAttendances: (PipelineStage.Skip | PipelineStage.Limit)[] = [
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
    ];

    const pipeline: PipelineStage[] = [
        ...(search ? [matchAttendance] : []),
        ...(event_id ? [matchEvent] : []),
        ...lookupStages,
        ...unwindStages,
        sortAttendance,
        ...paginationAttendances,
    ];

    console.log('====================================');
    console.log(pipeline);
    console.log('====================================');

    const attendances = await Attendance.aggregate(pipeline);

    const countPipeline: PipelineStage[] = [
        ...(search ? [matchAttendance] : []),
        ...(event_id ? [matchEvent] : []),
        ...lookupStages,
        {
            $count: 'total',
        },
    ];

    const countResult = await Attendance.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: attendances,
        count: totalCount,
    };
};



const deleteAttendance = async (_id: string) => {
    const res = await Attendance.findByIdAndDelete(_id)
    return res
}

const updateAttendance = async (_id: mongoose.Types.ObjectId, data: IUpdateAttendence) => {
    const res = await Attendance.updateOne({
        _id
    }, data)
    return res
}


export default {
    getAttendances,
    createAttendance,
    deleteAttendance,
    updateAttendance,
    isAttendanceExist,
    getAttendanceById,
    isAttendanceExistById
}
