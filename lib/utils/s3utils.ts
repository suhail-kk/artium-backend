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

export const deleteS3Object = (key: string) => {
	return new Promise((resolve, reject) => {
		const params: any = {
			Bucket: ENV.BUCKET_NAME,
			Key: key,
		};

		s3.deleteObject(params, function (err: any, data: any) {
			if (err) {
				console.log(err, err.stack); // an error occurred
				reject(err);
			} else {
				console.log(data); // successful response
				resolve(data);
			}
		});
	});
};