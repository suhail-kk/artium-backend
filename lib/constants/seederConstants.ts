import seedRoles from '@/lib/seeders/role.seeder';
import seedGender from '@/lib/seeders/gender.seeder';
import seedEventType from '@/lib/seeders/eventType.seeder';
import seedProgramType from '@/lib/seeders/programType.seeder';

const SEED_ROLES = 'SEED_ROLES';
const SEED_GENDER = 'SEED_GENDER';
const SEED_EVENT_TYPE = 'SEED_EVENT_TYPE';
const SEED_PROGRAM_TYPE = "SEED_PROGRAM_TYPE"

export default [
	{
		name: SEED_ROLES,
		func: seedRoles,
		description: 'Inserting roles',
	},
	{
		name: SEED_GENDER,
		func: seedGender,
		description: 'Inserting genders',
	},
	{
		name: SEED_EVENT_TYPE,
		func: seedEventType,
		description: 'Inserting even type',
	},
	{
		name: SEED_PROGRAM_TYPE,
		func: seedProgramType,
		description: 'Inserting program type',
	},
];
