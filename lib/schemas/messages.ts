import mongoose from "mongoose";
const { Schema, Document } = mongoose;
import schemaNameConstants from '@/lib/constants/schemaConstants';
import { retrieveFile } from "../utils/storage.utils";


export interface Offer{
    brief:string,
    amount:number,
    status:string
}
const offerTypeEnum = Object.freeze({
    OFFER: "Offer",
    TEXT: "Text",
    FILE: "Video",
  });
export interface MessageAttributes {
  chat_id?: mongoose.Types.ObjectId;
  sender_id: mongoose.Schema.Types.ObjectId;
  message?: string;
  file?: string;
  file_type?: string;
  is_uploaded?: boolean;
  is_forwarded?: boolean | null;
  reply_To?: number | null;
  seen?: boolean;
  createdAt?: Date;
  updateAt?: Date;
  isDeleted?: boolean;
  thumbnail_url?: string | null;
  video_url?: string | null;
  stream_url?: string | null;
  type:string ;
  offer?:Offer
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
        brief:String,
        amount:Number,
        status:{
          type:String,
         }
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
