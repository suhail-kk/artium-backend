import bcrypt from 'bcryptjs'

export const generateHashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
}
export const validatePassword = async (password: string, userPassword: string) => {
    const isPasswordValid = await bcrypt.compare(password, userPassword)
    return isPasswordValid
}
