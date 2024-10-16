import videoTypes from '@/lib/schemas/videoTypes'
import { IVideoType } from '@/lib/types/videoType.interface'

const bulkInsert = async (data: IVideoType[]) => {
    const res = await videoTypes.insertMany(data)
    return res
}

const getAll = async () => {
    const res = await videoTypes.find()
    return res
}

export default { bulkInsert, getAll }
