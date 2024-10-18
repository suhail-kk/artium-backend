export enum gender {
	male = 'Male',
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
	profileImageKey?: string;
}
