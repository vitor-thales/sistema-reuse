import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { publicDir } from "../utils/paths.js"
import { env } from "../config/env.js";

import { checkPermissionLevel } from "../utils/checkPermission.js";
import { sendWelcomeEmail } from "../utils/sendMail.js";

import { getAdmin, getMany, getTotal, createAdmin, editAdmin, deleteAdmin } from "../models/admins.model.js";

function generatePassword(length = 16) {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%&*+:;?-=";

    const allChars = uppercase + lowercase + numbers + symbols;
    let password = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    return password;
}

export default {
    async getDashboard(req, res) {
        res.sendFile(path.join(publicDir, "pages/admin.dashboard.html"));
    },

    async getUsuarios(req, res) {
        res.sendFile(path.join(publicDir, "pages/admin.usuarios.html"));
    },

    async getPermissions(req, res) {
        const token = req.cookies?.reuseToken;

        if (!token) return res.status(401).json({ error: "Token não encontrado" });

        try {
            const payload = jwt.verify(token, env.JWT_SECRET);
            if(payload.role !== "admin") return res.status(401).json({ error: "Token não encontrado!" });

            const permissions = await checkPermissionLevel(payload.id);

            res.json({permissions});
        }catch(err) {
            return res.status(401).json({ error: "Token inválido" });
        }
    },

    async getUserInfo(req, res) {
        const token = req.cookies?.reuseToken;

        if (!token) return res.status(401).json({ error: "Token não encontrado!" });

        try {
            const payload = jwt.verify(token, env.JWT_SECRET);
            if(payload.role !== "admin") return res.status(401).json({ error: "Token não encontrado!" });

            const info = await getAdmin(payload.id);
            if(!info || info.length == 0) return res.status(400).json({ error: "Usuário não encontrado!" });

            const data = {
                nome: info[0].nome,
                cargo: info[0].cargo
            };

            res.json({ data });
        } catch(err) {
            return res.status(401).json({ error: "Token inválido" });
        }
    },

    async getUsers(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const skip = (page - 1) * limit;

        try {
            const users = await getMany(skip, limit, search);
            const total = await getTotal(search);
            
            const totalPages = Math.ceil(total[0].total / limit);

            res.json({ users, totalPages });
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            res.status(500).json({ error: "Erro interno no servidor" });
        }
    },

    async getUser(req, res) {
        const id = parseInt(req.params.id);
        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido"});

        const result = await getAdmin(id);
        if(result.length === 0) return res.status(400).json({error: "Não existe um usuário com este id"});

        res.json({result: result[0]});
    },

    async createUser(req, res) {
        const data = req.body;

        if(data.senha === "") {
            data.senha = generatePassword();
        }

        let senhaOriginal = data.senha;
        data.senha = await bcrypt.hash(data.senha, env.SALT);

        const result = await createAdmin(data);
        if(result !== true) {
            console.error(result);
            return res.status(500).json({error: "Erro ao cadastrar novo usuário"});
        }

        sendWelcomeEmail(data.email, data.nome, senhaOriginal);

        res.status(200).json({ message: "Usuário criado com succeso!" });
    },

    async editUser(req, res) {
        const id = parseInt(req.params.id);
        const data = req.body;
        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido"});
  
        const changePass = data.senha === "" ? data.senha : ", senhaHash = ?";
        const senhaHash = await bcrypt.hash(data.senha, env.SALT);

        const result = await editAdmin(id, data, changePass, senhaHash);
        if(result !== true) {
            console.error(result);
            return res.status(500).json({ error: "Erro ao editar o usuário" });
        }

        res.json({message: "Usuário editado com sucesso!"});
    },

    async deleteUser(req, res) {
        const id = parseInt(req.body.id);

        if(!id || !Number.isInteger(id)) return res.status(400).json({error: "Id inválido!"});
        
        const result = await deleteAdmin(id);
        if(result !== true) {
            console.error(result);
            return res.status(500).json({error: "Erro ao deletar o usuário"});
        }

        res.json({message: "Usuário deletado com sucesso"});
    }
}