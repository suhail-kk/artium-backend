const express = require('express');
const router = express.Router();

import {
	createChat,
	updateChat,
	listConversations,
	listMessages,
	updateOfferStatus,
	markAllRead,
	getParticipant,
	checkConversationExist,
    approveVideo,
} from '@/lib/controllers/chat/chat.controller';

router.post('/create', createChat);

router.get('/listChats', listConversations);
router.get('/listMessages', listMessages);
router.put('/update/:id', updateChat);
router.put('/offer/update', updateOfferStatus);
router.put('/readAllMessages', markAllRead);
router.post('/getParticipant', checkConversationExist);
router.post('/checkConversation', checkConversationExist);
router.put('/approveVideo',approveVideo)
export { router };
