import { Types } from 'mongoose'

export interface IResult {
    event_id: Types.ObjectId,
    results: {
        mark: number,
        user_id: Types.ObjectId,
        remarks?: string
    }[],
}

export interface IUpdateResult {
    results: {
        mark?: number,
        user_id?: Types.ObjectId,
        remarks?: string
    }[],
}

export interface IUpdateResultStatus {
    is_published: boolean
}