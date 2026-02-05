import { db } from "../config/database.js";

export async function createVerificationCode(idEmpresa, type, duration, code) {
    const typeMapping = {
        1: "2fauth",
        2: "change-pass"
    };

    const enumValue = typeMapping[type];

    if (!enumValue) {
        throw new Error("Tipo de código inválido.");
    }

    const dataExpiracao = new Date();
    dataExpiracao.setMinutes(dataExpiracao.getMinutes() + duration);

    const query = `
        INSERT INTO tbCodigosVerificacao (idEmpresa, tipo, dataExpiracao, codigo)
        VALUES (?, ?, ?, ?)
    `;

    try {
        const [result] = await db.execute(query, [
            idEmpresa, 
            enumValue, 
            dataExpiracao, 
            code
        ]);
        
        return result;
    } catch (error) {
        console.error("[-] Erro ao inserir código de verificação:", error);
        throw error;
    }
}

export async function getLastVerificationCode(idEmpresa) {
    const [rows] = await db.query(
        "SELECT * FROM tbCodigosVerificacao WHERE idEmpresa = ? ORDER BY dataCriacao DESC LIMIT 1",
        [idEmpresa]
    );
    return rows;
}

export async function deleteUsedCode(idEmpresa) {
    try{
        const result = await db.query(
            "DELETE FROM tbCodigosVerificacao WHERE idEmpresa = ? AND tipo = '2fauth'",
            [idEmpresa]
        );
        return result;
    } catch(err) {
        console.error("[-] Erro ao deletar código de verificação:", err);
        throw err;
    }
}