import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.roleSchema,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.userSchema] ||
  mongoose.model(schemaConstants?.userSchema, userSchema);
