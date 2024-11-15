import User from '../schemas/user';
import Role from '../schemas/roles'; // Import Role model
import mongoose from 'mongoose';
import { s3GetURL } from '../utils/s3utils';
import s3paths from '../constants/s3paths';
interface checkUser {
	email?: string;
	_id?: mongoose.Types.ObjectId;
	deletedAt?: null | Date;
	role:mongoose.Types.ObjectId;
}
interface IcreateUser {
	email: string;
	firstName: string;
	password: string;
	role: string;
	brandId?: mongoose.Schema.Types.ObjectId;
	location: string;
	leadDescription: string;
	is_verified: boolean;
}
const createUser = async (data: IcreateUser) => {
	const user = await User.create(data);
	return user;
};
const checkUser = async (data: checkUser) => {
	const role = await Role.find({});
	console.log(role);

	try {
		return await User.findOne(data);
	} catch (error) {
		console.error('Error checking user:', error);
		throw new Error('User check failed');
	}
};

const getSanitizedUserData = async (id: unknown) => {
	const user = await User.findOne({ _id: id })
		.populate('role')
		.select('firstName lastName email role');
	return user?.toJSON();
};

const getRole = async (id: string) => {
	return await Role.findOne({ _id: id });
};
const getUserByEmail = async (email: string) => {
	const user = await User.findOne({ email: email, deletedAt: null });
	return user ? user?.toJSON() : null;
};

export const getUserMe = async (id: string) => {
	const user = User.aggregate([
		{
			$match: {
				_id: id,
				deletedAt: null,
			},
		},
		{
			$addFields: {
				profileImageOriginal: s3GetURL(s3paths.userProfileImage + id),
			},
		},
		{
			$lookup: {
				from: 'roles',
				localField: 'role',
				foreignField: '_id',
				as: 'role',
			},
		},
		{
			$project: {
				firstName: 1,
				lastName: 1,
				email: 1,
				role: 1,
				profileImageOriginal: 1,
			},
		},
		{
			$unwind: '$role',
		},
	]);
	return user || null;
};

export default {
	createUser,
	checkUser,
	getSanitizedUserData,
	getRole,
	getUserByEmail,
};
