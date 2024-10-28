import { Types } from 'mongoose'

export interface IAdditionalProjects {
    url: string,
    title: string,
    user_id: Types.ObjectId
}
