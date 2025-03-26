import mongoose, { Schema } from "mongoose";
import schemaConstants from "@/lib/constants/schemaConstants";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    recipient: {
      type: [Schema.Types.ObjectId],
      ref: schemaConstants.userSchema,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: schemaConstants.userSchema,
      default: null,
    },
    type: {
      type: String,
      enum: ["info", "warning", "error", "success"],
      default: "info",
    },
    status: {
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    readAt: {
      type: Date,
      default: null,
    },
    link: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models[schemaConstants?.notificationSchema] ||
  mongoose.model(schemaConstants?.notificationSchema, notificationSchema);
