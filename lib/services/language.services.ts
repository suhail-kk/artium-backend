import language from '../schemas/language';
import { language as tLanguage } from '../types/user';

export const createBulkLanguage = async (data: tLanguage[]) => {
	return await language.insertMany(data);
};

export const getLanguages = async (
	match: string,
	options: { limit: number } = { limit: 20 }
) => {
	const regex = new RegExp(match, 'i');
	return await language.aggregate([
		{ $match: { title: regex } },
		{ $limit: 20 },
	]);
};
