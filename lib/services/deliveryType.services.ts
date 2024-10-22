import deliveryType from '@/lib/schemas/deliveryType'
import { IDeliveryType } from '@/lib/types/deliveryType.interface'

const bulkInsert = async (data: IDeliveryType[]) => {
    const res = await deliveryType.insertMany(data)
    return res
}

const getAll = async () => {
    const res = await deliveryType.find()
    return res
}

export default { bulkInsert, getAll }
