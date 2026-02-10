import { Router } from "express";

import { notAuth } from "../middlewares/auth.middleware.js";
import { validateResetPass } from "../validators/resetpass.validator.js";

import forgotController from "../controllers/forgot.controller.js";

const router = Router();

router.get("/", notAuth, forgotController.getPage);
router.get("/:id/:code", notAuth, forgotController.getPageChangePass);

router.post("/api/send-mail", notAuth, validateResetPass, forgotController.sendMail);
router.post("/api/reset", notAuth, forgotController.resetPass);

export default router;