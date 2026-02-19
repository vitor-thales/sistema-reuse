import { Router } from "express";

import { auth, notAuth, tfAuth } from "../middlewares/auth.middleware.js";
import loginController from "../controllers/login.controller.js";

const router = Router();

router.get("/", notAuth, loginController.getPage);
router.get("/verificar", tfAuth, loginController.getTFAuthPage);
router.get("/api/checkLogin", auth, loginController.loggedIn);

router.post("/api/credentials", notAuth, loginController.login);
router.post("/api/sendTFCode", tfAuth, loginController.sendTFCode);
router.post("/api/tfAuthLogin", tfAuth, loginController.TFAuth);

export default router;
