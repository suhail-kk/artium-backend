import mongoose, { Schema } from 'mongoose'
import schemaNameConstants from '@/lib/constants/schemaConstants'
import { CAMPAIGN_STATUS } from '@/lib/constants/constants'

const campaignsSchema = new mongoose.Schema(
    {
        brand_id: {
            type: Schema.Types.ObjectId,
            ref: schemaNameConstants.brandSchema,
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: schemaNameConstants.userSchema,
        },
        campaign_title: {
            type: String,
            required: true,
        },
        product_id: {
            type: Schema.Types.ObjectId,
            ref: schemaNameConstants.productSchema,
        },
        start_date: {
            type: String,
        },
        end_date: {
            type: String,
        },
        delivery_type: {
            type: Schema.Types.ObjectId,
            ref: schemaNameConstants.deliveryTypeSchema,
        },
        video_types: [
            {
                type: Schema.Types.ObjectId,
                ref: schemaNameConstants.videoTypeSchema,
            },
        ],
        video_duration: {
            type: String,
        },
        reference_link: [
            {
                type: String,
            },
        ],
        video_notes: {
            type: String,
        },
        video_script: {
            type: String,
        },
        campaign_description: {
            type: String,
        },
        campaign_status: {
            type: String,
            default: 'Ongoing',
            enum: CAMPAIGN_STATUS,
        },
        number_of_creators: {
            type: String,
            ref: schemaNameConstants.creatorsCount,
        },
        min_price: {
            type: String,
        },
        max_price: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

export default mongoose.models.campaigns ||
    mongoose.model('campaigns', campaignsSchema)
