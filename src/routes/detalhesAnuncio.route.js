import { Router } from "express";

import { auth } from "../middlewares/auth.middleware.js";

import detalhesController from "../controllers/detalhesAnuncio.controller.js";

const router = Router();

router.get("/api/:id", detalhesController.getDetalhesApi);
router.get("/:id", detalhesController.getPage);

router.post("/view/:id", auth, detalhesController.viewAnuncio);

export default router;