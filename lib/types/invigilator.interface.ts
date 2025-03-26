import { Types } from 'mongoose'

export interface IInvigilator {
    user_id: Types.ObjectId,
    is_approved: Boolean,
    assigned_events?: Types.ObjectId[],
}

export interface IUpdateInvigilator {
    is_approved?: string,
    user_id?: Types.ObjectId,
    assigned_events?: Types.ObjectId[],
}

export interface IUpdateInvigilatorStatus {
    is_approved: string,
}
