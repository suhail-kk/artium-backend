import language from '../schemas/language'
import { language as tLanguage } from '../types/user'

export const createBulkLanguage = async (data: tLanguage[]) => {
    return await language.insertMany(data)
}
