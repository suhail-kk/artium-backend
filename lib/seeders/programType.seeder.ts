import ProgramType from '@/lib/services/programType.service'

export default async function seedProgramType() {
    await ProgramType.bulkInsert([
        {
            name: "Arts"
        },
        {
            name: "Sports"
        },
        {
            name: "Academic"
        },
        {
            name: "Leadership Programs"
        },
        {
            name: "Technical and Vocational"
        },
        {
            name: "Social Programs"
        },
        {
            name: "Festivals"
        },
        {
            name: "Digital and Media"
        }
    ])
}
