import 'express-async-errors';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { routesv1 } from './lib/routes';
import { NotFoundError } from './lib/utils/errors/errors';
import { errorHandler } from './lib/middlewares/error.middleware'; // Import your error handler

const app: Express = express();

app.use(
	cors({
		credentials: true,
		origin: '*',
		optionsSuccessStatus: 200,
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define your API routes
app.use('/api/v1', routesv1);

// Catch-all for undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
	next(new NotFoundError()); // Pass error to next middleware (error handler)
});

// Global error handler
app.use(errorHandler as any);
export { app };
