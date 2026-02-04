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
        
        console.log(`[+] Código ${enumValue} gerado para empresa ${idEmpresa}`);
        return result;
    } catch (error) {
        console.error("[-] Erro ao inserir código de verificação:", error);
        throw error;
    }
}