import mongoose from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const departmentSchema = new mongoose.Schema(
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

export default mongoose.models[schemaConstants?.departmentSchema] ||
  mongoose.model(schemaConstants?.departmentSchema, departmentSchema);
