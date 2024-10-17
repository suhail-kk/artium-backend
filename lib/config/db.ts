import mongoose, { mongo } from 'mongoose';
import { MONGO_URL } from '@/lib/constants/envConstants';

export default async function connectDB() {
	if (!MONGO_URL) {
		console.error('MongoDB URI is missing from environment variables');
		throw new Error('No MONGODB URI');
	}

	try {
		mongoose.set('strictQuery', false);
		await mongoose.connect(MONGO_URL);
		console.log('✅ MongoDB connected!');
	} catch (e) {
		console.error('Error connecting to MongoDB', e);
		throw e;
	}
}
