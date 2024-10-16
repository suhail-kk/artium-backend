import { JWT_KEY } from '@/lib/constants/envConstants'
import jsonwebtoken, { JwtPayload } from 'jsonwebtoken'
import { createUserJWTInterface } from '../interfaces/createJwt.interface'
const JWT_EXPIRES_IN = '2h'
const REFRESH_EXPIRES_IN = '30d'

export const createUserJWT = (params: createUserJWTInterface | JwtPayload) => {
    const jwtBody = {
        id: params._id,
        email: params?.email,
    }
    const jwtTokenOptins = {
        expiresIn: JWT_EXPIRES_IN,
    }
    const refreshTokenOptions = {
        expiresIn: REFRESH_EXPIRES_IN,
    }

    const jwtToken = jsonwebtoken.sign(jwtBody, JWT_KEY!, jwtTokenOptins)
    const refreshToken = jsonwebtoken.sign(jwtBody, JWT_KEY!, refreshTokenOptions)
    return { jwtToken, refreshToken }
}

export const verifyJWTToken = (token: string): JwtPayload | string => {
    const decoded = jsonwebtoken.verify(token, JWT_KEY!)
    return decoded
}
