import { getAnuncios } from "../models/anuncios.model.js";

export async function listarAnuncios(req, res) {
  try {
    const anuncios = await getAnuncios();
    return res.json(anuncios);
  } catch (err) {
    console.error("Erro ao listar anúncios:", err);
    return res.status(500).json({
      error: "Erro ao buscar anúncios"
    });
  }
}