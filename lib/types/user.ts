import mongoose from 'mongoose';
export enum gender {
	male = 'male',
	female = 'female',
	other = 'other',
}
export type interest = {
	_id: string;
	title?: string;
};
export type language = {
	_id: string;
	title?: string;
};
type location = {
	placeId?: string;
	name?: string;
};
type city = {
	placeId?: string;
	name?: string;
};
export enum userTypes{
	CREATOR='Creator',
	BRAND='Brand'
}
export interface IupdateUser {
	firstName: string;
	lastName: string;
	email: string;
	location: location;
	about: string;
	dob: Date;
	gender: gender;
	interests: interest[];
	languages: language[];
	city: city;
	contacts: number[];
	socialLinks: string[];
	profileImage?: {
		fileName: string;
		type: string;
		size: number;
	};
}

export interface RequestBody {
	name: string;
	email: string;
	password: string;
	role_name: string;
	location: string;
	brand?: {
		title: string;
		instagram_link: string;
		brand_description: string;
	};
	lead_description: string;
}
export interface IbrandObject {
	title: string;
	instagram_link: string;
	brand_description: string;
}
export interface IUser {
	email: string;
	firstName: string;
	password: string;
	role: string;
	brandId?: mongoose.Schema.Types.ObjectId;
	location: string;
	leadDescription: string;
	is_verified: boolean;
	_id: string;
}
export interface ICreateUser {
	email: string;
	firstName: string;
	password: string;
	role: string;
	brandId?: mongoose.Schema.Types.ObjectId;
	location: string;
	leadDescription: string;
	_id?: string | undefined;
	is_verified: boolean;
}
export interface IBrand {
	_id?: string;
	title: string;
	instagramLink: string;
	brandDescription: string;
}
