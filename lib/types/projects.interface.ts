import { Types } from 'mongoose'

export interface IProjects {
    url: string,
    type: string,
    title: string,
    user_id: Types.ObjectId
}
