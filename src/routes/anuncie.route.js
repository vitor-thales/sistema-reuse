import { Router } from "express";
import anuncieController from "../controllers/anuncie.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { uploadAnuncio } from "../middlewares/uploadAnuncio.middleware.js";

const router = Router();

router.get("/", anuncieController.getPage);
router.get("/novo", auth, anuncieController.getPage);

router.get("/api/anuncios", anuncieController.listarAnuncios);

router.post(
  "/",
  auth,
  uploadAnuncio.fields([{ name: "imagens_produto", maxCount: 5 }]),
  anuncieController.sendRequisition
);

router.post(
  "/api/sendSolicitation",
  auth,
  uploadAnuncio.fields([{ name: "imagens_produto", maxCount: 5 }]),
  anuncieController.sendRequisition
);

export default router;
