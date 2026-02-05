import { Router } from "express";
import { listarAnuncios } from "../controllers/anuncios.controller.js";

const router = Router();

router.get("/api/anuncios", listarAnuncios);

export default router;