import configuracoesController from "../controllers/configuracoes.controller.js";
import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", configuracoesController.getPage);
router.post("/toggle", auth, configuracoesController.updateToggle);
router.get("/config-empresa", auth, configuracoesController.getConfig);
router.post("/config-empresa", auth, configuracoesController.updateConfig);
router.post("/senha", auth, configuracoesController.updatePassword);

export default router;
