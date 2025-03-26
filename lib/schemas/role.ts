import mongoose from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.roleSchema] ||
  mongoose.model(schemaConstants?.roleSchema, roleSchema);
