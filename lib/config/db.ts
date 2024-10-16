import mongoose, { Connection } from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI)
	throw new Error(
		'Please define the MONGODB_URI environment variable inside .env.local'
	);

const uri: string = MONGODB_URI;

// Define an interface for the cached object
// interface CachedMongoose {
//     conn: Connection | null;
//     promise: Promise<Connection> | null;
// }

// // Using type assertions to define cached variable correctly
// let cached: CachedMongoose = globalThis.mongoose || { conn: null, promise: null };

// if (!globalThis.mongoose) {
//     globalThis.mongoose = cached; // Assign the cached object to globalThis.mongoose
// }

async function dbConnect(): Promise<Connection> {
	// if (cached.conn) return cached.conn;

	// if (!cached.promise) {
	const opts = { bufferCommands: false };

	// Create the promise and specify the type
	// cached.promise =
	mongoose.set('strictQuery', false);
	const conn = mongoose.connect(uri, opts).then((mongoose) => {
		console.log('✅ Connected to MongoDB');
		return mongoose.connection; // Return the connection
	});
	// }

	// try {
	//     cached.conn = await cached.promise;
	// } catch (e) {
	//     cached.promise = null;
	//     throw e; // Re-throw the error for further handling
	// }

	// return cached.conn;
	return conn;
}

export default dbConnect;
