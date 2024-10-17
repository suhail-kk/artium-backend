import dbSeeders from '@/lib/schemas/dbSeeders'
import { NextFunction, Request, Response } from 'express'
import { BadRequestError } from '@/lib/utils/errors/errors'
import seederConstants from '@/lib/constants/seederConstants'
import { sendSuccessResponse } from '@/lib/utils/responses/success.handler'

const dbSeedController = async (
  req: Request,
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

    return sendSuccessResponse(res, "Seeder run successfully");

  } catch (error) {
    return new BadRequestError("Failed to run seeders");
  }
}
export default dbSeedController as any