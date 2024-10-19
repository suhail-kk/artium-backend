import { app } from '@/app';
import { ENV } from '@/lib/config/env';
import connectDB from '@/lib/config/db';

(async function start() {
	await connectDB();
	app.listen(ENV.PORT, () => console.log(`✅ Listenting to port ${ENV.PORT}!`));
})();
