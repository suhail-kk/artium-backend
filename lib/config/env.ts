import dotenv from 'dotenv';

dotenv.config();

type EnvConfig = {
	MONGO_URI: string;
	PORT: string;
	CLOUDFRONT_URL: string;
	S3_URL: string;
	BUCKET_NAME: string;
	ACCESS_KEY: string;
	SECRET_KEY: string;
	REGION: string;
	API_URL: string;
	NODE_ENV: string;
	APP_NAME: string;
	ALLOW_ORIGINS: string[];
	JWT_KEY: string;
};

const parseOrigins = (origins: string | undefined): string[] => {
	return origins ? origins.split(',').map((origin) => origin.trim()) : [];
};

const ENV: EnvConfig = {
	MONGO_URI: process.env.MONGO_URI || '',
	PORT: process.env.PORT || '3000',
	CLOUDFRONT_URL: process.env.CLOUDFRONT_URL || '',
	S3_URL: process.env.S3_URL || '',
	BUCKET_NAME: process.env.BUCKET_NAME || '',
	ACCESS_KEY: process.env.ACCESS_KEY || '',
	SECRET_KEY: process.env.SECRET_KEY || '',
	REGION: process.env.REGION || '',
	API_URL: process.env.NEXT_PUBLIC_API_URL || '',
	NODE_ENV: process.env.NODE_ENV || 'development',
	APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'MyApp',
	ALLOW_ORIGINS: parseOrigins(process.env.ALLOW_ORIGINS),
	JWT_KEY: process.env.JWT_KEY || '',
};

// Optional: Throw an error if critical env variables are missing (for server-side only vars)
if (!ENV.MONGO_URI) throw new Error('Missing environment variable: MONGO_URI');
if (!ENV.CLOUDFRONT_URL)
	throw new Error('Missing environment variable: CLOUDFRONT_URL');
if (!ENV.S3_URL) throw new Error('Missing environment variable: S3_URL');
if (!ENV.BUCKET_NAME)
	throw new Error('Missing environment variable: BUCKET_NAME');
if (!ENV.ACCESS_KEY)
	throw new Error('Missing environment variable: ACCESS_KEY');
if (!ENV.SECRET_KEY)
	throw new Error('Missing environment variable: SECRET_KEY');
if (!ENV.REGION) throw new Error('Missing environment variable: REGION');
if (!ENV.ALLOW_ORIGINS)
	throw new Error('Missing environment variable: ALLOW_ORIGINS');
if (!ENV.JWT_KEY) throw new Error('Missing environment variable: JWT_KEY');

export { ENV };
