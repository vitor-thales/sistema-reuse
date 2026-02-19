import path from "path";
<<<<<<< HEAD
import { publicDir } from "../utils/paths.js";
import { getDetalhesAnuncioById } from "../models/detalhesAnuncio.model.js";
=======
import jwt from "jsonwebtoken";

import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";

import { getDetalhesAnuncioById } from "../models/detalhesAnuncio.model.js";
import { registerVisualization, sawPublication } from "../models/visualizations.model.js";
import { getAnuncio } from "../models/anuncios.model.js";
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7

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
<<<<<<< HEAD
=======

  async viewAnuncio(req, res) {
    const idAnuncio = parseInt(req.params.id);
    const idEmpresa = jwt.verify(req.cookies.reuseToken, env.JWT_SECRET).id;
    if(!idAnuncio || !Number.isInteger(idAnuncio)) return res.status(400).json({ error: "Id inválido" });
    
    const anuncio = await getAnuncio(idAnuncio);
    if(anuncio.length === 0) return res.status(400).json({ error: "Anúncio não existe" });
    if(anuncio[0].idEmpresa === idEmpresa) return res.status(200).json({ message: "O anúncio pertence ao usuário, a visualização foi ignorada" });

    const viuAnuncio = await sawPublication(idAnuncio, idEmpresa);
    if(viuAnuncio.length > 0) return res.status(200).json({ message: "O usuário já viu esse anúncio, a visualização foi ignorada" });

    try {
      const view = await registerVisualization(idAnuncio, idEmpresa);
      if(view) return res.status(200).json({ message: "Visualização adicionada com sucesso" });
      else throw new Error("Anúncio ou usuário inexistentes");
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err });
    }
  }
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
};
