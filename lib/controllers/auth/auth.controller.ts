import { NextFunction, Request, Response } from 'express';
import {
	generateHashPassword,
	validatePassword,
} from '@/lib/utils/passwordUtils';
import userServices, { getUserMe } from '@/lib/services/auth.services';
import { ICreateUser } from '@/lib/types/user';
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler';
import { createUserJWT, verifyJWTToken } from '@/lib/utils/jwtUtils';
import brandService from '@/lib/services/brand.service';
import { IUser, IBrand, IbrandObject } from '@/lib/types/user';
import { BadRequestError } from '@/lib/utils/errors/errors';
import roleService from '@/lib/services/role.service';
import mongoose from 'mongoose';


const prepareBrandData = async (
	firstName: string,
	lastName:string,
	email: string,
	password: string,
	brand: IbrandObject,
	lead_description: string,
	role_id: string,
	location: string
): Promise<ICreateUser> => {
	try {
		const data: IBrand = {
			title: brand?.title,
			instagramLink: brand?.instagram_link,
			brandDescription: brand?.brand_description,
		};
		const brandData = await brandService.createBrand(data);
		const hashedPassword = await generateHashPassword(password);

		const Data: ICreateUser = {
			email: email,
			firstName: firstName,
			lastName:lastName,
			password: hashedPassword,
			role: role_id,
			brandId: brandData?._id,
			location: location,
			leadDescription: lead_description,
			is_verified: true,
		};
		return Data;
	} catch (error) {
		console.log(error);
		throw new Error('Failed to prepare brand data.');
	}
};
const prepareCreatorData = async (
	email: string,
	firstName: string,
	lastName:string,
	password: string,
	location: string,
	lead_description: string,
	role_id: string
): Promise<ICreateUser> => {
	try {
		const hashedPassword = await generateHashPassword(password);
		const userData = {
			email: email,
			firstName: firstName,
			lastName:lastName,
			password: hashedPassword,
			role: role_id,
			location: location,
			leadDescription: lead_description,
			is_verified: true,
		};
		return userData;
	} catch (error) {
		console.log(error, 'ee');

		throw new Error('Failed to prepare brand data.');
	}
};
const parseName=(name:string)=>{
	const parsedName=name.trim().split(" ")
	return{
		firstName:parsedName[0],
		lastName:parsedName?.length>1?parsedName.slice(1).join(""):""
	}
}
export const registerUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const {
			name,
			email,
			password,
			role_name,
			brand,
			location,
			lead_description,
		} = req.body;
		const userRole: IUser = await roleService.FindRoleDetailsByName(role_name);
		if (!userRole) {
			throw new BadRequestError('Invalid user role');
		}
		const {firstName,lastName}=parseName(name)
		const userwithEmail = await userServices.checkUser({
			email: email,
			deletedAt: null,
			role:new mongoose.Types.ObjectId(userRole._id)
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


		// prepare user data as per role
		let userData: ICreateUser | undefined;
		if (role_name === 'Creator') {
			userData = await prepareCreatorData(
				email,
				firstName,
				lastName,
				password,
				location,
				lead_description,
				userRole?._id
			);
		} else if (role_name === 'Brand') {
			if (brand) {
				const brandDetails: IBrand = await brandService.findBrandDetails(
					brand.title
				);
				if (brandDetails) {
					return res.status(400).json({
						isError: true,
						errors: [
							{
								msg: 'Company already registered',
								path: 'companyName',
							},
						],
					});
				}
				userData = await prepareBrandData(
					firstName,
					lastName,
					email,
					password,
					brand,
					lead_description,
					userRole._id,
					location
				);
			}
		} else {
			throw new BadRequestError('Invalid request data');
		}
		if (!userData) {
			throw new BadRequestError('Invalid user data');
		}
		const createdUserData = await userServices.createUser(userData);
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
		const { email, password ,role_name} = req.body;
		const userRole: IUser = await roleService.FindRoleDetailsByName(role_name);
		if (!userRole) {
			throw new BadRequestError('Invalid user role');
		}
		const user = await userServices.checkUser({
			email: email,
			deletedAt: null,
			role:new mongoose.Types.ObjectId(userRole._id)
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

		const sessionOptions = {
			token: jwtToken,
			refreshToken: refreshToken,
		};
		req.session = sessionOptions;

		sendSuccessResponse(res, 'Token created', {
			jwtToken,
			refreshToken: newRefreshToken,
		});
	} catch (error) {
		next(error);
	}
};

export const logoutUser = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		req.session = {
			refreshToken: '',
			token: '',
		};
		sendSuccessResponse(res, 'Logout success.');
	} catch (error) {
		next(error);
	}
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { _id } = req?.user;
		const user: any = await getUserMe(_id);
		
		if (!user) throw new BadRequestError("User doesn't exists");
		sendSuccessResponse(res, 'Success', user[0]);
	} catch (error) {
		next(error);
	}
};
