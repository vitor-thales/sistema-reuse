import { Router } from "express";
import detalhesEmpresaController from "../controllers/detalhesEmpresa.controller.js";

const router = Router();

router.get("/api/:idEmpresa", detalhesEmpresaController.getDetalhesApi);
router.get("/:idEmpresa", detalhesEmpresaController.getPage);

export default router;