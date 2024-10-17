import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/errors/custom.error';

export const errorHandler = (
  err: CustomError | Error, 
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {


  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  return res.status(500).send({ 
    errors: [{ message: 'Something went wrong' }],
  });
};