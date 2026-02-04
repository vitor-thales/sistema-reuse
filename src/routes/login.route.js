import { Router } from "express";

import { auth, notAuth } from "../middlewares/auth.middleware.js";
import loginController from "../controllers/login.controller.js";

const router = Router();

router.get("/", notAuth, loginController.getPage);
router.get("/verificar", notAuth, loginController.getTFAuthPage);
router.get("/api/checkLogin", auth, loginController.loggedIn);

router.post("/api/credentials", notAuth, loginController.login);
router.post("/api/sendTFCode", notAuth, loginController.sendTFCode);
router.post("/api/tfauthLogin", notAuth, loginController.TFAuth);

export default router;
