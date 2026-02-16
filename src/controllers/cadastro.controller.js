import path from "path";
import bcrypt from "bcryptjs";

import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";
import { sendSolicitationEmail } from "../utils/sendMail.js";

import { insertEmpresa, isEmailTaken } from "../models/empresas.model.js";


export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/cadastro.html"));
    },

    async getSuccess(req, res) {
        res.sendFile(path.join(publicDir, "pages/cadastro.sucesso.html"));
    },

    async sendRequisition(req, res) {
        const data = req.body;
        if(!data) return res.status(500).json({error: "No body was found on the request."});

        if (await isEmailTaken(data.email_corp)) {
            return res.status(400).json({error: "Este e-mail já está em uso no sistema."});
        }

        data.senha = await bcrypt.hash(data.senha, env.SALT);

        data.comprovante_end = req.files?.comprovante_end?.[0].filename || null;
        data.cartao_cnpj = req.files?.cartao_cnpj?.[0].filename || null;
        data.contrato_social = req.files?.contrato_social?.[0].filename || null;

        const result = await insertEmpresa(data);

        if(result != true) return res.status(500).json({error: result});
        else { 
            sendSolicitationEmail(data.email_corp, data.nome_resp);
            return res.status(200).json({message: "Success"});
        }
    }
};