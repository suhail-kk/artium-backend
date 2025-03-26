import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const attendenceSchema = new mongoose.Schema(
  {
    event_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.eventSchema,
    },
    a: {
      required: true,
      type: [Schema.Types.ObjectId],
      ref: schemaConstants.userSchema,
    },
    absentees: {
      required: true,
      type: [Schema.Types.ObjectId],
      ref: schemaConstants.userSchema,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.attendenceSchema] ||
  mongoose.model(schemaConstants?.attendenceSchema, attendenceSchema);
