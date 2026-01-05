import { Router } from "express";

import { auth, notAuth } from "../middlewares/auth.middleware.js";
import landingPageController from "../controllers/LP.controller.js";

const router = Router();

router.get("/landingPage", notAuth, landingPageController.getPage);
router.post("/api/credentials", notAuth, landingPageController.landing);

export default router;