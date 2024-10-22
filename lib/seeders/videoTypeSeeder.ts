import videoTypeServices from '@/lib/services/videoType.services'

export default async function seedVideoTypes() {
    await videoTypeServices.bulkInsert([
        {
            video_type: 'Testimonials',
        },
        {
            video_type: 'Unboxing',
        },
        {
            video_type: 'Product Review',
        },
        {
            video_type: 'Tutorials',
        },
        {
            video_type: 'Hashtags/Challenges',
        },
        {
            video_type: 'Before/After',
        },
    ])
}
