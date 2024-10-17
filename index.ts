import { app } from '@/app';
import { PORT } from '@/lib/constants/envConstants';
import connectDB from '@/lib/config/db';

(async function start() {
	await connectDB();
	app.listen(PORT, () => console.log(`✅ Listenting to port ${PORT}!`));
})();
