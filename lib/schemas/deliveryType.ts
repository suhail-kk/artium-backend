import mongoose from 'mongoose'

const deliveryTypeSchema = new mongoose.Schema({
    delivery_type: {
        type: String,
        required: true,
    },
})

export default mongoose.models.DeliveryTypes ||
    mongoose.model('DeliveryTypes', deliveryTypeSchema)
