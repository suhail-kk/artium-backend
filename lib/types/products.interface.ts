import { Types } from 'mongoose'

export interface IProduct {
    product_url: string
    product_title: string
    product_image_key: string
    product_description: string
    brand_id: Types.ObjectId
}
