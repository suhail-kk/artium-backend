import Product from '@/lib/schemas/products'
import { IProduct, IUpdateProduct } from '@/lib/types/products.interface'

const createProduct = async (data: IProduct) => {
    const res = await Product.create(data)
    return res
}

const updateProduct = async (id: string, data: IUpdateProduct) => {
    const res = await Product.updateOne(
        {
            _id: id,
        },
        data
    )
    return res
}

const getProducts = async () => {
    const res = await Product.find()
    return res
}

const deleteProduct = async (_id: string) => {
    const res = await Product.findByIdAndDelete(_id)
    return res
}

export default { createProduct, updateProduct, getProducts, deleteProduct }
