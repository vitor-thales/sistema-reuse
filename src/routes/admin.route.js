import { Router } from "express";

import { adminAuth } from "../middlewares/auth.middleware.js";
import { validateUserData } from "../validators/admin.usuario.validator.js";

import adminController from "../controllers/admin.controller.js";

const router = Router();

router.get("/dashboard", adminAuth, adminController.getDashboard);

router.get("/usuarios", adminAuth, adminController.getUsuarios);
router.get("/usuarios/get/:id", adminAuth, adminController.getUser);
router.get("/usuarios/list", adminAuth, adminController.getUsers);

router.get("/permissions", adminAuth, adminController.getPermissions);
router.get("/api/getInfo", adminAuth, adminController.getUserInfo);

router.post("/usuarios/createUser",
    adminAuth,
    validateUserData,
    adminController.createUser
);

router.put("/usuarios/update/:id",
    adminAuth,
    validateUserData,
    adminController.editUser
);

router.delete("/usuarios/delete", adminAuth, adminController.deleteUser);

export default router;