import { db } from "../config/database.js";

export async function getAdminCredentials(login) {
    const [rows] = await db.query(
        "SELECT * FROM tbUsuariosSistema WHERE email = ?",
        [login]
    );
    return rows;
}

export async function getAdmin(id) {
    const [rows] = await db.query(
        "SELECT * FROM tbUsuariosSistema WHERE idUsuario = ?",
        [id]
    );
    return rows;
}