import path from "path";
import { publicDir } from "../utils/paths.js";
import { getDetalhesAnuncioById } from "../models/detalhesAnuncio.model.js";

export default {
  async getPage(req, res) {
    return res.sendFile(path.join(publicDir, "pages", "detalhesAnuncio.html"));
  },

  async getDetalhesApi(req, res) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ message: "ID inválido." });
      }

      const data = await getDetalhesAnuncioById(id);

      if (!data) {
        return res.status(404).json({ message: "Anúncio não encontrado." });
      }

      return res.json(data);
    } catch (err) {
      console.error("Erro getDetalhesApi:", err);
      return res.status(500).json({ message: "Erro interno ao buscar anúncio." });
    }
  },
};
