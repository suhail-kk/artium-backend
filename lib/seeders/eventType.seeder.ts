import EventType from '@/lib/services/eventType.service'

export default async function seedEventType() {
    await EventType.bulkInsert([
        {
            name: "Single",
        },
        {
            name: "Pair"
        },
        {
            name: "Group",
        },
    ])
}
