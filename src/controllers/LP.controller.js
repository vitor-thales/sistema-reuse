import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";
import { generateToken } from "../utils/generateToken.js";

import { getEmpresaCredentials } from "../models/empresas.model.js";

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/landingPage.html"));
    },

    async landing(req, res) {
        
    },
};
