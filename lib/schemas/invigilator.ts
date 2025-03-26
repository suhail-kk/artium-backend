import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const invigilatorSchema = new mongoose.Schema(
  {
    user_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.userSchema,
    },
    is_approved: {
      type: Boolean,
      default: false,
      required: true,
    },
    is_invited: {
      type: Boolean,
      default: false,
      required: true,
    },
    assigned_events: {
      type: [Schema.Types.ObjectId],
      ref: schemaConstants.eventSchema,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.invigilatorSchema] ||
  mongoose.model(schemaConstants?.invigilatorSchema, invigilatorSchema);
