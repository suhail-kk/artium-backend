import cors from 'cors';
import 'express-async-errors';
import express, { Express, Request, Response, NextFunction } from 'express';

import { ENV } from '@/lib/config/env';
import { routesv1 } from '@/lib/routes';
import { NotFoundError } from '@/lib/utils/errors/errors';
import { errorHandler } from '@/lib/middlewares/error.middleware';

const app: Express = express();

const corsOptions = {
	credentials: true,
	origin: ENV.ALLOW_ORIGINS,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define your API routes
app.use('/api/v1', routesv1);

app.use(
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	})
);

// Catch-all for undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
	next(new NotFoundError()); // Pass error to next middleware (error handler)
});

// Global error handler
app.use(errorHandler as any);
export { app };
