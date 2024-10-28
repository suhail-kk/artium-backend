import User from "@/lib/schemas/user";
import roles from "@/lib/schemas/roles";
import schemaNameConstants from '@/lib/constants/schemaConstants'
import mongoose from "mongoose";
import { s3GetURL } from "../utils/s3utils";
import s3paths from "../constants/s3paths";

const getRoles = async () => {
    const res = roles.find()
    return res
}

const getCreators = async ({
    search,
    page,
    limit,
    country,
    gender,
    languages,
    min_age,
    max_age,
}: {
    search: string;
    page: number;
    limit: number;
    country?: string;
    gender?: string;
    languages?: string;
    min_age?: number;
    max_age?: number;
}) => {

    let filter
    let minDOB
    let maxDOB


    const roles = await getRoles()
    const role = roles.find((val) => {
        return val.name === 'Creator';
    });

    if (min_age !== undefined && max_age !== undefined) {
        const today = new Date();
        minDOB = min_age !== undefined ? new Date(today.getFullYear() - max_age - 1, today.getMonth(), today.getDate()) : null;
        maxDOB = max_age !== undefined ? new Date(today.getFullYear() - min_age, today.getMonth(), today.getDate()) : null;
    }

    filter = {
        ...{ role: role?._id },
        ...(search && {
            $or: [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') }
            ]
        }),
        ...(languages && { 'languages': { $in: [new mongoose.Types.ObjectId(languages)] } }),
        ...(gender && { gender }),
        ...(country && { 'location.country': new RegExp(country, 'i') }),
        ...(minDOB && maxDOB && {
            dob: {
                $gte: minDOB,
                $lte: maxDOB,
            },
        }),
    };





    const pipeline = [
        {
            $match: {
                ...(filter),
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.languagesSchema,
                localField: 'languages',
                foreignField: '_id',
                as: 'languages',
            },
        },
        {
            $lookup: {
                from: schemaNameConstants.interestsSchema,
                localField: 'interests',
                foreignField: '_id',
                as: 'interests',
            },
        },
    ];


    const res = await User.aggregate(
        [
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
            {
                $addFields: {
                    profileImageOriginal: s3GetURL(s3paths.userProfileImage + "$_id"),
                },
            },
        ]
    );

    const count = await User.aggregate([
        ...pipeline,
        {
            $count: 'total',
        },
    ]);

    return {
        data: res,
        count: count[0]?.total || 0,
    };
};



export default { getCreators }