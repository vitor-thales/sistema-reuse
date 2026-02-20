import path from "path";
import bcrypt from "bcryptjs";
import fs from "fs/promises";

import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";
import { sendSolicitationEmail } from "../utils/sendMail.js";

import { insertEmpresa, isEmailTaken } from "../models/empresas.model.js";

async function cleanupFiles(files) {
    if (!files) return;
    const allFiles = Object.values(files).flat();
    await Promise.all(allFiles.map(file => fs.unlink(file.path).catch(() => {})));
}

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/cadastro.html"));
    },

    async getSuccess(req, res) {
        res.sendFile(path.join(publicDir, "pages/cadastro.sucesso.html"));
    },

    async sendRequisition(req, res) {
        const data = req.body;
        if(!data) return res.status(500).json({error: "Corpo da requisição não encontrado."});

        try {
            if (await isEmailTaken(data.email_corp)) {
                await cleanupFiles(req.files);
                return res.status(400).json({error: "Este e-mail já está em uso no sistema."});
            }

            data.senha = await bcrypt.hash(data.senha, env.SALT);

            data.comprovante_end = req.files?.comprovante_end?.[0].filename || null;
            data.cartao_cnpj = req.files?.cartao_cnpj?.[0].filename || null;
            data.contrato_social = req.files?.contrato_social?.[0].filename || null;

            const result = await insertEmpresa(data);

            if(result !== true) {
                await cleanupFiles(req.files);

                if (result.errno === 1062 || result.code === 'ER_DUP_ENTRY') {
                    const message = result.sqlMessage || "";
                    
                    if (message.includes('cnpj')) return res.status(400).json({error: "Este CNPJ já está cadastrado."});
                    if (message.includes('cpfResponsavel')) return res.status(400).json({error: "Este CPF de responsável já está em uso."});
                    if (message.includes('razaoSocial')) return res.status(400).json({error: "Esta Razão Social já está cadastrada."});
                    if (message.includes('foneCorporativo')) return res.status(400).json({error: "Este telefone já está em uso."});
                    
                    return res.status(400).json({error: "Um dos dados informados já existe no sistema."});
                }

                return res.status(500).json({error: "Erro interno ao processar cadastro."});
            }

            sendSolicitationEmail(data.email_corp, data.nome_resp);
            return res.status(200).json({message: "Success"});

        } catch (error) {
            await cleanupFiles(req.files);
            console.error("Controller Error:", error);
            return res.status(500).json({error: "Erro inesperado no servidor."});
        }
    }
};