import { Types } from "mongoose";

export interface ICreateRequest {
    type: string,
    data: Object,
    sender: Types.ObjectId,
    recipient: Types.ObjectId,
}
