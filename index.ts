import {app} from '@/app'
import { PORT } from '@/lib/constants/envConstants'
import { connectDB } from './lib/config/db';
const start = async () => {
	//Mongoose DB Connection

	  await connectDB()
	  //starting server
	app.listen(PORT, () => {
	  console.log(`Listenting to port ${PORT}!✅`)
	})
  }
  start()