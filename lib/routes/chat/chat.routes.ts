const express = require('express');
const router = express.Router();
import { upload } from "@/lib/utils/storage.utils";
import {createChat,updateChat,listConversations,listMessages,updateOfferStatus, markAllRead} from '@/lib/controllers/chat/chat.controller'

router.post("/create", upload.single('file'), createChat)

router.get('/listChats',listConversations)
router.get('/listMessages',listMessages)
router.put('/update/:id',updateChat)
router.put('/offer/update',updateOfferStatus)
router.put("/readAllMessages",markAllRead)
export { router };      