import mongoose from 'mongoose'

import schemaNameConstants from '../constants/schemaConstants'

const interestSchema = new mongoose.Schema(
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

export default mongoose.models[schemaNameConstants.interestsSchema] ||
    mongoose.model(schemaNameConstants.interestsSchema, interestSchema)
