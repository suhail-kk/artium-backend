import Applicant from '@/lib/schemas/applicants'
import { IApplicant, IUpdateApplicant, IUpdateApplicantTrack } from '@/lib/types/applicants.interface'
import schemaNameConstants from '@/lib/constants/schemaConstants'
import mongoose from 'mongoose'
import { s3GetURL } from '../utils/s3utils'
import s3paths from '../constants/s3paths'


const createApplicant = async (data: IApplicant) => {
    const res = await Applicant.create(data)
    return res
}

const updateApplicant = async (id: string, data: IUpdateApplicant) => {
    const res = await Applicant.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const updateApplicantTracks = async (id: string, data: IUpdateApplicantTrack) => {
    const res = await Applicant.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const isExist = async (userId: mongoose.Types.ObjectId, campaignId: mongoose.Types.ObjectId) => {
    return await Applicant.findOne({ user_id: userId, campaign_id: campaignId });
};

const getApplicants = async (search: string, campaign_id: string, filter_by: string, page: number, limit: number) => {
    const searchRegex = new RegExp(search, 'i')

    const pipeline = [
        {
            $match: {
                campaign_id: new mongoose.Types.ObjectId(campaign_id),
            },
        },
        ...(filter_by ? [{ $match: { status: filter_by } }] : []),
        {
            $lookup: {
                from: schemaNameConstants.userSchema,
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_details',
            },
        },
        {
            $addFields: {
                fullName: {
                    $concat: [
                        { $arrayElemAt: ['$user_details.firstName', 0] },
                        ' ',
                        { $ifNull: [{ $arrayElemAt: ['$user_details.lastName', 0] }, ''] }
                    ]
                }
            }
        },
        {
            $unwind: {
                path: '$user_details',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $match: {
                $or: [
                    { fullName: searchRegex },
                    { 'user_details.firstName': searchRegex },
                    { 'user_details.lastName': searchRegex }
                ]
            }
        }
    ]


    const applicants = await Applicant.aggregate([
        ...pipeline,
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
    ])
    const count = await Applicant.aggregate([
        ...pipeline,
        {
            $count: 'total',
        },
    ])


    let applicantsWithSignedUrl = []
    if (applicants?.length > 0) {
        applicantsWithSignedUrl = applicants.map(applicant => {
            if (applicant?.user_details?._id) {
                applicant.profileImageOriginal = s3GetURL(s3paths.userProfileImage + applicant?.user_details?._id);
            }
            return applicant;
        });

    }


    return {
        data: applicantsWithSignedUrl,
        count: count[0]?.total,
    }
}

const deleteApplicant = async (_id: string) => {
    const res = await Applicant.findByIdAndDelete(_id)
    return res
}

export default {
    isExist,
    createApplicant,
    updateApplicant,
    getApplicants,
    deleteApplicant,
    updateApplicantTracks
}
