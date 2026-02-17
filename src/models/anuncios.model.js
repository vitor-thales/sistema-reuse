import { db } from "../config/database.js";

function parseCurrency(value) {
  if (value === undefined || value === null || value === "") return null;

  const normalized = value
    .toString()
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapCondicao(condicao) {
  const mapa = {
    "usado-funcional": "Usado - Funcional",
    sucata: "Usado - Não Funcional",
    novo: "Novo",
    usado: "Usado - Funcional",
  };
  return mapa[condicao] || condicao || "Usado - Funcional";
}

function mapModalidade(modalidade) {
  const mapa = {
    agendamento: "Disponível para Agendamento",
    entrega: "Entrega no Local",
    retirada: "Retirada Imediata",
  };
  return mapa[modalidade] || "Disponível para Agendamento";
}

async function resolveCategoriaId(tipo) {
  if (!tipo) return null;

  const [rows] = await db.query(
    "SELECT idCategoria FROM tbCategorias WHERE nome = ? LIMIT 1",
    [tipo]
  );

  if (rows.length > 0) return rows[0].idCategoria;

  const [result] = await db.query(
    "INSERT INTO tbCategorias (nome, descricao) VALUES (?, ?)",
    [tipo, `Categoria ${tipo}`]
  );

  return result.insertId;
}

export async function getAnuncios() {
  const sql = `
    SELECT 
      a.idAnuncio,
      a.nomeProduto,
      a.valorTotal,
      a.quantidade,
      a.unidadeMedida,
      a.pesoTotal,
      a.descricao,
      a.condicao,
      a.origem,
      a.composicao,
      a.status,
      a.dataStatus,
      e.nomeFantasia AS nomeEmpresa,
      e.cidade AS cidade,
      e.estado AS estado,
      c.nome AS categoria,
      img.nomeArquivo
    FROM tbAnuncios a
    LEFT JOIN tbEmpresas e 
      ON a.idEmpresa = e.idEmpresa
    LEFT JOIN tbCategorias c
      ON c.idCategoria = a.idCategoria
    LEFT JOIN (
      SELECT i1.idAnuncio, i1.nomeArquivo
      FROM tbImagensAnuncios i1
      INNER JOIN (
        SELECT idAnuncio, MIN(idImagem) AS minIdImagem
        FROM tbImagensAnuncios
        GROUP BY idAnuncio
      ) x ON x.idAnuncio = i1.idAnuncio AND x.minIdImagem = i1.idImagem
    ) img ON img.idAnuncio = a.idAnuncio
    WHERE a.status = 'ativo'
    ORDER BY a.dataStatus DESC
  `;

  const [rows] = await db.query(sql);
  return rows;
}

/**
 * @param { object } filtros
 * @returns { Array }
 */
export async function getAnunciosFiltro(filtros = {}) {
  const {
    categoria,
    condicao,
    uf,
    cidade,
    precoMin,
    precoMax,
  } = filtros;

  const where = [];
  const params = [];

  where.push("a.status = 'ativo'");

  if (categoria) {
    const asNumber = Number(categoria);
    if (!Number.isNaN(asNumber) && String(asNumber) === String(categoria).trim()) {
      where.push("v.idCategoria = ?");
      params.push(asNumber);
    } else {
      where.push(`
        v.idCategoria = (
          SELECT c.idCategoria
          FROM tbCategorias c
          WHERE c.nome = ?
          LIMIT 1
        )
      `);
      params.push(String(categoria));
    }
  }

  if (condicao) {
    where.push("v.condicao = ?");
    params.push(mapCondicao(String(condicao)));
  }

  if (uf) {
    where.push("v.estadoEmpresa = ?");
    params.push(String(uf).trim().toUpperCase());
  }

  if (cidade) {
    where.push("LOWER(v.cidadeEmpresa) LIKE CONCAT('%', LOWER(?), '%')");
    params.push(String(cidade).trim());
  }

  if (precoMin !== undefined && precoMin !== null && precoMin !== "") {
    const n = Number(precoMin);
    if (!Number.isNaN(n)) {
      where.push("v.precoTotal >= ?");
      params.push(n);
    }
  }

  if (precoMax !== undefined && precoMax !== null && precoMax !== "") {
    const n = Number(precoMax);
    if (!Number.isNaN(n)) {
      where.push("v.precoTotal <= ?");
      params.push(n);
    }
  }

  const sql = `
    SELECT 
      a.idAnuncio,
      a.nomeProduto,
      a.valorTotal,
      a.quantidade,
      a.unidadeMedida,
      a.pesoTotal,
      a.descricao,
      a.condicao,
      a.origem,
      a.composicao,
      a.status,
      a.dataStatus,
      e.nomeFantasia AS nomeEmpresa,
      e.cidade AS cidade,
      e.estado AS estado,
      c.nome AS categoria,
      img.nomeArquivo
    FROM viewFiltroBusca v
    JOIN tbAnuncios a ON a.idAnuncio = v.idAnuncio
    JOIN tbEmpresas e ON e.idEmpresa = a.idEmpresa
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
    ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
    ORDER BY a.dataStatus DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
}

/**
 * @param { number } idEmpresa
 * @param { object } data
 * @param { Array } files
 */
export async function insertAnuncio(idEmpresa, data, files = []) {
  try {
    if (!idEmpresa) {
      return "Empresa não identificada. Faça login novamente.";
    }


    const categoriaId = await resolveCategoriaId(data.tipo);
    if (!categoriaId) return "Categoria não encontrada.";

    const valorTotal = parseCurrency(data.valorTotal);

    const quantidade = Number.parseInt(data.quantidade, 10);
    if (!Number.isFinite(quantidade) || quantidade < 0) {
      return "Quantidade inválida.";
    }

    const pesoTotal = Number.parseFloat(
      (data.pesoTotal ?? "").toString().replace(",", ".")
    );
    const pesoFinal = Number.isFinite(pesoTotal) && pesoTotal >= 0 ? pesoTotal : 0;

    const [result] = await db.query(
      `INSERT INTO tbAnuncios (
        idEmpresa,
        nomeProduto,
        valorTotal,
        quantidade,
        unidadeMedida,
        pesoTotal,
        descricao,
        idCategoria,
        condicao,
        origem,
        composicao,
        modalidadeColeta,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        idEmpresa,
        data.nomeProduto,
        valorTotal,
        quantidade,
        data.unidadeMedida,
        pesoFinal,
        data.descricao,
        categoriaId,
        mapCondicao(data.condicao),
        data.origem || null,
        data.composicao || null,
        mapModalidade(data.modalidadeColeta),
        "ativo",
      ]
    );

    if (files.length > 0) {
      const values = files.map((file) => [result.insertId, file.filename]);
      await db.query(
        "INSERT INTO tbImagensAnuncios (idAnuncio, nomeArquivo) VALUES ?",
        [values]
      );
    }

    return true;
  } catch (err) {
    return err.message;
  }
}
