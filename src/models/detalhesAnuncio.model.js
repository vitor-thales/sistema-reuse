import { db } from "../config/database.js";

export async function getDetalhesAnuncioById(idAnuncio) {
    const sql = `
        SELECT
            a.idAnuncio,
            a.idEmpresa,
            a.nomeProduto,
            a.valorTotal,
            a.quantidade,
            a.unidadeMedida,
            a.pesoTotal,
            a.descricao,
            a.idCategoria,
            a.condicao,
            a.origem,
            a.composicao,
            a.modalidadeColeta,
            a.status,
            a.dataStatus AS dataPublicacao,

            e.nomeFantasia AS nomeEmpresa,
            e.cidade,
            e.estado,

            c.nome AS categoria
        FROM tbAnuncios a
        JOIN tbEmpresas e ON e.idEmpresa = a.idEmpresa
        LEFT JOIN tbCategorias c ON c.idCategoria = a.idCategoria
        WHERE a.idAnuncio = ?
        LIMIT 1
        `;

    const [rows] = await db.query(sql, [idAnuncio]);
    if (!rows.length) return null;

    const anuncio = rows[0];

    let imagens = [];
    try {
        const sqlImgs = `
      SELECT nomeArquivo
      FROM tbImagensAnuncios
      WHERE idAnuncio = ?
      ORDER BY idImagem ASC
    `;

        const [imgRows] = await db.query(sqlImgs, [idAnuncio]);
        imagens = imgRows.map((r) => r.nomeArquivo).filter(Boolean);
    } catch (err) {
        console.warn("Aviso: não foi possível buscar imagens (tbImagensAnuncios).", err?.message);
        imagens = [];
    }

    return {
        ...anuncio,
        imagens,
    };
}
