import { Types } from 'mongoose'

export interface IProfileDetails {
    image: string
    team: Types.ObjectId,
    gender: Types.ObjectId,
    user_id: Types.ObjectId,
    department: Types.ObjectId,
}
