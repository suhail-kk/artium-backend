import mongoose from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const eventType = new mongoose.Schema(
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

export default mongoose.models[schemaConstants?.eventType] ||
  mongoose.model(schemaConstants?.eventType, eventType);
