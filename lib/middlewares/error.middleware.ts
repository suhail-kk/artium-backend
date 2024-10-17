import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/errors/custom.error';

export const errorHandler = (
  err: Error | CustomError,  // Handle both Error and CustomError types
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('Error caught in global handler::', err);

  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  // Generic error response if it's not a CustomError
  return res.status(500).send({
    errors: [{ message: 'Something went wrong' }],
  });
};
