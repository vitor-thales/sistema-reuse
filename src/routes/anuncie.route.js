import { Router } from "express";
import anuncieController from "../controllers/anuncie.controller.js";

const router = Router();

router.get("/", anuncieController.getPage);

export default router;