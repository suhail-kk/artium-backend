import { Types } from 'mongoose'

export interface IDepartment {
    name: Types.ObjectId,
}

export interface IUpdateDepartment {
    name: Types.ObjectId,
}
