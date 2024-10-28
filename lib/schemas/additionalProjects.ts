import mongoose, { Schema } from 'mongoose'

import schemaNameConstants from '../constants/schemaConstants'

const additionalProjectsSchema = new mongoose.Schema(
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

export default mongoose.models.additionalProjects ||
    mongoose.model(schemaNameConstants.additionalProjectsSchema, additionalProjectsSchema)