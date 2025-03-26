import ProgramType from "@/lib/schemas/programType"
import { IProgramType } from "@/lib/types/programType.interface"

const bulkInsert = async (data: IProgramType[]) => {
    return await ProgramType.insertMany(data)
}

const getAll = async () => {
    const res = await ProgramType.find()
    return res
}

export default {
    getAll,
    bulkInsert
}