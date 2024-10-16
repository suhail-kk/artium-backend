import mongoose, { Schema } from 'mongoose'
import schemaNameConstants from '@/lib/constants/schemaConstants'

const productsSchema = new mongoose.Schema({
    brand_id: {
        type: Schema.Types.ObjectId,
        ref: schemaNameConstants.brandSchema,
    },
    product_title: {
        type: String,
        required: true,
    },
    product_image_key: {
        type: String,
    },
    product_url: {
        type: String,
    },
    product_description: {
        type: String,
    },
})

export default mongoose.models.products ||
    mongoose.model('products', productsSchema)
