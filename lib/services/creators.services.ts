import mongoose from "mongoose";
import User from "@/lib/schemas/user";
import roles from "@/lib/schemas/roles";
import s3paths from "@/lib/constants/s3paths";
import { s3GetURL } from "@/lib/utils/s3utils";
import schemaNameConstants from '@/lib/constants/schemaConstants'

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
    userId
}: {
    search: string;
    page: number;
    limit: number;
    country?: string;
    gender?: string;
    languages?: string;
    min_age?: number;
    max_age?: number;
    userId: string
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
        _id: { $ne: new mongoose.Types.ObjectId(userId) },
        ...(search && {
            $or: [
                {
                    $expr: {
                        $regexMatch: {
                            input: { $concat: ["$firstName", " ", "$lastName"] },
                            regex: new RegExp(search, 'i')
                        }
                    }
                },
                {
                    'interests.title': {
                        $regex: search || "",
                        $options: "i"
                    }
                }
            ]
        }),
        ...(languages && { 'languages.title': { $in: [new RegExp(languages, 'i')] } }),
        ...(gender && { gender }),
        ...(country && { 'location.country': new RegExp(country, 'i') }),
        ...(minDOB && maxDOB && {
            dob: {
                $gte: minDOB,
                $lte: maxDOB,
            },
        }),
    };


    const pipeline: any[] = [
        {
            $sort: { createdAt: -1 },
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
        {
            $match: {
                ...(filter),
            },
        },
    ];


    const creators = await User.aggregate(
        [
            ...pipeline,
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
            {
                $addFields: {
                    isLiked: {
                        $cond: {
                            if: { $isArray: "$savedUsers" },
                            then: { $in: [userId, "$savedUsers"] },
                            else: false,
                        },
                    },
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

    let creatorsWithSignedUrl = []
    if (creators?.length > 0) {
        creatorsWithSignedUrl = creators.map(creator => {
            if (creator?._id) {
                creator.profileImageOriginal = s3GetURL(s3paths.userProfileImage + creator?._id);
            }
            return creator;
        });

    }

    return {
        data: creatorsWithSignedUrl,
        count: count[0]?.total || 0,
    };
};

const saveACreator = async (id: string, userId: string) => {
    const res = await User.findByIdAndUpdate(
        {
            _id: id,
        },
        { $addToSet: { savedUsers: userId } },
        { new: true }
    )
    return res
}

const removeASavedCreator = async (id: string, userId: string) => {
    const res = await User.findByIdAndUpdate(
        {
            _id: id,
        },
        { $pull: { savedUsers: userId } },
        { new: true }
    )
    return res
}



export default { getCreators, saveACreator, removeASavedCreator }