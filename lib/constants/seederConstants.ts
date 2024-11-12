import seedRoles from '@/lib/seeders/roleSeeder';
import seedVideoTypes from '@/lib/seeders/videoTypeSeeder';
import seedDeliveryTypes from '@/lib/seeders/deliveryTypeSeeder';
import seedCreatorsCount from '@/lib/seeders/creatorsCountSeeder';
import seedLanguages from '@/lib/seeders/languages.seeder';

const SEED_ROLES = 'SEED_ROLES';
const VIDEO_TYPES = 'VIDEO_TYPES';
const DELIVERY_TYPES = 'DELIVERY_TYPES';
const CREATORS_COUNT = 'CREATORS_COUNT';
const LANGUAGES = 'LANGUAGES';

export default [
	{
		name: SEED_ROLES,
		func: seedRoles,
		description: 'Inserting creators, brand ,admin roles',
	},
	{
		name: VIDEO_TYPES,
		func: seedVideoTypes,
		description: 'Inserting video types for creating campaigns',
	},
	{
		name: DELIVERY_TYPES,
		func: seedDeliveryTypes,
		description: 'Inserting delivery types for creating campaigns',
	},
	{
		name: CREATORS_COUNT,
		func: seedCreatorsCount,
		description: 'Inserting creators count for creating campaigns',
	},
	{
		name: LANGUAGES,
		func: seedLanguages,
		description: 'seeding common languages',
	},
];
