import creatorsCountServices from '@/lib/services/creatorsCount.services'

export default async function seedCreatorsCount() {
    await creatorsCountServices.bulkInsert([
        {
            creators_count: '<5',
        },
        {
            creators_count: '5-10',
        },
        {
            creators_count: '10-20',
        },
        {
            creators_count: '>20',
        },
    ])
}
