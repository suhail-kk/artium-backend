import mongoose from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const teamSchema = new mongoose.Schema(
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

export default mongoose.models[schemaConstants?.teamSchema] ||
  mongoose.model(schemaConstants?.teamSchema, teamSchema);
