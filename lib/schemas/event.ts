import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    program: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.programSchema,
    },
    type: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: schemaConstants.eventType,
    },
    ideal_for: {
      required: true,
      type: String,
    },
    stage: {
      type: Schema.Types.ObjectId,
      ref: schemaConstants.stagesSchema,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    invigilator: {
      type: Schema.Types.ObjectId,
      ref: schemaConstants.invigilatorSchema,
    },
    status: {
      type: String,
      default: "Not Started",
      enum: ["Not Started", "Inprogress", "Completed", "Cancelled"],
    },
    is_published: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: String,
    },
    maxium_num_participants: {
      type: Number,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.eventSchema] ||
  mongoose.model(schemaConstants?.eventSchema, eventSchema);
