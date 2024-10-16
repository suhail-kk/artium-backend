import { interestData, languagesData } from '../controllers/common/resources';

const express = require('express');
const router = express.Router();

router.get('/interests', interestData);

router.get('/languages', languagesData);

export { router };
