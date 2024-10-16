import mongoose from 'mongoose'

import schemaNameConstants from '../constants/schemaConstants'

const languageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models[schemaNameConstants.languagesSchema] ||
    mongoose.model(schemaNameConstants.languagesSchema, languageSchema)
