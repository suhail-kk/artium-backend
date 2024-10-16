import Brand from '../schemas/brand'

interface IBrand {
    title: string,
    instagramLink: string,
    brandDescription: string
}
const findBrandDetails = async (brand_name: string) => {
    return await Brand.findOne({ title: brand_name })
}
const createBrand = async (data: IBrand) => {
    return await Brand.create(data)
}
export default {
    findBrandDetails,
    createBrand
}