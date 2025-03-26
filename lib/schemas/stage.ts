import mongoose from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const stagesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    image: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.stagesSchema] ||
  mongoose.model(schemaConstants?.stagesSchema, stagesSchema);
