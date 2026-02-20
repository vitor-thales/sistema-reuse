import { db } from "../config/database.js"; 

export async function validateUser(id, role) {
    if (role === "admin") {
        const [rows] = await db.query(
            "SELECT idUsuario FROM tbUsuariosSistema WHERE idUsuario = ? AND status = 1", 
            [id]
        );
        return rows.length > 0;
    } else {
        const [empresa] = await db.query(
            "SELECT idEmpresa FROM tbEmpresas WHERE idEmpresa = ? AND cadastroAtivo = 1", 
            [id]
        );
        return empresa.length > 0
    }
}