import { Types } from 'mongoose'

export interface IApplicant {
    rating: number,
    status: string,
    user_id: Types.ObjectId
    campaign_id: Types.ObjectId,
    camapaign_status?: String,
    campaign_end_date?: Date
}

export interface IUpdateApplicant {
    rating: number,
    status: string,
    campaign_id: Types.ObjectId,
    camapaign_status?: String,
    campaign_end_date?: Date
}

export interface IUpdateApplicantTrack {
    campaign_id?: Types.ObjectId,
    camapaign_status?: String,
    campaign_end_date?: Date
}
