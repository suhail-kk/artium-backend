import { Types } from 'mongoose'

export interface ICampaign {
    campaign_description: string
    brand_id: Types.ObjectId
    user_id: Types.ObjectId
    campaign_title: string
    product_id: Types.ObjectId
    start_date: string
    end_date: string
    delivery_type: Types.ObjectId,
    video_types: []
    video_duration: string
    reference_link: []
    video_notes: string
    video_script: string
    campaign_status: string
    number_of_creators: string
    min_price: string
    max_price: string
    logo_image_key: string
}

export interface IUpdateCampaign {
    campaign_description?: string
    brand_id?: Types.ObjectId
    user_id?: Types.ObjectId
    campaign_title?: string
    product_id?: Types.ObjectId
    start_date?: string
    end_date?: string
    delivery_type?: Types.ObjectId
    video_types?: []
    video_duration?: string
    reference_link?: []
    video_notes?: string
    video_script?: string
    campaign_status?: string
    number_of_creators?: string
    min_price?: string
    max_price?: string
    logo_image_key?: string
}
