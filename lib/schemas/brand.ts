import mongoose from 'mongoose'

import schemaNameConstants from '../constants/schemaConstants'

const brandSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        instagramLink: {
            type: String,
        },
        brandDescription: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models.User ||
    mongoose.model(schemaNameConstants.brandSchema, brandSchema)
