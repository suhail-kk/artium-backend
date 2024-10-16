import seedRoles from '@/lib/seeders/roleSeeder'
const SEED_ROLES = 'SEED_ROLES'
export default [
    {
        name: SEED_ROLES,
        func: seedRoles,
        description: 'Inserting creators, brand ,admin roles',
    }

]
