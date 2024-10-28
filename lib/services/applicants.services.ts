import Applicant from '@/lib/schemas/applicants'
import { IApplicant } from '@/lib/types/applicants.interface'
import schemaNameConstants from '@/lib/constants/schemaConstants'
import mongoose from 'mongoose'


const createApplicant = async (data: IApplicant) => {
    const res = await Applicant.create(data)
    return res
}

const updateApplicant = async (id: string, data: IApplicant) => {
    const res = await Applicant.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const getApplicants = async (campaign_id: string, search: string, page: number, limit: number) => {
    const searchRegex = new RegExp(search, 'i')

    const pipeline = [
        {
            $match: {
                campaign_id: new mongoose.Types.ObjectId(campaign_id),
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.userSchema,
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_details',
            },
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
                    { 'user_details.firstName': searchRegex },
                    { 'user_details.lastName': searchRegex }
                ]
            }
        },
    ]

    const res = await Applicant.aggregate([
        ...pipeline,
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
        {
            $sort: { createdAt: -1 },
        },
    ])
    const count = await Applicant.aggregate([
        ...pipeline,
        {
            $count: 'total',
        },
    ])


    return {
        data: res,
        count: count[0]?.total,
    }
}

const deleteApplicant = async (_id: string) => {
    const res = await Applicant.findByIdAndDelete(_id)
    return res
}

export default {
    createApplicant,
    updateApplicant,
    getApplicants,
    deleteApplicant,
}
