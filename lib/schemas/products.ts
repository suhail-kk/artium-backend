import mongoose, { Schema } from 'mongoose'
import schemaNameConstants from '@/lib/constants/schemaConstants'
import { s3GetURL } from '../utils/s3utils'
import { IProduct } from '../types/products.interface'

const productsSchema = new mongoose.Schema<IProduct>({
    brand_id: {
        type: Schema.Types.ObjectId,
        ref: schemaNameConstants.brandSchema,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: schemaNameConstants.userSchema,
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
    }
},
    // {
    //     virtuals: true,
    //     toJSON: { virtuals: true },
    //     toObject: {
    //         virtuals: true
    //     }
    // },
)

// productsSchema.virtual("product_image_url").get(function () {
//     if (this.product_image_key) return s3GetURL(this.product_image_key)
//         else null
// })

export default mongoose.models.products ||
    mongoose.model('products', productsSchema)
