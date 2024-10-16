import { NextFunction, Request, Response } from 'express'
import { createErrorResponse, createResponse } from '@/lib/utils/apiResponse'
import seederConstants from '@/lib/constants/seederConstants'
import dbSeeders from '../schemas/dbSeeders'

export const dbSeedController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {


    for (const key of seederConstants) {
        const { name, func, description } = key
        const isExists = await dbSeeders.exists({ seeder_name: name }) // checking seeder exists on the db

        if (isExists) continue

        await func() // executing seeder

        await dbSeeders.create({
            seeder_name: name,
            description,
        }) // inserting seeder on db
    }

    return createResponse(res, { data: {}, status: 200 });

} catch (error) {
   return createErrorResponse(res, error);
}
}