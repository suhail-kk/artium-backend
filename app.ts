import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { routesv1 } from './lib/routes';
import { NotFoundError } from './lib/utils/errors/errors';
const app: Express = express();

app.use(
  cors({
    credentials: true,
    origin: '*',
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define your API routes
app.use('/api/v1', routesv1);

// Catch-all for undefined routes
app.all('*', async (_req: Request, _res: Response, _next: NextFunction) => {
  throw new NotFoundError(); // This will trigger the errorHandler
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
