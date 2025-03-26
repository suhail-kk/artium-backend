import mongoose, { Types } from 'mongoose';
import User from '@/lib/schemas/user';
import Role from '@/lib/schemas/role';
import schemaConstants from '@/lib/constants/schemaConstants';
interface checkUser {
	email?: string;
	role: mongoose.Types.ObjectId;
}
interface IcreateUser {
	email: string;
	full_name: string;
	password: string;
	role: string;
}
interface IResetPassword {
	password: string
}

interface ICheckUserRole {
	email: string,
	_id: Types.ObjectId
}

const createUser = async (data: IcreateUser) => {
	const user = await User.create(data);
	return user;
};

const isExistById = async (_id: mongoose.Types.ObjectId) => {
	const res = await User.exists({ _id });
	return res;
};

const updatePassword = async (_id: Types.ObjectId, data: IResetPassword) => {
	const user = await User.updateOne({
		_id
	}, data);
	return user;
};


const checkUser = async (data: checkUser) => {
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
		.select('full_name email role');
	return user?.toJSON();
};

const getRole = async (id: string) => {
	return await Role.findOne({ _id: id });
};

const getUserRoleFromEmailAndId = async (data: ICheckUserRole) => {
	if (!data._id && !data.email) {
		throw new Error('Either _id or email must be provided');
	}

	const user = await User.aggregate([
		{
			$match: {
				$or: [
					...(data._id ? [{ '_id': data._id }] : []),
					...(data.email ? [{ 'email': data.email }] : []),
				],
			},
		},
		{
			$lookup: {
				from: schemaConstants.roleSchema,
				localField: 'role',
				foreignField: '_id',
				as: 'role_details',
			},
		},
		{
			$unwind: {
				path: '$role_details',
				preserveNullAndEmptyArrays: true,
			},
		},
	]);

	return user[0]?.role_details || null;
};

const getUserByEmail = async (email: string) => {
	const user = await User.findOne({ email: email, deletedAt: null });
	return user ? user?.toJSON() : null;
};

export const getUserMe = async (id: Types.ObjectId) => {
	const user = User.aggregate([
		{
			$match: {
				_id: id,
			},
		},
		{
			$lookup: {
				from: schemaConstants.roleSchema,
				localField: 'role',
				foreignField: '_id',
				as: 'role',
			},
		},
		{
			$project: {
				full_name: 1,
				email: 1,
				role: 1,
			},
		},
		{
			$unwind: '$role',
		},
	]);
	return user || null;
};

export const getUserProifleById = async (_id: Types.ObjectId) => {
	const res = await User.aggregate([
		{
			$match: { _id: new mongoose.Types.ObjectId(_id) },
		},
		{
			$project: {
				password: 0,
			},
		},
	]);

	return res[0] || null
};


export default {
	getRole,
	checkUser,
	createUser,
	isExistById,
	updatePassword,
	getUserByEmail,
	getUserProifleById,
	getSanitizedUserData,
	getUserRoleFromEmailAndId
};
