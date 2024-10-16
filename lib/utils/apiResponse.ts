import { Response } from 'express';

const statusMessages: { [key: number]: string } = {
	200: 'OK',
	201: 'Created',
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	500: 'Internal Server Error',
};

// Function to create a standard response
export function createResponse(
	res: Response,
	{
		data,
		status = 200,
		meta = {},
		page = 1,
		size = null,
	}: {
		data: unknown;
		status?: number;
		meta?: unknown;
		page?: number;
		size?: null | number;
	}
) {
	res.status(status).json({
		status,
		message: statusMessages[status] || 'Success',
		data,
		meta,
		page,
		size,
	});
}

// Function to create a standard error response
export function createErrorResponse(
	res: Response,
	err: unknown,
	meta?: unknown
) {
	// Convert the error to an object if possible
	const error = JSON.parse(JSON.stringify(err)) || {};
	const status = error?.status || 500;
	const errorMessage =
		error.message || statusMessages[status] || 'An error occurred';

	res.status(status).json({
		status,
		message: errorMessage,
		error: error?.message || error || 'Unknown error',
		meta,
		timestamp: new Date().toISOString(),
	});
}
