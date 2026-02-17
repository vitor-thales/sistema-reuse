import { Router } from "express";
import anunciosController from "../controllers/anuncios.controller.js";
import { uploadAnuncio } from "../middlewares/uploadAnuncio.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/anuncie/api/anuncios/todos", anunciosController.listarAnuncios);
router.get("/anuncie/api/anuncios", anunciosController.listarAnunciosFiltro);
router.post("/anuncie", auth, uploadAnuncio.array("imagens_produto", 5), anunciosController.criarAnuncio);

export default router;
