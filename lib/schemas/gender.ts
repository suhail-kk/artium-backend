import mongoose from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const genderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.genderSchema] ||
  mongoose.model(schemaConstants?.genderSchema, genderSchema);
