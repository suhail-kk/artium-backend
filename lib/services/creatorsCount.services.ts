import creatorsCount from '@/lib/schemas/creatorCount'
import { ICreatorCount } from '@/lib/types/creatorCount.interface'

const bulkInsert = async (data: ICreatorCount[]) => {
    const res = await creatorsCount.insertMany(data)
    return res
}

const getAll = async () => {
    const res = await creatorsCount.find()
    return res
}

export default { bulkInsert, getAll }
