import mongoose from "mongoose";
const { Schema } = mongoose;
import schemaNameConstants from '@/lib/constants/schemaConstants';
import { userTypes } from "../types/user";
export interface IParticipant {
  id: mongoose.Types.ObjectId|string;
  type:{type:string,enum:userTypes},
  unreadBy?:boolean,
  deletedBy?:boolean
  archivedBy?:boolean

}
export interface conversationsAttributes {
  participants: IParticipant[];
  conversation_name?: string;
  type: string;
  latestMessageId?: mongoose.Types.ObjectId;
  latestMessageCreatedAt?: Date;
  campaignId:mongoose.Types.ObjectId;

}

const typeEnum = Object.freeze({
  ONE_TO_ONE: "one-to-one",
  GROUP: "group",
});

const conversationSchema = new Schema<conversationsAttributes>(
  {

    participants: [{
      id: {type:Schema.Types.ObjectId},
      type:{type:String,enum:userTypes},
      unreadBy:{type:Boolean,default:false},
      deletedBy:{type:Boolean,default:false},
      archivedBy:{type:Boolean,default:false},
      _id: false 
    }],
    type: {
      type: String,
      enum: Object.values(typeEnum),
      required:true
    },
    latestMessageId: { type: mongoose.Types.ObjectId, ref: "messages" },
    campaignId:{type:Schema.Types.ObjectId,ref:schemaNameConstants?.campaignsSchema}
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
