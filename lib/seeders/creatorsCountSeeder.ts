import creatorsCountServices from '@/lib/services/creatorsCount.services'

export default async function seedCreatorsCount() {
    await creatorsCountServices.bulkInsert([
        {
            creators_count: '<5',
            rank: 1,
        },
        {
            creators_count: '5-10',
            rank: 2,
        },
        {
            creators_count: '10-20',
            rank: 3,
        },
        {
            creators_count: '>20',
            rank: 4,
        },
    ])
}
