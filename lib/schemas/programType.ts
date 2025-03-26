import mongoose from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const programType = new mongoose.Schema(
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

export default mongoose.models[schemaConstants?.programType] ||
  mongoose.model(schemaConstants?.programType, programType);
