import { Router } from "express";
<<<<<<< HEAD
=======

import { auth } from "../middlewares/auth.middleware.js";

>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
import detalhesController from "../controllers/detalhesAnuncio.controller.js";

const router = Router();

router.get("/api/:id", detalhesController.getDetalhesApi);
router.get("/:id", detalhesController.getPage);

<<<<<<< HEAD
=======
router.post("/view/:id", auth, detalhesController.viewAnuncio);

>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
export default router;