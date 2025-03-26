import mongoose, { Schema } from "mongoose";
import schemaNameConstants from "../constants/schemaConstants";

const dbSeederSchema = new Schema(
  {
    seeder_name: {
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
export default mongoose.models?.dbSeederSchema ||
  mongoose.model(schemaNameConstants.dbSeederSchema, dbSeederSchema);
