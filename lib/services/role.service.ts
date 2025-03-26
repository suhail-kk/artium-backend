import Role from "@/lib/schemas/role"
import { IRole } from "@/lib/types/role.interface"

const bulkInsert = async (data: IRole[]) => {
    return await Role.insertMany(data)
}

const getAll = async () => {
    const res = await Role.find()
    return res
}

const checkExist = async (_id: string) => {
    const res = await Role.exists({ _id })
    return res
}

export default {
    getAll,
    checkExist,
    bulkInsert
}