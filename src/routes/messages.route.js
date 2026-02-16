import { Router } from "express";

import { auth } from "../middlewares/auth.middleware.js";
import messagesController from "../controllers/messages.controller.js";

const router = Router();

router.get("/api/getConversations", auth, messagesController.getConversations);
router.get("/api/getMessages/:id", auth, messagesController.loadMessages);

export default router;