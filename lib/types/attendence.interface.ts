import { Types } from 'mongoose'

export interface IAttendence {
    event_id: Types.ObjectId,
    attendees: Types.ObjectId[],
    absentees: Types.ObjectId[],
}

export interface IUpdateAttendence {
    event_id?: Types.ObjectId,
    attendees?: Types.ObjectId[],
    absentees?: Types.ObjectId[],
}
