import { getAnuncios, insertAnuncio } from "../models/anuncios.model.js";
import path from "path";

import { publicDir } from "../utils/paths.js";

async function getPage(req, res) {
  res.sendFile(path.join(publicDir, "pages/anuncie.html"));
}

async function sendRequisition(req, res) {
  try {
    const files = req.files?.imagens_produto || [];
    const result = await insertAnuncio(req.body, files);

    if (result === true) {
      return res.status(201).json({ ok: true });
    }

    return res.status(400).json({ ok: false, error: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro ao criar anúncio" });
  }
}

async function listarAnuncios(req, res) {
  try {
    const anuncios = await getAnuncios();
    return res.status(200).json(anuncios);
  } catch (err) {
    console.error("Erro ao listar anúncios:", err);
    return res.status(500).json({ error: "Erro ao buscar anúncios." });
  }
}

const anuncieController = {
  getPage,
  sendRequisition,
  listarAnuncios,
};

export default anuncieController;
