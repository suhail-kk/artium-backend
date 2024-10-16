//external imports
const cors = require('cors');
const multer = require('multer');
const express = require('express');
const mongoose = require('mongoose');

require('dotenv/config');
import dbConnect from '@/lib/config/db';

// routes
import { DbSeedersRoutes } from '@/lib/routes/dbSeed';
import { router as authRoutes } from '@/lib/routes/auth';
import { CampaignRoutes } from '@/lib/routes/campaign/campaign.controller';

//app initialization
const app = express();
var upload = multer();

//middlewares
app.use(express.json());
app.use(upload.array());
app.use(
	cors({
		credentials: true,
		origin: '*',
		optionsSuccessStatus: 200,
	})
);
app.use(express.urlencoded({ extended: true }));

//route middlewares
app.use('/auth', authRoutes);
app.use('/api/seed', DbSeedersRoutes);
app.use('/api/campaign', CampaignRoutes);

//Page not found error handling middleware
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

// global error handling middleware
app.use(
	(
		err: { status: number; message: any; data: null },
		_req: any,
		res: {
			status: (arg0: any) => {
				(): any;
				new (): any;
				json: {
					(arg0: { type: string; message: any; data: any }): void;
					new (): any;
				};
			};
		},
		_next: any
	) => {
		console.log(err);
		const status = err.status || 500;
		const message = err.message || 'SERVER ERR';
		const data = err.data || null;
		res.status(status).json({
			type: 'error',
			message,
			data,
		});
	}
);

//main connection
async function main() {
	try {
		dbConnect();
		app.listen(process.env.PORT, function (err: any) {
			if (err) return console.log('⚠️', err);
			console.log('🖥️ ok on', process.env.PORT);
		});
	} catch (error) {
		console.log(error);
		process.exit(1);
	}
}
main();
