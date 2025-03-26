import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const resultSchema = new mongoose.Schema(
  {
    event_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.eventSchema,
    },
    is_published: {
      required: true,
      type: String,
      default: false
    },
    results: {
      required: true,
      type: [
        {
          mark: {
            type: Number,
            required: true,
          },
          user_id: {
            required: true,
            type: Schema.Types.ObjectId,
            ref: schemaConstants.userSchema,
          },
          remarks: {
            type: String,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.resultSchema] ||
  mongoose.model(schemaConstants?.resultSchema, resultSchema);
