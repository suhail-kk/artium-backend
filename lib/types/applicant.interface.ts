import { Types } from 'mongoose'

export interface IApplicant {
    event_id: Types.ObjectId,
    user_id: Types.ObjectId,
}
