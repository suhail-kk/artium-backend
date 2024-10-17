import { CustomError } from './custom.error'
import { HttpStatusCode } from '@/lib/constants/httpStatusCode'
export class BadRequestError extends CustomError {
  statusCode = HttpStatusCode.BAD_REQUEST

  constructor(public message: string) {
    super(message)
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }

  serializeErrors() {
    return [
      {
        message: this.message,
      },
    ]
  }
}

export class NotAuthorizedError extends CustomError {
  statusCode = HttpStatusCode.UNAUTHORIZED
  constructor() {
    super('Not authorized')
    Object.setPrototypeOf(this, NotAuthorizedError.prototype)
  }

  serializeErrors() {
    return [
      {
        message: 'Not authorized',
      },
    ]
  }
}

export class NotFoundError extends CustomError {
  statusCode = HttpStatusCode.NOT_FOUND
  constructor() {
    super('Route not found')
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }

  serializeErrors() {
    return [
      {
        message: 'Not Found',
      },
    ]
  }
}

// export class NotAcceptableError extends CustomError {
//   public http_code: number
//   constructor(message?: string | { code: string; message: string }) {
//     super(
//       typeof message === 'string'
//         ? message
//         : message?.message || 'Internal Server Error',
//     )
//     this.http_code = HttpStatusCode.INTERNAL_SERVER
//   }
// }
