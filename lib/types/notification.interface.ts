import { Types } from 'mongoose'

export interface INotification {
    link: string,
    type: string,
    title: string,
    status: string,
    message: string,
    sender: Types.ObjectId,
    recipient: Types.ObjectId[],
}


export interface IUpdateNotificationReadStatus {
    status: string,
}
