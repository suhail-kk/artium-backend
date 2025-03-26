import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const profileDetailsSchema = new mongoose.Schema(
  {
    user_id: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.userSchema,
    },
    department: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.departmentSchema,
    },
    team: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.teamSchema,
    },
    gender: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.genderSchema,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.profileDetailsSchema] ||
  mongoose.model(schemaConstants?.profileDetailsSchema, profileDetailsSchema);
