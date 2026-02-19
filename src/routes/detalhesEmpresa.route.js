import { Router } from "express";
import detalhesEmpresaController from "../controllers/detalhesEmpresa.controller.js";

const router = Router();

router.get("/api/:idEmpresa", detalhesEmpresaController.getDetalhesApi);
router.get("/:idEmpresa", detalhesEmpresaController.getPage);
router.get("/anuncios/:idEmpresa", detalhesEmpresaController.getAnunciosPage);
router.get("/api/anuncios/:idEmpresa", detalhesEmpresaController.getAnunciosEmpresa);

export default router;