import { Types } from 'mongoose'

export interface IApplicant {
    rating: number,
    status: string,
    user_id: Types.ObjectId
    campaign_id: Types.ObjectId,
}
