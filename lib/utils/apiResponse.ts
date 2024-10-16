import { NextResponse } from "next/server";

const statusMessages: { [key: string]: string } = {
    200: 'OK',
    201: 'Created',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
};

export default function createResponse(
    {
        data,
        status = 200,
        meta = {},
        page = 1,
        size = null
    }:
        {
            data: unknown,
            status?: number,
            meta?: unknown,
            page?: number,
            size?: null | number
        }
) {
    return NextResponse.json({
        status,
        message: statusMessages[status],
        data,
        meta,
        page,
        size
    }, { status })
}

export function createErrorResponse(err: unknown, meta?: unknown) {
    const error = JSON.parse(JSON.stringify(err))


    const status = error?.status || 500;
    const errorMessage = error.message || statusMessages[status] || 'An error occurred';

    return NextResponse.json({
        status,
        message: errorMessage,
        error: error?.message || error || 'Unknown error',
        meta,
        timestamp: new Date().toISOString(),
    }, {
        status,
        headers: { 'Content-Type': 'application/json' },
    })
}