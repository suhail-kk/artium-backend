import mongoose from "mongoose";
import { RequestTypes } from "@/lib/constants/constants";
import schemaConstants from "@/lib/constants/schemaConstants";

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: RequestTypes
    },
    recipient: {
      required: true,
      type: mongoose.Types.ObjectId,
      ref: schemaConstants.userSchema,
    },
    sender: {
      required: true,
      type: mongoose.Types.ObjectId,
      ref: schemaConstants.userSchema,
    },
    data: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.requestSchema] ||
  mongoose.model(schemaConstants?.requestSchema, requestSchema);
