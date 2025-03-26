import mongoose, { Types } from 'mongoose';
import { NextFunction, Request, Response } from 'express';

import {
	generateHashPassword,
	validatePassword,
} from '@/lib/utils/passwordUtils';
import roleService from '@/lib/services/role.service';
import { BadRequestError } from '@/lib/utils/errors/errors';
import userServices, { getUserMe } from '@/lib/services/auth.services';
import { createUserJWT, verifyJWTToken } from '@/lib/utils/jwtUtils';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';

export const registerUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			role,
			email,
			password,
			full_name,
		} = req.body;

		const userRole = await roleService.checkExist(role);
		if (!userRole) {
			throw new BadRequestError('Invalid user role');
		}

		const userwithEmail = await userServices.checkUser({
			email,
			role
		});


		if (userwithEmail) {
			return res.status(400).json({
				isError: true,
				errors: [
					{
						msg: 'User with this email already exist',
						path: 'email',
					},
				],
			});
		}

		const payload = {
			role,
			email,
			full_name,
			password: await generateHashPassword(password),
		}
		if (!payload) {
			throw new BadRequestError('Invalid user data');
		}
		const createdUserData = await userServices.createUser(payload);
		sendSuccessResponse(res, 'Success', createdUserData);
	} catch (error) {
		console.log(error);
		next(error);
	}
};

declare module 'express-serve-static-core' {
	interface Request {
		session: {
			token: string;
			refreshToken: string;
		};
	}
}

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const { email, password, role } = req.body;
		const userRole = await roleService.checkExist(role);
		if (!userRole) {
			throw new BadRequestError('Invalid user role');
		}

		const user = await userServices.checkUser({
			email,
			role
		});
		if (!user)
			return res.status(400).json({
				isError: true,
				errors: [
					{
						msg: 'This email is not registered. Please sign up or try again',
						path: 'email',
					},
				],
			});

		const isPasswordValid = await validatePassword(password, user?.password);

		if (!isPasswordValid)
			return res.status(400).json({
				isError: true,
				errors: [
					{
						msg: 'Invalid password. Please try again.',
						path: 'password',
					},
				],
			});

		const createUserJWTOptions = {
			_id: user?._id,
			email: user?.email,
		};

		const { jwtToken, refreshToken } = createUserJWT(createUserJWTOptions);

		const sessionOptions = {
			token: jwtToken,
			refreshToken: refreshToken,
		};
		req.session = sessionOptions;

		sendSuccessResponse(res, 'Logged in successfully', {
			accessToken: jwtToken,
			refreshToken,
			user: user,
		});
	} catch (error) {
		next(error);
	}
};

export const reGenereateToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		interface sessionInterface {
			token: string;
			refreshToken: string;
		}

		const session = req.session as sessionInterface;
		const body = req.body;
		const refreshToken = body.refreshToken || session.refreshToken;

		if (!refreshToken) throw new BadRequestError('No token provided');
		const decodeValue = verifyJWTToken(refreshToken);

		if (typeof decodeValue === 'string')
			throw new BadRequestError('Invalid token');
		const user = await userServices.getUserByEmail(decodeValue?.email);

		if (!user) throw new BadRequestError("User doesn't exists");

		const { jwtToken, refreshToken: newRefreshToken } =
			createUserJWT(decodeValue);

		res.cookie("accessToken", jwtToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 1000,
		});

		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});


		sendSuccessResponse(res, "Logged in successfully", {
			user: user,
		});
	} catch (error) {
		next(error);
	}
};

export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
	try {

		res.clearCookie("accessToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});

		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});

		sendSuccessResponse(res, "Logout successful.");
	} catch (error) {
		next(error);
	}
};


export const me = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { _id } = req?.user;
		const user: any = await getUserMe(new mongoose.Types.ObjectId(_id));

		if (!user) throw new BadRequestError("User doesn't exists");
		sendSuccessResponse(res, 'Success', user[0]);
	} catch (error) {
		next(error);
	}
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, role } = req.body;

		// Check if email and role are provided
		if (!email || !role) {
			throw new BadRequestError('Email and role are required');
		}

		const userRole = await roleService.checkExist(role);
		if (!userRole) {
			throw new BadRequestError('Invalid user role');
		}

		const userwithEmail = await userServices.checkUser({
			email,
			role
		});

		if (!userwithEmail) {
			throw new BadRequestError('User with the specified email and role does not exist');
		}

		// If user exists, send success response
		sendSuccessResponse(res, 'Email verified successfully. Proceed to reset the password.', userwithEmail);
	} catch (error) {
		next(error);
	}
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, role, password } = req.body;

		if (!email || !role || !password) {
			throw new BadRequestError('Email, role, and new password are required');
		}

		const userRole = await roleService.checkExist(role);
		if (!userRole) {
			throw new BadRequestError('Invalid user role');
		}

		const userwithEmail = await userServices.checkUser({
			email,
			role
		});


		if (!userwithEmail) {
			throw new BadRequestError('User with the specified email and role does not exist');
		}

		const payload = {
			password: await generateHashPassword(password)
		}

		await userServices.updatePassword(userwithEmail?._id, payload)

		sendSuccessResponse(res, 'Password updated successfully.', userwithEmail);
	} catch (error) {
		next(error);
	}
};