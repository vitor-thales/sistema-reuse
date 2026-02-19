import { Router } from "express";
import anuncieController from "../controllers/anuncie.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { uploadAnuncio } from "../middlewares/uploadAnuncio.middleware.js";

const router = Router();

router.get("/", auth, anuncieController.getPage);
router.get("/novo", auth, anuncieController.getPage);

router.get("/categorias", auth, anuncieController.getCategorias);

router.get("/api/anuncios", anuncieController.listarAnuncios);

router.get(
  "/api/meus-anuncios/resumo",
  auth,
  anuncieController.meusAnunciosResumo
);

router.get(
  "/api/meus-anuncios/semana",
  auth,
  anuncieController.meusAnunciosSemana
);

router.get(
  "/api/meus-anuncios/lista",
  auth,
  anuncieController.meusAnunciosLista
);

router.get(
  "/api/meus-anuncios/:idAnuncio",
  auth,
  anuncieController.detalheMeuAnuncio
);

router.post(
  "/",
  auth,
  uploadAnuncio.fields([{ name: "imagens_produto", maxCount: 5 }]),
  anuncieController.sendRequisition
);

router.patch("/api/meus-anuncios/:idAnuncio/toggle", auth, anuncieController.toggleMeuAnuncio);
router.patch(
  "/api/meus-anuncios/:idAnuncio",
  auth,
  uploadAnuncio.fields([{ name: "imagens_produto", maxCount: 5 }]),
  anuncieController.editarMeuAnuncio
);

router.patch(
  "/api/meus-anuncios/:idAnuncio/status",
  auth,
  anuncieController.alterarStatusMeuAnuncio
);

router.delete(
  "/api/meus-anuncios/:idAnuncio",
  auth,
  anuncieController.excluirMeuAnuncio
);

export default router;
