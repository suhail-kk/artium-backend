// import { NextFunction, Request, Response } from 'express'
// import { generateHashPassword, validatePassword } from '@/lib/utils/passwordUtils'
// import userServices from '@/lib/services/auth.services'
// import { ICreateUser } from '@/lib/types/user'
// import  {createResponse, createErrorResponse } from '@/lib/utils/apiResponse'
// import { createUserJWT, verifyJWTToken } from '@Helper/jwt.utils'


// export const registerUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const {
//       first_name,
//       middle_name,
//       last_name,
//       job_title,
//       email,
//       phone_number,
//       password,
//     }: ICreateUser = req.body

//     const user = await userServices.getUserByEmail(email)
//     if (user) throw new BadRequestError('User already registered')

//     const hashedPassword: string = await generateHashPassword(password)

//     const userData: IUser = {
//       email: {
//         value: email,
//         is_verified: false,
//       },
//       first_name: first_name,
//       middle_name: middle_name,
//       last_name: last_name,
//       job_title: job_title,
//       phone_number: {
//         value: phone_number,
//         is_verified: false,
//       },
//       password: hashedPassword,
//     }

//     await userServices.createUser(userData)

//     sendSuccessResponse(res, 'User created successfully')
//   } catch (error) {
//     console.log(error)
//     next(error)
//   }
// }


// declare module 'express-serve-static-core' {
//   interface Request {
//     session: {
//       token: string
//       refreshToken: string
//     }
//   }
// }

// export const login = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { email, password } = req.body

//     const user = await userServices.getUserByEmail(email)
//     if (!user) throw new BadRequestError('User not exists')

//     if (!user?.email?.is_verified && !user?.phone_number?.is_verified)
//       return res.status(400).json({
//         errors: { message: 'User not verified', is_verified: false },
//       })
//     const isPasswordValid = await validatePassword(password, user?.password)

//     if (!isPasswordValid) throw new BadRequestError("Password doesn't match")

//     const createUserJWTOptions = {
//       _id: user?._id,
//       email: user?.email?.value,
//     }

//     const { jwtToken, refreshToken } = createUserJWT(createUserJWTOptions)

//     const sessionOptions = {
//       token: jwtToken,
//       refreshToken: refreshToken,
//     }
//     req.session = sessionOptions

//     sendSuccessResponse(res, 'Logged in successfully', {
//       accessToken: jwtToken,
//       refreshToken,
//       user: user,
//     })
//   } catch (error) {
//     next(error)
//   }
// }

// export const reGenereateToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     interface sessionInterface {
//       token: string
//       refreshToken: string
//     }

//     const session = req.session as sessionInterface
//     const body = req.body
//     const refreshToken = body.refreshToken || session.refreshToken

//     if (!refreshToken) throw new BadRequestError('No token provided')
//     const decodeValue = verifyJWTToken(refreshToken)

//     if (typeof decodeValue === 'string')
//       throw new BadRequestError('Invalid token')
//     const user = await userServices.getUserByEmail(decodeValue?.email)

//     if (!user) throw new BadRequestError("User doesn't exists")

//     const { jwtToken, refreshToken: newRefreshToken } =
//       createUserJWT(decodeValue)

//     const sessionOptions = {
//       token: jwtToken,
//       refreshToken: refreshToken,
//     }
//     req.session = sessionOptions

//     sendSuccessResponse(res, 'Token created', {
//       jwtToken,
//       refreshToken: newRefreshToken,
//     })
//   } catch (error) {
//     next(error)
//   }
// }

// export const logoutUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     req.session = {
//       refreshToken: '',
//       token: '',
//     }
//     sendSuccessResponse(res, 'Logout success.')
//   } catch (error) {
//     next(error)
//   }
// }

// export const me = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userd:any= req?.user

//     const user: any = await userServices.getUserByEmail(email?.value)
//     if (!user) throw new BadRequestError("User doesn't exists")

//     const userDetails = {
//       id: user?._id,
//       email: user?.email?.value,
//       name: `${user.first_name}${user.middle_name ? ' ' + user.middle_name : ''} ${user.last_name}`,
//       job_title: user?.job_title,
//       role: user?.role
//         ? {
//             role: user?.role?.role,
//             type: user?.role?.type,
//             _id: user?.role?._id,
//           }
//         : { role: 'USER', type: 'USER' },
//     }

//     sendSuccessResponse(res, 'Success', userDetails)
//   } catch (error) {
//     next(error)
//   }
// }
