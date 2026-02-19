import { db } from "../config/database.js";

<<<<<<< HEAD
=======
export async function sawPublication(idAnuncio, idEmpresa) {
    const [rows] = await db.query(
        "SELECT * FROM tbVisualizacoesAnuncios WHERE idAnuncio = ? AND idEmpresa = ?",
        [idAnuncio, idEmpresa]
    );
    return rows;
}

export async function registerVisualization(idAnuncio, idEmpresa) {
    try {
        await db.query(
            "INSERT INTO tbVisualizacoesAnuncios (idAnuncio, idEmpresa) VALUES (?, ?)",
            [idAnuncio, idEmpresa]
        );
        return true;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
export async function getVisualizationsByInteractions() {
    const [rows] = await db.query(
        'SELECT * FROM viewFunilConversaoTotal'
    );
    return rows;
}

export async function getWeeklyVisualizations() {
    const [rows] = await db.query(
        `SELECT 
            COALESCE(SUM(dom), 0) AS dom,
            COALESCE(SUM(seg), 0) AS seg,
            COALESCE(SUM(ter), 0) AS ter,
            COALESCE(SUM(qua), 0) AS qua,
            COALESCE(SUM(qui), 0) AS qui,
            COALESCE(SUM(sex), 0) AS sex,
            COALESCE(SUM(sab), 0) AS sab
        FROM viewVisualizacoesSemana;`
    );
    return rows;
}