import User from '../schemas/user'
import Role from '../schemas/roles'; // Import Role model
import mongoose from 'mongoose';
interface checkUser {
    email?: string,
    _id?: mongoose.Types.ObjectId,
    deletedAt?: null | Date
}
interface IcreateUser {
    email: string,
    firstName: string,
    password: string,
    role: string,
    brandId?: mongoose.Schema.Types.ObjectId,
    location: string,
    leadDescription: string,
    is_verified: boolean

}
const createUser = async (data: IcreateUser) => {
    const user = await User.create(data)
    return user
}
const checkUser = async (data: checkUser) => {
    const role = await Role.find({})
    console.log(role);

    try {
        return await User.findOne(data);
    } catch (error) {
        console.error('Error checking user:', error);
        throw new Error('User check failed');
    }

}

const getSanitizedUserData = async (id: unknown) => {
    const user = await User.findOne({ _id: id }).populate('role').select('firstName lastName email role  ')
    return user?.toJSON()
}


const getRole = async (id: string) => {
    return await Role.findOne({ _id: id })
}
const getUserByEmail = async (email: string) => {
    const user = await User.findOne({ email: email, deletedAt: null })
    return user ? user?.toJSON() : null
}
export default {
    createUser,
    checkUser,
    getSanitizedUserData,
    getRole,
    getUserByEmail
}