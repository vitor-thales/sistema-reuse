import { db } from "../config/database.js";

export async function getEmpresaCredentials(login) {
    const [rows] = await db.query(
        "SELECT * FROM tbEmpresas WHERE cnpj = ? OR emailCorporativo = ?",
        [login, login]
    );
    return rows;
}
