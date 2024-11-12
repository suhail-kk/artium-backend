import mongoose from "mongoose";
const { Schema, Document } = mongoose;
import schemaNameConstants from '@/lib/constants/schemaConstants';
import { retrieveFile } from "../utils/storage.utils";
import { OFFER_STATUSES } from "../constants/constants";

export interface Offer{

    amount:number,
    status:string,
    delivery_duration:number
}
const offerTypeEnum = Object.freeze({
    OFFER: "Offer",
    TEXT: "Text",
    FILE: "Video",
  });
export interface MessageAttributes {
  _id?:mongoose.Schema.Types.ObjectId,
  chat_id?: mongoose.Schema.Types.ObjectId;
  sender_id?: mongoose.Types.ObjectId;
  message?: string;
  file?: string;
  file_type?: string;
  is_uploaded?: boolean;
  is_forwarded?: boolean | null;
  reply_To?: MessageAttributes;
  seen?: boolean;
  createdAt?: Date;
  updateAt?: Date;
  isDeleted?: boolean;
  thumbnail_url?: string | null;
  video_url?: string | null;
  stream_url?: string | null;
  type?:string ;
  offer?:Offer;
  parentOfferId?:mongoose.Schema.Types.ObjectId;
  approved?:boolean
}

const messageSchema = new Schema<MessageAttributes>(
  {
    chat_id: mongoose.Types.ObjectId,
    sender_id: { type: Schema.Types.ObjectId, ref: "users"},
    message: String,
    file: String,
    file_type: String,
    is_uploaded: Boolean,
    is_forwarded: Boolean,
    reply_To: { type: Schema.Types.ObjectId, ref: "messages", default: null },
    seen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    thumbnail_url: { type: String, default: null },
    video_url: { type: String, default: null },
    stream_url: { type: String, default: null },
    createdAt: Date,
    updateAt: Date,
    type: {
        type: String,
        enum: Object.values(offerTypeEnum),
        required:true
      },
      offer:{
        amount:Number,
        status:{
          type:String,
          enum: OFFER_STATUSES,
         },
         delivery_duration:Number
      },
      parentOfferId:{
        type: Schema.Types.ObjectId,
        ref:schemaNameConstants.messageSchema
      },
      approved:{
        type:Boolean,
        default:false
      }
  },
  {
    timestamps: true, // Add timestamps to the schema
    virtuals: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

messageSchema.virtual("url").get(function () {
  if (this.file) return retrieveFile.publicUrl(this.file);
  return null;
});

export default mongoose.models[schemaNameConstants?.messageSchema] ||
	mongoose.model(schemaNameConstants?.messageSchema, messageSchema);
