import { ICreateUser } from '@/lib/types/user.interface'
import { verifyJWTToken } from '@/lib/utils/jwtUtils'
import userServices from '@/lib/services/auth.services'
import { NextFunction, Request, Response } from 'express'
import { BadRequestError, NotAuthorizedError } from '@/lib/utils/errors/errors'

declare global {
  namespace Express {
    interface Request {
      user: ICreateUser
    }
  }
}

export const authenticateTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
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
    const user: any = await userServices.getUserProifleById(decodeToken['id'])
    if (!user) throw new NotAuthorizedError()
    req.user = {
      ...user,
      id: user._id,
    }

    // if all passes sending request next middleware
    next()
  } catch (error: any) {
    if (error?.name === 'TokenExpiredError') {
      res.status(498).json({ message: 'Token expired' })
    }
    throw new BadRequestError(error.message)
  }
}
