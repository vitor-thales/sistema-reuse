import path from "path";
import jwt from "jsonwebtoken";
import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";
import ConfigEmpresasModel from "../models/configuracaoEmpresa.model.js";
import { getEmpresa, updateSenhaEmpresa } from "../models/empresas.model.js";
import bcrypt from "bcrypt";
import { changePrivateKeyPassword } from "../utils/crypto.js";

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/configuracoes.html"));
    },

    async updatePassword(req, res) {
        try {
            const token = req.cookies?.reuseToken;
            if (!token) return res.status(401).json({ message: "Não autenticado" });

            let decoded;
            try {
                decoded = jwt.verify(token, env.JWT_SECRET);
            } catch {
                return res.status(401).json({ message: "Token inválido" });
            }

            const { senhaAtual, senhaNova } = req.body;

            if (!senhaAtual || !senhaNova) {
                return res.status(400).json({ message: "Preencha senha atual e senha nova." });
            }

            const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!regex.test(senhaNova)) {
                return res.status(400).json({
                    message: "A senha nova deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 número."
                });
            }

            const empresa = await getEmpresa(decoded.id);
            if(empresa.length === 0) return res.status(400).json({message: "Empresa inválida"});

            const senhaHash = empresa[0].senhaHash;
            const match = await bcrypt.compare(senhaAtual, senhaHash);
            if(!match) return res.status(401).json({message: "Senha atual inválida!"});

            const novoHash = await bcrypt.hash(senhaNova, env.SALT);

            const keys = await changePrivateKeyPassword(
                empresa[0].ikPrivada, empresa[0].salt, empresa[0].iv,
                senhaAtual, senhaNova
            );

            const result = await updateSenhaEmpresa(decoded.id, novoHash, keys);

            if (result !== true) {
                return res.status(400).json({ message: result });
            }

            return res.json({ message: "Senha alterada com sucesso!" });
        } catch (err) {
            console.error("updatePassword error:", err);
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
    },

    async update(req, res) {
        const token = req.cookies?.reuseToken;
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const data = req.body;
        const errors = [];

        if (data.foneCorporativo) data.foneCorporativo = data.foneCorporativo.replace(/\D/g, '');
        if (data.cepEmpresa) data.cepEmpresa = data.cepEmpresa.replace(/\D/g, '');

        if (!data.foneCorporativo || data.foneCorporativo.length < 10 || data.foneCorporativo.length > 11) {
            errors.push({
                field: "telefone",
                message: "Telefone inválido"
            });
        }

        if (!data.cepEmpresa || data.cepEmpresa.length !== 8) {
            errors.push({
                field: "cep",
                message: "CEP inválido"
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({
                status: "validation_error",
                errors
            });
        }

        try {
            const currentConfig = await ConfigEmpresasModel.getByEmpresaId(decoded.id);
            const mergedData = { ...currentConfig, ...data };

            const result = await ConfigEmpresasModel.updateFullConfig(decoded.id, mergedData);
            if(result !== true) return res.status(500).json({status: "error", message: "Erro interno do servidor"});

            return res.status(200).json({
                status: "success",
                message: "Configurações atualizadas com sucesso"
            });

        } catch (err) {
            return res.status(500).json({
                status: "error",
                message: "Erro interno no servidor"
            });
        }
    },

    async getConfig(req, res) {
        const token = req.cookies.reuseToken;
        if (!token) return res.status(401).json({ error: "Não autenticado" });

        const decoded = jwt.verify(token, env.JWT_SECRET);

        const config = await ConfigEmpresasModel.getByEmpresaId(decoded.id);
        return res.json(config || {});
    }
};
