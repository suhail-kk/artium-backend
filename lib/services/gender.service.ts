import Gender from "@/lib/schemas/gender"
import { IGender } from "@/lib/types/gender.interface"

const bulkInsert = async (data: IGender[]) => {
    return await Gender.insertMany(data)
}


const getAll = async () => {
    const res = await Gender.find()
    return res
}

export default {
    getAll,
    bulkInsert
}