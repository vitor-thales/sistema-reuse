import path from "path";
import { publicDir } from "../utils/paths.js";
import { getAnuncios } from "../models/anuncios.models.js";

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/anuncie.html"));
    },

    async list(req, res) {
        try {
            const anuncios = await getAnuncios();
            res.json(anuncios);
        } catch (err) {
            res.status(500).json(err);
        }
    }
};