import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const applicantSchema = new mongoose.Schema(
  {
    event_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.eventSchema,
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

export default mongoose.models[schemaConstants?.applicantSchema] ||
  mongoose.model(schemaConstants?.applicantSchema, applicantSchema);
