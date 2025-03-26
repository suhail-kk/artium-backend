import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const programRegistrationSchema = new mongoose.Schema(
    {
        program_id: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: schemaConstants.programSchema,
        },
        user_id: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: schemaConstants.userSchema,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models[schemaConstants?.programRegistrationSchema] ||
    mongoose.model(schemaConstants?.programRegistrationSchema, programRegistrationSchema);
