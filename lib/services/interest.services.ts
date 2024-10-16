import interest from '../schemas/interest'
import { interest as tInterest } from '../types/user'

export const createBulkInterest = async (data: tInterest[]) => {
    return await interest.insertMany(data)
}

export const getInterests = async (match: string) =>
    await interest.find({ title: `/${match}/` })
