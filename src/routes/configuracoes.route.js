import configuracoesController from "../controllers/configuracoes.controller.js";
import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", auth, configuracoesController.getPage);
router.get("/config-empresa", auth, configuracoesController.getConfig);

router.post("/config-empresa", auth, configuracoesController.update);
router.post("/senha", auth, configuracoesController.updatePassword);

export default router;
