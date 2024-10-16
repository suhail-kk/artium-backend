import { Types } from 'mongoose';

export interface createUserJWTInterface {
	_id: Types.ObjectId;
	email: string;
}
