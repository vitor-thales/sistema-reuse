import { db } from "../config/database.js";

export async function getPerfilEmpresaById(idEmpresa) {
  try {
    await db.query("CALL calcTempoRespostaPerfil()");
  } catch(err) {
    throw err;
  }

  const id = Number(idEmpresa);
  if (!Number.isFinite(id) || id <= 0) return null;

  const [rows] = await db.query(
    `
    SELECT
      idEmpresa,
      nomeEmpresa,
      enderecoEmpresa,
      membroDesde,
      anunciosAtivos,
      vendasRealizadas,
      taxaResposta,
      tempoResposta,
      emailEmpresa,
      foneEmpresa,
      sobreEmpresa,
      razaoSocialEmpresa,
      cnpjEmpresa
    FROM viewPerfilEmpresas
    WHERE idEmpresa = ?
    LIMIT 1
    `,
    [id]
  );

  return rows?.[0] || null;
}

export async function getProdutosRecentesEmpresa(idEmpresa, { status = "ativo", limit = 6 } = {}) {
  const id = Number(idEmpresa);
  const lim = Number(limit);

  if (!Number.isFinite(id) || id <= 0) return [];
  if (!Number.isFinite(lim) || lim <= 0) return [];

  const allowed = new Set(["ativo", "pausado", "vendido"]);
  const st = allowed.has(String(status)) ? String(status) : "ativo";

  const [rows] = await db.query(
    `
    SELECT
      a.idAnuncio,
      a.nomeProduto,
      a.valorTotal,
      a.quantidade,
      a.unidadeMedida,
      a.status,
      a.dataStatus,
      c.nome AS categoria,
      img.nomeArquivo
    FROM tbAnuncios a
    LEFT JOIN tbCategorias c ON c.idCategoria = a.idCategoria
    LEFT JOIN (
      SELECT i1.idAnuncio, i1.nomeArquivo
      FROM tbImagensAnuncios i1
      INNER JOIN (
        SELECT idAnuncio, MIN(idImagem) AS minIdImagem
        FROM tbImagensAnuncios
        GROUP BY idAnuncio
      ) x ON x.idAnuncio = i1.idAnuncio AND x.minIdImagem = i1.idImagem
    ) img ON img.idAnuncio = a.idAnuncio
    WHERE a.idEmpresa = ? AND a.status = ?
    ORDER BY a.dataStatus DESC
    LIMIT ?
    `,
    [id, st, lim]
  );

  return rows || [];
}

export async function getCountAnunciosAtivosEmpresa(idEmpresa) {
  const id = Number(idEmpresa);
  if (!Number.isFinite(id) || id <= 0) return 0;

  const [rows] = await db.query(
    `SELECT COUNT(*) AS total FROM tbAnuncios WHERE idEmpresa = ? AND status = 'ativo'`,
    [id]
  );

  return Number(rows?.[0]?.total || 0);
}

export async function getPrivacidadeEmpresa(idEmpresa) {
  const [rows] = await db.query(
      `SELECT * FROM tbConfigEmpresas WHERE idEmpresa = ?`,
      [idEmpresa]
  );
  return rows;
}