import { Router } from "express";

import { auth } from "../middlewares/auth.middleware.js";
import messagesController from "../controllers/messages.controller.js";

const router = Router();

router.get("/api/getConversations", auth, messagesController.getConversations);
router.get("/api/getMessages/:id", auth, messagesController.loadMessages);
router.get("/api/userData", auth, messagesController.getUserData);
router.get("/api/getPartner/:id", auth, messagesController.getPartnerData);

router.post("/api/startConversation", auth, messagesController.startConversation);

export default router;