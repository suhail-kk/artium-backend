const express = require('express');
const router = express.Router();
import { upload } from "@/lib/utils/storage.utils";
import {createChat,updateChat,listConversations,listMessages} from '@/lib/controllers/chat/chat.controller'
import { authenticateTokenMiddleware } from '@/lib/middlewares/auth.middleware';

router.use(authenticateTokenMiddleware);
router.post("/create", upload.single('file'), createChat)

router.get('/listChats',listConversations)
router.get('/listMessages',listMessages)
router.put('/update/:id',updateChat)
export { router };