import { Router } from "express";

import { adminAuth } from "../middlewares/auth.middleware.js";

import adminController from "../controllers/admin.controller.js";

const router = Router();

router.get("/dashboard", adminAuth, adminController.getDashboard);

export default router;