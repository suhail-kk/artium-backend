import mongoose from 'mongoose'

const videoTypeschema = new mongoose.Schema({
    video_type: {
        type: String,
        required: true,
    },
})

export default mongoose.models.VideoTypes ||
    mongoose.model('VideoTypes', videoTypeschema)
