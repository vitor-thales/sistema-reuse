import path from "path";
import jwt from "jsonwebtoken";
import fs from "fs/promises";

import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";

import {
  getAnuncios,
  insertAnuncio,
  getDashboardMeusAnuncios,
  getMeusAnuncios,
  getMeuAnuncioDetalhe,
  updateMeuAnuncio,
  updateStatusMeuAnuncio,
  deleteMeuAnuncioComImagens,
} from "../models/anuncios.model.js";

function getEmpresaIdFromReq(req) {
  const token = req.cookies?.reuseToken;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    return decoded?.id ?? null;
  } catch {
    return null;
  }
}

async function getPage(req, res) {
  return res.sendFile(path.join(publicDir, "pages/anuncie.html"));
}

async function sendRequisition(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) {
      return res.status(401).json({ ok: false, error: "Não autenticado." });
    }

    const files = req.files?.imagens_produto || [];
    const result = await insertAnuncio(idEmpresa, req.body, files);

    if (result === true) return res.status(201).json({ ok: true });

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

/* =========================
   DASHBOARD splitado (pro seu JS)
   - /api/meus-anuncios/resumo -> {visualizacoesMensais, vendasMes, anunciosAtivos}
   - /api/meus-anuncios/semana -> {seg, ter, qua, qui, sex, sab, dom}
   - /api/meus-anuncios/lista  -> array de anúncios
========================= */

async function meusAnunciosResumo(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const dash = await getDashboardMeusAnuncios(idEmpresa);
    // seu model retorna { cards, semana }
    return res.status(200).json(dash.cards);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao carregar resumo." });
  }
}

async function meusAnunciosSemana(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const dash = await getDashboardMeusAnuncios(idEmpresa);
    return res.status(200).json(dash.semana);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao carregar semana." });
  }
}

async function meusAnunciosLista(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) {
      return res.status(401).json({ error: "Não autenticado." });
    }

    const rows = await getMeusAnuncios(idEmpresa);

    // seu JS usa "visualizacoesMes". Seu SQL atual devolve "totalVisualizacoes".
    // pra não mexer no SQL agora, eu só normalizo aqui:
    const normalized = rows.map((a) => ({
      ...a,
      visualizacoesMes: a.visualizacoesMes ?? a.totalVisualizacoes ?? 0,
    }));

    return res.status(200).json(normalized);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao carregar seus anúncios." });
  }
}

/* =========================
   Endpoints já existentes (mantidos)
========================= */

async function dashboardMeusAnuncios(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) return res.status(401).json({ ok: false, error: "Não autenticado." });

    const dash = await getDashboardMeusAnuncios(idEmpresa);
    return res.status(200).json({ ok: true, dash });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro ao carregar dashboard." });
  }
}

async function listarMeusAnuncios(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) return res.status(401).json({ ok: false, error: "Não autenticado." });

    const rows = await getMeusAnuncios(idEmpresa);
    return res.status(200).json({ ok: true, anuncios: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro ao carregar seus anúncios." });
  }
}

async function detalheMeuAnuncio(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) return res.status(401).json({ ok: false, error: "Não autenticado." });

    const idAnuncio = Number(req.params.idAnuncio);
    const data = await getMeuAnuncioDetalhe(idEmpresa, idAnuncio);
    if (!data) return res.status(404).json({ ok: false, error: "Anúncio não encontrado." });

    return res.status(200).json({ ok: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro ao buscar anúncio." });
  }
}

async function editarMeuAnuncio(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) return res.status(401).json({ ok: false, error: "Não autenticado." });

    const idAnuncio = Number(req.params.idAnuncio);
    const files = req.files?.imagens_produto || [];

    const removeIdsRaw = req.body?.removerImagensIds;
    const removerImagensIds = Array.isArray(removeIdsRaw)
      ? removeIdsRaw.map((x) => Number(x)).filter(Number.isFinite)
      : String(removeIdsRaw || "")
          .split(",")
          .map((x) => Number(x.trim()))
          .filter(Number.isFinite);

    const result = await updateMeuAnuncio(idEmpresa, idAnuncio, req.body, files, removerImagensIds);

    if (result === true) return res.status(200).json({ ok: true });

    return res.status(400).json({ ok: false, error: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro ao editar anúncio." });
  }
}

async function alterarStatusMeuAnuncio(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) return res.status(401).json({ ok: false, error: "Não autenticado." });

    const idAnuncio = Number(req.params.idAnuncio);
    const { status } = req.body;

    const result = await updateStatusMeuAnuncio(idEmpresa, idAnuncio, status);

    if (result === true) return res.status(200).json({ ok: true });
    return res.status(400).json({ ok: false, error: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro ao alterar status." });
  }
}

async function excluirMeuAnuncio(req, res) {
  try {
    const idEmpresa = getEmpresaIdFromReq(req);
    if (!idEmpresa) return res.status(401).json({ ok: false, error: "Não autenticado." });

    const idAnuncio = Number(req.params.idAnuncio);

    const result = await deleteMeuAnuncioComImagens(idEmpresa, idAnuncio);

    if (result?.ok !== true) {
      return res.status(400).json({ ok: false, error: result?.error || "Não foi possível excluir." });
    }

    const uploadDir = path.join(publicDir, "uploads");
    for (const nomeArquivo of result.filesToDelete) {
      try {
        await fs.unlink(path.join(uploadDir, nomeArquivo));
      } catch {
        // ignore
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Erro ao excluir anúncio." });
  }
}

const anuncieController = {
  getPage,
  sendRequisition,
  listarAnuncios,

  // NOVOS endpoints pro dashboard do JS
  meusAnunciosResumo,
  meusAnunciosSemana,
  meusAnunciosLista,

  // antigos (mantidos)
  dashboardMeusAnuncios,
  listarMeusAnuncios,

  detalheMeuAnuncio,
  editarMeuAnuncio,
  alterarStatusMeuAnuncio,
  excluirMeuAnuncio,
};

export default anuncieController;
