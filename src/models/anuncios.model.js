import { db } from "../config/database.js";

const MAX_VALOR_TOTAL = 50000;

function parseCurrency(value) {
  if (value === undefined || value === null || value === "") return null;

  let s = String(value).trim();
  if (!s) return null;

  s = s.replace(/[^\d.,-]/g, "");

  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    s = s.replace(/,/g, "");
  }

  const parsed = Number.parseFloat(s);
  if (Number.isNaN(parsed)) return null;

  return Math.min(Math.max(parsed, 0), MAX_VALOR_TOTAL);
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
    LEFT JOIN tbEmpresas e ON a.idEmpresa = e.idEmpresa
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
    WHERE a.status = 'ativo'
    ORDER BY a.dataStatus DESC
  `;

  const [rows] = await db.query(sql);
  return rows;
}

export async function getAnuncio(id) {
  const [rows] = await db.query("SELECT * FROM tbAnuncios WHERE idAnuncio = ?", [id]);
  return rows;
}

export async function getAnunciosByEmpresa(idEmpresa) {
  const query = `
    SELECT 
      a.*, 
      COALESCE(e.nomeFantasia, e.razaoSocial) AS nomeEmpresa,
      e.cidade,
      e.estado,
      (SELECT i.nomeArquivo 
       FROM tbImagensAnuncios i 
       WHERE i.idAnuncio = a.idAnuncio 
       LIMIT 1) AS nomeArquivo
    FROM tbAnuncios a
    JOIN tbEmpresas e ON a.idEmpresa = e.idEmpresa
    WHERE a.idEmpresa = ? AND a.status = 'ativo'
    ORDER BY a.dataStatus DESC
  `;

  const [rows] = await db.query(query, [idEmpresa]);
  return rows;
}

export async function insertAnuncio(idEmpresa, data, files = []) {
  try {
    if (!idEmpresa) return "Empresa não identificada. Faça login novamente.";

    const valorTotal = parseCurrency(data.valorTotal);

    const quantidade = Number.parseInt(data.quantidade, 10);
    if (!Number.isFinite(quantidade) || quantidade < 0) return "Quantidade inválida.";

    const pesoTotal = Number.parseFloat((data.pesoTotal ?? "").toString().replace(",", "."));
    const pesoFinal = Number.isFinite(pesoTotal) && pesoTotal >= 0 ? pesoTotal : 0;

    const [result] = await db.query(
      `INSERT INTO tbAnuncios (
        idEmpresa, nomeProduto, valorTotal, quantidade, unidadeMedida, pesoTotal, descricao,
        idCategoria, condicao, origem, composicao, modalidadeColeta, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        idEmpresa,
        data.nomeProduto,
        valorTotal,
        quantidade,
        data.unidadeMedida,
        pesoFinal,
        data.descricao,
        data.tipo,
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

export async function getDashboardMeusAnuncios(idEmpresa) {
  const pctDelta = (current, previous) => {
    const cur = Number(current) || 0;
    const prev = Number(previous) || 0;

    if (prev === 0 && cur === 0) return 0;
    if (prev === 0 && cur > 0) return 100;
    return ((cur - prev) / prev) * 100;
  };

  const [viewsRows] = await db.query(
    `
    SELECT
      SUM(CASE
            WHEN YEAR(v.dataVisualizacao) = YEAR(CURRENT_DATE())
             AND MONTH(v.dataVisualizacao) = MONTH(CURRENT_DATE())
            THEN 1 ELSE 0
          END) AS viewsAtual,
      SUM(CASE
            WHEN YEAR(v.dataVisualizacao) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
             AND MONTH(v.dataVisualizacao) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
            THEN 1 ELSE 0
          END) AS viewsAnterior
    FROM tbVisualizacoesAnuncios v
    JOIN tbAnuncios a ON a.idAnuncio = v.idAnuncio
    WHERE a.idEmpresa = ?
    `,
    [idEmpresa]
  );

  const viewsAtual = Number(viewsRows?.[0]?.viewsAtual || 0);
  const viewsAnterior = Number(viewsRows?.[0]?.viewsAnterior || 0);

  const [salesRows] = await db.query(
    `
    SELECT
      SUM(CASE
            WHEN a.status = 'vendido'
             AND YEAR(a.dataStatus) = YEAR(CURRENT_DATE())
             AND MONTH(a.dataStatus) = MONTH(CURRENT_DATE())
            THEN 1 ELSE 0
          END) AS vendasAtual,
      SUM(CASE
            WHEN a.status = 'vendido'
             AND YEAR(a.dataStatus) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
             AND MONTH(a.dataStatus) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
            THEN 1 ELSE 0
          END) AS vendasAnterior
    FROM tbAnuncios a
    WHERE a.idEmpresa = ?
    `,
    [idEmpresa]
  );

  const vendasAtual = Number(salesRows?.[0]?.vendasAtual || 0);
  const vendasAnterior = Number(salesRows?.[0]?.vendasAnterior || 0);

  const [activeRows] = await db.query(
    `
    SELECT COUNT(*) AS ativos
    FROM tbAnuncios
    WHERE idEmpresa = ? AND status = 'ativo'
    `,
    [idEmpresa]
  );
  const ativos = Number(activeRows?.[0]?.ativos || 0);

  const [semana] = await db.query(
    `SELECT dom, seg, ter, qua, qui, sex, sab
     FROM viewVisualizacoesSemana
     WHERE idEmpresa = ?
     LIMIT 1`,
    [idEmpresa]
  );

  return {
    cards: {
      visualizacoesMensais: viewsAtual,
      vendasMes: vendasAtual,
      anunciosAtivos: ativos,
      viewsDeltaPct: pctDelta(viewsAtual, viewsAnterior),
      salesDeltaPct: pctDelta(vendasAtual, vendasAnterior),
    },
    semana: semana?.[0] || { dom: 0, seg: 0, ter: 0, qua: 0, qui: 0, sex: 0, sab: 0 },
  };
}

export async function getMeusAnuncios(idEmpresa) {
  const sql = `
    SELECT
      a.idAnuncio,
      a.nomeProduto,
      a.valorTotal,
      a.quantidade,
      a.unidadeMedida,
      a.status,
      a.dataStatus,
      c.nome AS categoria,
      img.nomeArquivo,
      (
        SELECT COUNT(*)
        FROM tbVisualizacoesAnuncios v
        WHERE v.idAnuncio = a.idAnuncio
      ) AS totalVisualizacoes
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
    WHERE a.idEmpresa = ?
    ORDER BY a.dataStatus DESC
  `;

  const [rows] = await db.query(sql, [idEmpresa]);
  return rows;
}

export async function getMeuAnuncioDetalhe(idEmpresa, idAnuncio) {
  const [rows] = await db.query(
    `
    SELECT
      a.idAnuncio,
      a.idEmpresa,
      a.nomeProduto,
      a.valorTotal,
      a.quantidade,
      a.unidadeMedida,
      a.pesoTotal,
      a.descricao,
      a.condicao,
      a.origem,
      a.composicao,
      a.modalidadeColeta,
      a.status,
      a.dataStatus,
<<<<<<< HEAD
      c.nome AS categoria
=======
      c.idCategoria AS categoria
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
    FROM tbAnuncios a
    LEFT JOIN tbCategorias c ON c.idCategoria = a.idCategoria
    WHERE a.idAnuncio = ? AND a.idEmpresa = ?
    LIMIT 1
    `,
    [idAnuncio, idEmpresa]
  );

  if (!rows.length) return null;

  const [imgs] = await db.query(
    `SELECT idImagem, nomeArquivo
     FROM tbImagensAnuncios
     WHERE idAnuncio = ?
     ORDER BY idImagem ASC`,
    [idAnuncio]
  );

  return { anuncio: rows[0], imagens: imgs };
}

export async function updateMeuAnuncio(idEmpresa, idAnuncio, data, files = [], removerImagensIds = []) {
  try {
    const [own] = await db.query(
      "SELECT idAnuncio FROM tbAnuncios WHERE idAnuncio = ? AND idEmpresa = ? LIMIT 1",
      [idAnuncio, idEmpresa]
    );
    if (!own.length) return "Anúncio não encontrado para sua empresa.";

    const valorTotal = parseCurrency(data.valorTotal);

    const quantidade = Number.parseInt(data.quantidade, 10);
    if (!Number.isFinite(quantidade) || quantidade < 0) return "Quantidade inválida.";

    const pesoTotal = Number.parseFloat((data.pesoTotal ?? "").toString().replace(",", "."));
    const pesoFinal = Number.isFinite(pesoTotal) && pesoTotal >= 0 ? pesoTotal : 0;

    if (removerImagensIds.length) {
      await db.query(
        `DELETE FROM tbImagensAnuncios
         WHERE idAnuncio = ? AND idImagem IN (${removerImagensIds.map(() => "?").join(",")})`,
        [idAnuncio, ...removerImagensIds]
      );
    }

    await db.query(
      `
      UPDATE tbAnuncios
      SET
        nomeProduto = ?,
        valorTotal = ?,
        quantidade = ?,
        unidadeMedida = ?,
        pesoTotal = ?,
        descricao = ?,
        idCategoria = ?,
        condicao = ?,
        origem = ?,
        composicao = ?,
        modalidadeColeta = ?,
        dataStatus = NOW()
      WHERE idAnuncio = ? AND idEmpresa = ?
      `,
      [
        data.nomeProduto,
        valorTotal,
        quantidade,
        data.unidadeMedida,
        pesoFinal,
        data.descricao,
        data.tipo,
        mapCondicao(data.condicao),
        data.origem || null,
        data.composicao || null,
        mapModalidade(data.modalidadeColeta),
        idAnuncio,
        idEmpresa,
      ]
    );

    if (files.length > 0) {
      const values = files.map((file) => [idAnuncio, file.filename]);
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

export async function updateStatusMeuAnuncio(idEmpresa, idAnuncio, status) {
  const allowed = new Set(["ativo", "vendido", "pausado"]);
  if (!allowed.has(status)) return "Status inválido.";

  const [result] = await db.query(
    `UPDATE tbAnuncios
     SET status = ?, dataStatus = NOW()
     WHERE idAnuncio = ? AND idEmpresa = ?`,
    [status, idAnuncio, idEmpresa]
  );

  if (result.affectedRows === 0) return "Anúncio não encontrado para sua empresa.";
  return true;
}

export async function getAnunciosFiltro(filtros = {}) {
  const { categoria, condicao, uf, cidade, precoMin, precoMax } = filtros;

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

export async function deleteMeuAnuncioComImagens(idEmpresa, idAnuncio) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [an] = await conn.query(
      "SELECT idAnuncio FROM tbAnuncios WHERE idAnuncio = ? AND idEmpresa = ? LIMIT 1",
      [idAnuncio, idEmpresa]
    );
    if (!an.length) {
      await conn.rollback();
      return { ok: false, error: "Anúncio não encontrado para sua empresa." };
    }

    const [imgs] = await conn.query(
      "SELECT nomeArquivo FROM tbImagensAnuncios WHERE idAnuncio = ?",
      [idAnuncio]
    );
    const filesToDelete = imgs.map((x) => x.nomeArquivo);

    await conn.query("DELETE FROM tbAnuncios WHERE idAnuncio = ? AND idEmpresa = ?", [
      idAnuncio,
      idEmpresa,
    ]);

    await conn.commit();
    return { ok: true, filesToDelete };
  } catch (err) {
    await conn.rollback();
    return { ok: false, error: err.message };
  } finally {
    conn.release();
  }
}

export async function getCountAnunciosCategoria(idCategoria) {
    const [rows] = await db.query(
        "SELECT COUNT(*) AS total FROM tbAnuncios WHERE idCategoria = ?",
        [idCategoria]
    );
    return rows;
}

export async function getTotalAnuncios() {
    const [rows] = await db.query(
        `SELECT 
            COUNT(CASE WHEN status = 'ativo' THEN 1 END) AS total_atual,
            ROUND(
                ((COUNT(CASE WHEN status = 'ativo' THEN 1 END) - 
                COUNT(CASE WHEN status = 'ativo' AND dataStatus < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END))
                / NULLIF(COUNT(CASE WHEN status = 'ativo' AND dataStatus < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END), 0)) * 100, 
            2) AS percentual_crescimento
        FROM tbAnuncios;`
    );
    return rows;
}

export async function getWeeklyAnnounced() {
    const [rows] = await db.query(
        'SELECT * FROM viewItensAnunciadosUltimas4Semanas'
    );
    return rows;
}

export async function getSemesterSold() {
    const [rows] = await db.query(
        'SELECT * FROM viewVendasUltimos6Meses'
    );
    return rows;
}

export async function getAnunciosPerState() {
    const [rows] = await db.query(
        'SELECT * FROM viewDensidadePorEstado'
    );
    return rows;
}

export async function getAnunciosPerCategory() {
    const [rows] = await db.query(
        'SELECT * FROM viewItensPorCategoriaTop5'
    );
    return rows;
}
