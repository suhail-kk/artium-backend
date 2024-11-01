import mongoose, { Schema } from 'mongoose'

import schemaNameConstants from '../constants/schemaConstants'
import { PROJECTS_TYPES } from '../constants/constants'

const ProjectsSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        url: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            default: 'additional',
            enum: PROJECTS_TYPES
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

export default mongoose.models.Projects ||
    mongoose.model(schemaNameConstants.ProjectsSchema, ProjectsSchema)