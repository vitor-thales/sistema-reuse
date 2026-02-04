import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";
import { generateToken, generateTFToken } from "../utils/generateToken.js";
import { sendTwoFactorEmail } from "../utils/sendMail.js";
import { sendVerificationSMS } from "../utils/sendSms.js";

import { getEmpresaCredentials, getEmpresa } from "../models/empresas.model.js";
import { getEmpresaConfig } from "../models/configs.model.js";
import { createVerificationCode } from "../models/verification.model.js";

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/login.html"));
    },

    async login(req, res) {
        const { login, password } = req.body;
        try {
            const result = await getEmpresaCredentials(login);
            
            if (result.length == 0 || !result[0].cadastroAtivo)
                return res
                    .status(404)
                    .json({ error: "E-mail ou senha incorretos" });

            const match = await bcrypt.compare(password, result[0].senhaHash);

            if (!match)
                return res
                    .status(404)
                    .json({ error: "E-mail ou senha incorretos" });

            const config = await getEmpresaConfig(result[0].idEmpresa);
            console.log(config);
            if (result.length == 0)
                return res
                    .status(500)
                    .json({ error: "Erro ao carregar configurações, por favor, entre em contato com nosso suporte." });

            const payload = { id: result[0].idEmpresa };
                    
            if (config[0].segAutDuasEtapas) {
                const tfToken = generateTFToken(payload);
                res.cookie("reuseTFToken", tfToken, {
                    httpOnly: true,
                    maxAge: env.TOKEN_EXPIRY
                });
                return res.redirect("/login/verificar"); //FIX THIS
            }
            
            const token = generateToken(payload);

            res.cookie("reuseToken", token, {
                httpOnly: true,
                maxAge: env.TOKEN_EXPIRY,
            });
            res.json({ message: "Login realizado com sucesso!" });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    async getTFAuthPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/tfauth.html"));
    },

    async sendTFCode(req, res) {
        const { method } = req.body;
        if(!method) return res.status(400).json({error: "Nenhum método selecionado!"});

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const tfToken = req.cookies.reuseTFToken;

        let payload;

        try {
            payload = jwt.verify(tfToken, env.TFAUTH_JWT_SECRET);
        } catch(err) {
            return res.status(400).json({error: "Token de Verificação em 2 Etapas Inválido!"});
        }

        const empresa = getEmpresa(payload.id);
        if(empresa.length === 0) return res.status(400).json({error: "Id de empresa inválido"});

        try {
            if(method === 'email') {
                sendTwoFactorEmail(empresa[0].emailCorporativo, empresa[0].nomeResponsavel, code);
            } else {
                sendVerificationSMS(empresa[0].foneCorporativo, code);
            }
        } catch(err) {
            return res.status(400).json({error: "Erro ao enviar código de verificação em duas etapas."});
        }

        try{
            createVerificationCode(payload.id, 1, 15, code);
            return res.status(200).send();
        } catch(err) {
            res.status(500).json({error: err});
        }
    },

    async TFAuth(req, res) {

    },

    async loggedIn(req, res) {
        res.status(200).json({loggedIn: true});
    }
};
