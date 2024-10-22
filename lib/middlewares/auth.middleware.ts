import { BadRequestError ,NotAuthorizedError} from '../utils/errors/errors'
import { verifyJWTToken } from '../utils/jwtUtils'
import userServices from '../services/user.services'
import { NextFunction, Request, Response } from 'express'
import { IUser } from '../types/user'

declare global {
  namespace Express {
    interface Request {
      user: IUser
    }
  }
}

export const authenticateTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorization: any = req.headers.authorization
    if (!authorization) throw new NotAuthorizedError()

    const token = authorization.split(' ')[1]
    if (!token) throw new NotAuthorizedError()

    // decode token
    const decodeToken = verifyJWTToken(token)
    if (!decodeToken || typeof decodeToken === 'string')
      throw new NotAuthorizedError()

    // check user exist on the database
    const user: any = await userServices.getUserByEmail(decodeToken['email'])
    if (!user) throw new NotAuthorizedError()
    req.user = {
      ...user,
      id: user._id,
    }

    // if all passes sending request next middleware
    next()
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      return res.status(498).json({ message: 'Token expired' })
    }
    throw new BadRequestError(error.message)
  }
}
