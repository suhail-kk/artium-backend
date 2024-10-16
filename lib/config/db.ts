import mongoose from 'mongoose'
import { MONGO_URL } from '@/lib/constants/envConstants'

export async function connectDB() {
  console.log(MONGO_URL, 'MMM'); // Ensure this logs correctly
  
  if (!MONGO_URL) {
    console.error('MongoDB URI is missing from environment variables');
    throw new Error('No MONGODB URI');
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log('MongoDB Database connected successfully!✅✅');
  } catch (e) {
    console.error('Error connecting to MongoDB', e);
    throw e;
  }
}