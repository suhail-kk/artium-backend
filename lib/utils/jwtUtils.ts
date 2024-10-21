import { ENV } from '@/lib/config/env';
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken';
import { createUserJWTInterface } from '@/lib/types/createJwt.interface';

const JWT_EXPIRES_IN = '2h';
const REFRESH_EXPIRES_IN = '30d';

export const createUserJWT = (params: createUserJWTInterface | JwtPayload) => {
	const jwtBody = {
		id: params._id,
		email: params?.email,
	};
	const jwtTokenOptins = {
		expiresIn: JWT_EXPIRES_IN,
	};
	const refreshTokenOptions = {
		expiresIn: REFRESH_EXPIRES_IN,
	};

	const jwtToken = jsonwebtoken.sign(jwtBody, ENV.JWT_KEY!, jwtTokenOptins);
	const refreshToken = jsonwebtoken.sign(
		jwtBody,
		ENV.JWT_KEY!,
		refreshTokenOptions
	);
	return { jwtToken, refreshToken };
};

export const verifyJWTToken = (token: string): JwtPayload | string => {
	const decoded = jsonwebtoken.verify(token, ENV.JWT_KEY!);
	return decoded;
};
