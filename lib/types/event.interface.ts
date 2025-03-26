import { Types } from 'mongoose'

export interface IEvent {
    date: string,
    name: string,
    time: string,
    rules: string,
    image: string,
    ideal_for: string,
    type: Types.ObjectId,
    program: Types.ObjectId,
    stage: Types.ObjectId,
    is_published: boolean,
    invigilator: Types.ObjectId,
    maxium_num_participants: number,
}

export interface IUpdateEvent {
    date?: Date,
    name?: string,
    time?: string,
    rules?: string,
    image?: string,
    ideal_for?: string,
    type?: Types.ObjectId,
    stage?: Types.ObjectId,
    program: Types.ObjectId,
    is_published?: boolean,
    invigilator?: Types.ObjectId,
    maxium_num_participants?: number,
}

export interface IUpdateEventStatus {
    status: string
}

export interface IUpdatePublish {
    is_published: boolean,
}