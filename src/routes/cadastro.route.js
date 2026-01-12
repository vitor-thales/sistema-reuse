import { Router } from "express";

import { notAuth } from "../middlewares/auth.middleware.js";
import cadastroController from "../controllers/cadastro.controller.js";

const router = Router();

router.get("/", notAuth, cadastroController.getPage);

export default router;