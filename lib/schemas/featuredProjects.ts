import mongoose, { Schema } from 'mongoose'

import schemaNameConstants from '../constants/schemaConstants'

const featuredProjectsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        url: {
            type: String,
            required: true,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: schemaNameConstants.userSchema,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models.featuredProjects ||
    mongoose.model(schemaNameConstants.featuredProjectsSchema, featuredProjectsSchema)