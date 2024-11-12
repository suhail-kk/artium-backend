import mongoose, { Schema } from 'mongoose'

import schemaNameConstants from '@/lib/constants/schemaConstants'

const applicantsSchema = new mongoose.Schema(
    {
        campaign_id: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: schemaNameConstants.campaignsSchema,
        },
        user_id: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: schemaNameConstants.userSchema,
        },
        rating: {
            type: String,
        },
        status: {
            type: String,
        },
        campaign_status: {
            type: String,
        },
        campaign_end_date: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models[schemaNameConstants.applicantsSchema] ||
    mongoose.model(schemaNameConstants.applicantsSchema, applicantsSchema)
