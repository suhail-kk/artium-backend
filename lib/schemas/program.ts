import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const programSchema = new mongoose.Schema(
  {
    program_name: {
      type: String,
      require: true,
    },
    program_type: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.programType,
    },
    organized_by: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    contact_info: {
      type: String,
      required: true,
    },
    dead_line: {
      type: String,
      required: true,
    },
    from_date: {
      type: String,
      required: true,
    },
    is_published: {
      type: Boolean,
      default: false,
      required: true,
    },
    registration_status: {
      type: Boolean,
      default: false,
      required: true,
    },
    to_date: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
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

export default mongoose.models[schemaConstants?.programSchema] ||
  mongoose.model(schemaConstants?.programSchema, programSchema);
