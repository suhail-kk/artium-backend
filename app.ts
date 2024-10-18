import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { routesv1 } from './lib/routes';
import { NotFoundError } from './lib/utils/errors/errors';
const app: Express = express();

// Define the CORS options
const corsOptions = {
	credentials: true,
	origin: ['http://localhost:3000', 'http://localhost:80'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define your API routes
app.use('/api/v1', routesv1);

// Catch-all for undefined routes
app.all('*', async (_req: Request, _res: Response, _next: NextFunction) => {
	console.log(_req.url);
	_res.send('API Not found');
	// throw new NotFoundError(); // This will trigger the errorHandler
});

// Global error handling middleware
app.use(
	'*',
	(
		_req: any,
		_res: any,
		next: (arg0: { status: number; message: string }) => void
	) => {
		const error = {
			status: 404,
			message: 'API_ENDPOINT_NOT_FOUND_ERR',
		};
		next(error);
	}
);

export { app };
