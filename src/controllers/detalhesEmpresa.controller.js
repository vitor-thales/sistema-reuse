import path from "path";
import { publicDir } from "../utils/paths.js";
import {
  getPerfilEmpresaById,
  getProdutosRecentesEmpresa,
} from "../models/detalhesEmpresa.model.js";

export default {
  async getPage(req, res) {
    return res.sendFile(path.join(publicDir, "pages", "detalhesEmpresa.html"));
  },

  async getDetalhesApi(req, res) {
    try {
      const idEmpresa = Number(req.params.idEmpresa);
      if (!Number.isFinite(idEmpresa) || idEmpresa <= 0) {
        return res.status(400).json({ message: "idEmpresa inválido." });
      }

      const perfil = await getPerfilEmpresaById(idEmpresa);
      if (!perfil) {
        return res.status(404).json({ message: "Empresa não encontrada." });
      }

      const produtosRecentes = await getProdutosRecentesEmpresa(idEmpresa, {
        status: "ativo",
        limit: 6,
      });

      return res.status(200).json({ perfil, produtosRecentes });
    } catch (err) {
      console.error("Erro detalhesEmpresa.getDetalhesApi:", err);
      return res.status(500).json({ message: "Erro interno ao buscar empresa." });
    }
  },
};
