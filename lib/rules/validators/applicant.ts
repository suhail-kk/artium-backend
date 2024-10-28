import { body } from "express-validator";
import { validateParams } from '@/lib/utils/validateRequest';

export const createApplicantValidator = () => {
    return validateParams([
        body('campaign_id')
            .notEmpty()
            .withMessage('Campaign is required'),
        body('user_id')
            .notEmpty()
            .withMessage('User id is required'),
    ])

}