import { Router } from "express";
import detalhesController from "../controllers/detalhesAnuncio.controller.js";

const router = Router();

router.get("/api/:id", detalhesController.getDetalhesApi);
router.get("/:id", detalhesController.getPage);

export default router;