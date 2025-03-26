import { Types } from "mongoose";

export interface ICreateUser {
    email: string,
    password: string,
    full_name: string,
    _id: Types.ObjectId,
    role: Types.ObjectId
}

export interface IUpdateUser {
    full_name: string
}