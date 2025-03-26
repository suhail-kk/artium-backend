import { Types } from 'mongoose'

export interface IProgramRegistration {
    program_id: Types.ObjectId,
    user_id: Types.ObjectId,
}
