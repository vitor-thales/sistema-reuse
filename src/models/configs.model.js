import { db } from "../config/database.js";

export async function getEmpresaConfig(id) {
    const [rows] = await db.query(
        "SELECT * FROM tbConfigEmpresas WHERE idEmpresa = ?",
        [id]
    );
    return rows;
}