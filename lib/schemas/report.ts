import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const reportSchema = new mongoose.Schema(
  {
    reported_user: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.userSchema,
    },
    reporting_user: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.userSchema,
    },
    event_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.eventSchema,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Opened",
      enum: ["Opened", "Closed", "Not Fixed",]
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.reportSchema] ||
  mongoose.model(schemaConstants?.reportSchema, reportSchema);
