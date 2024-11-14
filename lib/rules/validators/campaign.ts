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
            .optional({ checkFalsy: true })
            .isURL()
            .withMessage('Please provide a valid product URL'),
        body('product_description')
            .isLength({ max: 1500 })
            .withMessage('Product description must not exceed 1500 characters'),
        body('video_notes')
            .isLength({ max: 1500 })
            .withMessage('Video notes must not exceed 1500 characters'),
        body('video_duration')
            .optional({ checkFalsy: true })
            .isNumeric()
            .withMessage('Video duration must be a number')
            .isInt({ max: 1000 })
            .withMessage('Video duration must not exceed 1000'),
        body('min_price')
            .optional({ checkFalsy: true })
            .isNumeric()
            .withMessage('Minium price must be a number')
            .isInt({ max: 10000000 })
            .withMessage('Minium price must not exceed 1,00,000,00'),
        body('max_price')
            .optional({ checkFalsy: true })
            .isNumeric()
            .withMessage('Maxium price must be a number')
            .isInt({ max: 10000000 })
            .withMessage('Maxium price must not exceed 1,00,000,00'),
        body('min_price')
            .custom((value, { req }) => {
                if (value > req.body.max_price) {
                    throw new Error('Minimum price cannot be greater than maximum price');
                }
                return true;
            }),

        body('reference_link.*')
            .optional({ checkFalsy: true })
            .custom((link) => {
                if (link === "") {
                    return true;
                }
                const isValidUrl = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i.test(link);
                if (!isValidUrl) {
                    throw new Error('Each reference link must be a valid URL');
                }
                return true;
            })
    ])

}