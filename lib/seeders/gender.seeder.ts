import Gender from '@/lib/services/gender.service'

export default async function seedGender() {
    await Gender.bulkInsert([
        {
            name: 'Male',
        },
        {
            name: 'Femal',
        },
    ])
}
