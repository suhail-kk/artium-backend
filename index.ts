import {app} from '@/app'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();  
import { PORT } from '@/lib/constants/envConstants'
import { MONGO_URL } from '@/lib/constants/envConstants'

const start = async () => {
	//Mongoose DB Connection
	 async function connectDB() {
		if (!MONGO_URL) {
		  console.error('MongoDB URI is missing from environment variables');
		  throw new Error('No MONGODB URI');
		}
		try {
			mongoose.set('strictQuery', false); 
		  await mongoose.connect(MONGO_URL);
		  console.log('MongoDB Database connected successfully!✅✅');
		} catch (e) {
		  console.error('Error connecting to MongoDB', e);
		  throw e;
		}
	  }
	  connectDB()
	  //starting server
	app.listen(PORT, () => {
	  console.log(`Listenting to port ${PORT}!✅`)
	})
  
	process.on('SIGINT', function () {
	  process.exit(0)
	})
  }
  start()