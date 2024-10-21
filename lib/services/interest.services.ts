import interest from '../schemas/interest';
import { interest as tInterest } from '../types/user';

export const createBulkInterest = async (data: tInterest[]) => {
	return await interest.insertMany(data);
};

export const getInterests = async (
	match: string,
	options: { limit: number } = { limit: 20 }
) => {
	const regex = new RegExp(match, 'i');
	return await interest.aggregate([
		{ $match: { title: regex } },
		{ $limit: 20 },
	]);
};
