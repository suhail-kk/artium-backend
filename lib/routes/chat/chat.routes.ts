const express = require('express');
const router = express.Router();
import { upload } from "@/lib/utils/storage.utils";
import {createChat,updateChat,listConversations,listMessages,updateOfferStatus, markAllRead, getParticipant,checkConversationExist} from '@/lib/controllers/chat/chat.controller'

router.post("/create", createChat)

router.get('/listChats',listConversations)
router.get('/listMessages',listMessages)
router.put('/update/:id',updateChat)
router.put('/offer/update',updateOfferStatus)
router.put("/readAllMessages",markAllRead)
router.post('/getParticipant',checkConversationExist)
router.post('/checkConversation',checkConversationExist)
export { router };      