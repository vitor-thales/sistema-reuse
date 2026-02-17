import { db } from "../config/database.js";
import bcrypt from "bcrypt";

export async function getEmpresaCredentials(login) {
    const [rows] = await db.query(
        "SELECT * FROM tbEmpresas WHERE cnpj = ? OR emailCorporativo = ?",
        [login, login]
    );
    return rows;
}

export async function updateSenhaEmpresa(idEmpresa, senhaAtual, senhaNova) {
    // 🔎 mostra qual DB o Node está usando
    const [dbinfo] = await db.query("SELECT DATABASE() AS db, USER() AS user");
    console.log("DB em uso pelo Node:", dbinfo[0]);

    const [rows] = await db.query(
        "SELECT senhaHash FROM tbEmpresas WHERE idEmpresa = ? LIMIT 1",
        [idEmpresa]
    );

    if (!rows.length) return "Empresa não encontrada.";

    const hashBanco = rows[0].senhaHash;
    const senhaAtualLimpa = String(senhaAtual ?? "").trim();

    const hashNormalizado = String(hashBanco).replace(/^\$2y\$/, "$2b$");

    console.log("senhaAtual(trim):", JSON.stringify(senhaAtualLimpa));
    console.log("hashBanco:", hashBanco);
    console.log("hashNormalizado:", hashNormalizado);
    console.log("hashBanco length:", hashBanco?.length);

    const ok = await bcrypt.compare(senhaAtualLimpa, hashNormalizado);

    console.log("bcrypt.compare:", ok);

    if (!ok) return "Senha atual incorreta."; 

    const novoHash = await bcrypt.hash(senhaNova, 10);

    await db.query(
        "UPDATE tbEmpresas SET senhaHash = ? WHERE idEmpresa = ?",
        [novoHash, idEmpresa]
    );

    return true;
}