import mongoose from "mongoose";
const { Schema } = mongoose;
import schemaNameConstants from '@/lib/constants/schemaConstants';

export interface Participant {
  userId?: number | undefined;

}
export interface conversationsAttributes {
  participants: Participant[];
  conversation_name?: string;
  type: string;
  unreadBy?: Participant[];
  archivedBy?: Participant[];
  deletedBy?: Array<{
    userId: number;
    deletedAt: Date;
    status: boolean;
  }>;
  latestMessageId?: mongoose.Types.ObjectId;
  latestMessageCreatedAt?: Date;
}

const typeEnum = Object.freeze({
  ONE_TO_ONE: "one-to-one",
  GROUP: "group",
});

const conversationSchema = new Schema<conversationsAttributes>(
  {

    participants: [],
    conversation_name: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(typeEnum),
    },
    unreadBy: [],
    deletedBy: [
      {
        userId: { type: Number, ref: "users" },
        deletedAt: { type: Date },
        status: { type: Boolean },
      },
    ],
    latestMessageId: { type: mongoose.Types.ObjectId, ref: "messages" },
  },
  {
    timestamps: true,
    virtuals: true,
    toJSON: { virtuals: true, getters: true }, // Include virtuals and getters
    toObject: { virtuals: true, getters: true }, // Include virtuals and getters
  }
);

conversationSchema.index({ participants: 1, latestMessageCreatedAt: -1 });
export default mongoose.models[schemaNameConstants?.conversationSchema] ||
	mongoose.model(schemaNameConstants?.conversationSchema, conversationSchema);
