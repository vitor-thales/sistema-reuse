import path from "path";
import jwt from "jsonwebtoken";
import { publicDir } from "../utils/paths.js";
import { env } from "../config/env.js";
import ConfigEmpresasModel from "../models/configuracaoEmpresa.model.js";
import bcrypt from "bcrypt";

export default {
    async getPage(req, res) {
        res.sendFile(path.join(publicDir, "pages/configuracoes.html"));
    },

    async checkAuth(req, res) {
        const token = req.cookies.reuseToken;

        if (!token)
            return res.json({ loggedIn: false });

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            return res.json({ loggedIn: true, id: decoded.id });

        } catch {
            return res.json({ loggedIn: false });
        }
    },

    async update(req, res) {
        const data = req.body;
        const errors = [];

        if (data.cnpj) data.cnpj = data.cnpj.replace(/\D/g, '');
        if (data.telefone) data.telefone = data.telefone.replace(/\D/g, '');
        if (data.cep) data.cep = data.cep.replace(/\D/g, '');

        if (data.nomeFantasia) data.nomeFantasia = data.nomeFantasia.trim();
        if (data.razaoSocial) data.razaoSocial = data.razaoSocial.trim();

        if (!data.nomeFantasia || data.nomeFantasia.length < 2) {
            errors.push({
                field: "nomeFantasia",
                message: "Nome fantasia deve ter pelo menos 2 caracteres"
            });
        } else if (!/^[A-Za-zÀ-ÿ0-9\s]+$/.test(data.nomeFantasia)) {
            errors.push({
                field: "nomeFantasia",
                message: "Nome fantasia possui caracteres inválidos"
            });
        }

        if (!data.cnpj || data.cnpj.length !== 14) {
            errors.push({
                field: "cnpj",
                message: "CNPJ deve conter 14 números"
            });
        }

        if (!data.telefone || data.telefone.length < 10 || data.telefone.length > 11) {
            errors.push({
                field: "telefone",
                message: "Telefone inválido"
            });
        }

        if (!data.cep || data.cep.length !== 8) {
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

    async updateToggle(req, res) {
        const token = req.cookies.reuseToken;
        if (!token) {
            return res.status(401).json({ error: "Não autenticado" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, env.JWT_SECRET);
        } catch {
            return res.status(401).json({ error: "Token inválido" });
        }

        const idEmpresa = decoded.id;
        const toggleData = req.body;

        try {
            await ConfigEmpresasModel.upsert(idEmpresa, toggleData);

            return res.json({
                success: true,
                message: "Configuração atualizada"
            });

        } catch (err) {
            console.error(err);
            return res.status(500).json({
                error: "Erro ao salvar configuração"
            });
        }
    },

    async getConfig(req, res) {
        const token = req.cookies.reuseToken;
        if (!token) return res.status(401).json({ error: "Não autenticado" });

        const decoded = jwt.verify(token, env.JWT_SECRET);

        const config = await ConfigEmpresasModel.getByEmpresaId(decoded.id);
        return res.json(config || {});
    },

    async updateConfig(req, res) {
        const token = req.cookies.reuseToken;
        if (!token) return res.status(401).json({ error: "Não autenticado" });

        const decoded = jwt.verify(token, env.JWT_SECRET);

        await ConfigEmpresasModel.upsert(decoded.id, req.body);

        return res.json({ success: true });
    },

    async trocarSenha() {
        const senhaAtual = document.getElementById("senhaAtual")?.value || "";
        const senhaNova = document.getElementById("senhaNova")?.value || "";

        if (!senhaAtual || !senhaNova) {
            alert("Preencha a senha atual e a senha nova.");
            return;
        }

        if (!validarSenhaNova(senhaNova)) {
            alert("A senha nova deve ter no mínimo 8 caracteres, pelo menos 1 letra maiúscula e pelo menos 1 número.");
            return;
        }

        try {
            const r = await fetch("/configuracoes/senha", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ senhaAtual, senhaNova })
            });

            const d = await r.json();

            if (!r.ok) {
                alert(d.message || "Não foi possível trocar a senha.");
                return;
            }

            alert("Senha atualizada com sucesso!");
            document.getElementById("senhaAtual").value = "";
            document.getElementById("senhaNova").value = "";

        } catch (e) {
            console.error(e);
            alert("Erro de conexão.");
        }
    },

    async updatePassword(req, res) {

        const token = req.cookies.reuseToken;

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Não autenticado"
            });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, env.JWT_SECRET);
        } catch {
            return res.status(401).json({
                status: "error",
                message: "Token inválido"
            });
        }

        const { senhaAtual, senhaNova } = req.body;

        if (!senhaAtual || !senhaNova) {
            return res.status(400).json({
                status: "validation_error",
                message: "Preencha a senha atual e a nova"
            });
        }

        const regexSenha = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!regexSenha.test(senhaNova)) {
            return res.status(400).json({
                status: "validation_error",
                message:
                    "A senha nova deve ter no mínimo 8 caracteres, uma letra maiúscula e um número"
            });
        }

        try {

            const [rows] = await req.db.query(
                "SELECT senha FROM tbEmpresas WHERE idEmpresa = ? LIMIT 1",
                [decoded.id]
            );

            if (!rows.length) {
                return res.status(404).json({
                    status: "error",
                    message: "Empresa não encontrada"
                });
            }

            const hashBanco = rows[0].senha;

            const confere = await bcrypt.compare(senhaAtual, hashBanco);

            if (!confere) {
                return res.status(400).json({
                    status: "validation_error",
                    message: "Senha atual incorreta"
                });
            }

            const novoHash = await bcrypt.hash(senhaNova, 10);

            await req.db.query(
                "UPDATE tbEmpresas SET senha = ? WHERE idEmpresa = ?",
                [novoHash, decoded.id]
            );

            return res.json({
                status: "success",
                message: "Senha alterada com sucesso"
            });

        } catch (err) {

            console.error(err);

            return res.status(500).json({
                status: "error",
                message: "Erro interno no servidor"
            });

        }
    }
};
