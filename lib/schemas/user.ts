import mongoose, { Schema } from 'mongoose';

import { gender } from '@/lib/types/user';
import userRules from '@/lib/rules/user.json';
import schemaNameConstants from '@/lib/constants/schemaConstants';

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: true,
		},
		lastName: {
			type: String,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: Schema.Types.ObjectId,
			ref: schemaNameConstants.roleSchema,
		},
		brandId: {
			type: Schema.Types.ObjectId,
			ref: schemaNameConstants.brandSchema,
		},
		location: {
			type: {
				country: String,
				city: String,
			},
		},
		leadSource: {
			type: String,
		},
		about: {
			type: String,
			maxLength: userRules.about.max,
			minLength: userRules.about.min,
		},
		dob: {
			type: Date,
		},
		gender: {
			type: String,
			enum: gender,
		},
		interests: {
			type: [Schema.Types.ObjectId],
			ref: schemaNameConstants.interestsSchema,
		},
		languages: {
			type: [Schema.Types.ObjectId],
			ref: schemaNameConstants.languagesSchema,
		},
		savedUsers: {
			type: [Schema.Types.ObjectId],
		},
		country: { type: String },
		city: { type: String },
		contacts: { type: [Number] },
		socialLinks: { type: [String] },
		is_verified: { type: Boolean, default: false },
		deletedAt: { type: Date },
	},
	{
		timestamps: true,
	}
);

export default mongoose.models[schemaNameConstants?.userSchema] ||
	mongoose.model(schemaNameConstants?.userSchema, userSchema);
