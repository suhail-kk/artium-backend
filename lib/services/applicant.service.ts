import mongoose, { PipelineStage } from 'mongoose'
import Applicant from '@/lib/schemas/applicants'
import { IApplicant } from '@/lib/types/applicant.interface'
import schemaConstants from '../constants/schemaConstants'

interface ICheckApplicant {
    event_id: mongoose.Types.ObjectId,
    user_id: mongoose.Types.ObjectId
}

interface ICheckValidApplicant {
    event_id: mongoose.Types.ObjectId,
    attendees: mongoose.Types.ObjectId[],
    absentees: mongoose.Types.ObjectId[]
}
const createApplicant = async (data: IApplicant) => {
    const res = await Applicant.create(data)
    return res
}

const isApplicantExist = async (data: ICheckApplicant) => {
    const res = await Applicant.exists(data);
    return res;
};

const isApplicantExistById = async (_id: mongoose.Types.ObjectId) => {
    const res = await Applicant.exists({ _id });
    return res;
};


const getApplicantById = async (id: string) => {
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
                from: schemaConstants.eventSchema,
                localField: "event_id",
                foriegnField: "_id",
                as: "event_details"
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
                path: '$event_details',
                preserveNullAndEmptyArrays: true
            }
        }
    ]

    const res = await Applicant.aggregate(pipeline).exec()

    if (!res || res.length === 0) {
        return null;
    }

    return res[0] || null;
}

const getApplicants = async ({ event_id, search, page, limit }: { search: string, page: number, limit: number, event_id: mongoose.Types.ObjectId }) => {
    const searchRegex = new RegExp(search, 'i');

    const matchEvent: PipelineStage.Match = {
        $match: {
            'event_id': event_id
        }
    };

    const matchApplicant: PipelineStage.Match = {
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
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_details',
            },
        },
        {
            $lookup: {
                from: schemaConstants.eventSchema,
                localField: 'event_id',
                foreignField: '_id',
                as: 'event_details',
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
                path: '$event_details',
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

    const sortApplicant: PipelineStage.Sort = {
        $sort: { createdAt: -1 },
    };

    const paginationApplicants: (PipelineStage.Skip | PipelineStage.Limit)[] = [
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
    ];

    const pipeline: PipelineStage[] = [
        ...(search ? [matchApplicant] : []),
        ...(event_id ? [matchEvent] : []),
        ...lookupStages,
        ...unwindStages,
        sortApplicant,
        ...paginationApplicants,
    ];

    const applicants = await Applicant.aggregate(pipeline);

    const countPipeline: PipelineStage[] = [
        ...(search ? [matchApplicant] : []),
        ...(event_id ? [matchEvent] : []),
        ...lookupStages,
        {
            $count: 'total',
        },
    ];

    const countResult = await Applicant.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return {
        data: applicants,
        count: totalCount,
    };
};



const deleteApplicant = async (_id: string) => {
    const res = await Applicant.findByIdAndDelete(_id)
    return res
}

const isValidApplicants = async ({ event_id, absentees, attendees }: ICheckValidApplicant) => {
    const validApplicants = await Applicant.find({ event_id, user_id: { $in: [...attendees, ...absentees] } });
    const validApplicantIds = validApplicants.map(applicant => applicant.user_id.toString());

    const invalidAttendees = attendees.filter(id => !validApplicantIds.includes(id));
    const invalidAbsentees = absentees.filter(id => !validApplicantIds.includes(id));
    return { invalidAttendees, invalidAbsentees }
};


export default {
    isApplicantExist,
    createApplicant,
    getApplicantById,
    getApplicants,
    deleteApplicant,
    isValidApplicants,
    isApplicantExistById
}
