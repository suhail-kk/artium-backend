import Role from '../schemas/roles'
interface IbulkInsert {
    name: string,
    description: string,
    type: string,
    role: string,
}

const FindRoleDetailsByName = async (role_name: string) => {
    return await Role.findOne({ name: role_name })
}

const bulkInsert = async (data: IbulkInsert[]) => {
    const res = await Role.insertMany(data)
    return res
}
const getRole = async (id: string) => {
    return await Role.findOne({ _id: id })
}
const getAllRoles = async () => {
    return await Role.find({})
}
export default { bulkInsert, FindRoleDetailsByName, getRole, getAllRoles }
