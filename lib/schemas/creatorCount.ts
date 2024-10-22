import mongoose from 'mongoose'

const creatorCountSchema = new mongoose.Schema({
    creators_count: {
        type: String,
        required: true,
    },
})

export default mongoose.models.CreatorsCount ||
    mongoose.model('CreatorsCount', creatorCountSchema)
