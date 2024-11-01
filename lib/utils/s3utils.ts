import { ENV } from '@/lib/config/env';

var AWS = require('aws-sdk');

var credentials = {
	accessKeyId: ENV.ACCESS_KEY,
	secretAccessKey: ENV.SECRET_KEY,
};

AWS.config.update({ credentials, region: ENV.REGION, signatureVersion: 'v4' });
var s3 = new AWS.S3();

export const s3GetURL = (key: string) => {
	return s3.getSignedUrl('getObject', {
		Bucket: ENV.BUCKET_NAME,
		Key: key,
		Expires: 100,
	});
};

export const s3PutURL = (key: string) => {
	return s3.getSignedUrl('putObject', {
		Bucket: ENV.BUCKET_NAME,
		Key: key,
		Expires: 10000,
	});
};

export const s3DeleteURL = (key: string) => {
	return s3.getSignedUrl('deleteObject', {
		Bucket: ENV.BUCKET_NAME,
		Key: key,
		Expires: 10000,
	});
};

