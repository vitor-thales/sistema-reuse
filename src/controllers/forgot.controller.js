import path from "path";
import bcrypt from "bcryptjs";

import { publicDir } from "../utils/paths.js";
import { sendPasswordResetEmail } from "../utils/sendMail.js";
import { env } from "../config/env.js";

import { createVerificationCode, getLastVerificationCode, deleteUsedCode } from "../models/verification.model.js";
import { getEmpresaCredentials, getEmpresa, resetPassword } from "../models/empresas.model.js";

async function generateAndSendCode(empresaId, email, nome) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    await createVerificationCode(empresaId, 2, 1440, code);

    await sendPasswordResetEmail(empresaId, email, nome, code);

    return code;
}

async function isRateLimited(empresaId) {
    const lastCode = await getLastVerificationCode(empresaId, 2); 

    if (!lastCode || lastCode.length == 0) return false;

    const lastSent = new Date(lastCode[0].dataCriacao).getTime();
    const now = new Date().getTime();
    const diffSeconds = (now - lastSent) / 1000;

    return diffSeconds < 60;
}

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/forgot.html"));
    },

    async getPageChangePass(req, res) {
        const code = req.params.code;
        const id = parseInt(req.params.id);

        if(!code || code.length != 6) return res.status(400).json({error: "Código inválido!"});
        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido!"});

        const lastVerificationCode = await getLastVerificationCode(id, 2);
        const verificationData = lastVerificationCode[0];

        if (!verificationData || verificationData.codigo !== code) 
            return res.status(401).json({error: "Código inválido."});

        const now = new Date();
        const expiration = new Date(verificationData.dataExpiracao);

        if (now > expiration) 
            return res.status(400).json({error: "Código expirado"});

        res.sendFile(path.join(publicDir, "pages/reset.html"));  
    },

    async sendMail(req, res) {
        const {cnpj} = req.body;
        
        const account = await getEmpresaCredentials(cnpj);
        if(account.length === 0) return res.status(400).json({error: "Não foi encontrada uma conta cadastrada com este CNPJ, caso acredite que seja um erro entre em contato com nosso suporte."});

        const rateLimited = await isRateLimited(account[0].idEmpresa);
        if(rateLimited) return res.status(429).json({error: "Você já pediu para redefinir sua senha! Aguarde para solicitar um novo e-mail."});

        try {
            await generateAndSendCode(
                account[0].idEmpresa,
                account[0].emailCorporativo,
                account[0].nomeResponsavel
            );
            return res.status(200).json({message: "sucesso"});
        } catch (err) {
            return res.status(500).json({error: "Erro ao processar a solicitação."});
        }
    },

    async resetPass(req, res) {
        const { novaSenha, confirmarSenha, idUsuario, codigoReset } = req.body;
        if(!novaSenha || !confirmarSenha || !idUsuario || !codigoReset) 
            return res.status(400).json({error: "Um ou mais campos inválidos ou não preenchidos!"});
        
        if(novaSenha !== confirmarSenha) return res.status(400).json({error: "As senhas devem ser idênticas!"});

        const empresa = await getEmpresa(idUsuario);
        if(!empresa || empresa.length == 0) return res.status(400).json({error: "Id de usuário inválido!"});

        const code = await getLastVerificationCode(idUsuario, 2);

        if(!code || code.length == 0 || code[0].codigo !== codigoReset) return res.status(400).json({error: "Código inválido!"});
        
        const pass = await bcrypt.hash(novaSenha, env.SALT);

        const result = await resetPassword(idUsuario, pass);
        if(result !== true) return res.status(500).json({error: "Erro ao alterar a senha do usuário"});

        await deleteUsedCode(idUsuario, 2);

        res.status(200).json({message: "Sucesso"});
    }
}