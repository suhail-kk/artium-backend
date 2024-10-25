interface Location {
	city?: string;
	country?: string;
}

interface User {
	location?: Location;
	interests?: string[];
	languages?: string[];
	contacts?: string[];
	socialLinks?: string[];
	firstName?: string;
	lastName?: string;
	email?: string;
	about?: string;
	dob?: string;
	gender?: string;
}

const isValidDate = (dateString: string): boolean => {
	const date = new Date(dateString);
	return !isNaN(date.getTime());
};

export const calculateUserStrength = (user: User): number => {
	const fieldsToCheck: { [key in keyof User]: (value: any) => boolean } = {
		location: (location: Location) => !!(location?.city && location?.country),
		interests: (interests: string[]) =>
			Array.isArray(interests) && interests.length > 0,
		languages: (languages: string[]) =>
			Array.isArray(languages) && languages.length > 0,
		socialLinks: (socialLinks: string[]) =>
			Array.isArray(socialLinks) && socialLinks.length > 0,
		contacts: (contacts: string[]) =>
			Array.isArray(contacts) && contacts.length > 0,
		firstName: (firstName: string) => !!firstName?.trim(),
		lastName: (lastName: string) => !!lastName?.trim(),
		email: (email: string) => !!email?.trim(),
		about: (about: string) => !!about?.trim(),
		dob: (dob: string) => isValidDate(dob),
		gender: (gender: string) => !!gender?.trim(),
	};

	const totalFields = Object.keys(fieldsToCheck).length;
	let filledFields = 0;
	for (const [field, isValid] of Object.entries(fieldsToCheck)) {
		const fieldValue = user[field as keyof User];
		if (isValid(fieldValue)) {
			filledFields++;
		}
	}

	return Math.round((filledFields / totalFields) * 100);
};
