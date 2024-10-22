import { body } from "express-validator";
import { validateParams } from '@/lib/utils/validateRequest';

export const createCampaignValidator = () => {
    return validateParams([
        body('product_title')
            .notEmpty()
            .withMessage('Product name is required')
            .isLength({ max: 100 })
            .withMessage('Product name must not exceed 100 characters'),
        body('campaign_title')
            .notEmpty()
            .withMessage('Campaign name is required')
            .isLength({ max: 100 })
            .withMessage('Campaign name must not exceed 100 characters'),
        body('product_url')
            .isURL()
            .withMessage('Please provide a valid product URL'),
        body('product_description')
            .isLength({ max: 1500 })
            .withMessage('Product description must not exceed 1500 characters'),
        body('video_notes')
            .isLength({ max: 1500 })
            .withMessage('Video notes must not exceed 1500 characters'),
        body('video_duration')
            .isNumeric()
            .withMessage('Video duration must be a number')
            .isInt({ max: 1000 })
            .withMessage('Video duration must not exceed 1000'),
        body('min_price')
            .isNumeric()
            .withMessage('Minium price must be a number')
            .isInt({ max: 10000000 })
            .withMessage('Minium price must not exceed 1,00,000,00'),
        body('max_price')
            .isNumeric()
            .withMessage('Maxium price must be a number')
            .isInt({ max: 10000000 })
            .withMessage('Maxium price must not exceed 1,00,000,00'),
        body('reference_link.*')
            .isURL()
            .withMessage('Each reference link must be a valid URL'),
    ])

}