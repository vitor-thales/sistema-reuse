import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

import { getConversationsWithLastMessage, getMessagesByConversation, findOrCreateConversation, getUserPublicKey } from "../models/messages.model.js";

export default {
    async getConversations(req, res) {
        try {
            const token = req.cookies?.reuseToken;
            const payload = await jwt.verify(token, env.JWT_SECRET);
            const conversations = await getConversationsWithLastMessage(payload.id);
            res.json(conversations);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao carregar conversas" });
        }
    },

    async getUserData(req, res) {
        try {
            const token = req.cookies?.reuseToken;
            const payload = await jwt.verify(token, env.JWT_SECRET);
            const userPublicKey = await getUserPublicKey(payload.id);
            if(userPublicKey.length === 0) return res.status(400).json({ error: "Usuário inválido" });
            res.json({id: payload.id, pk: userPublicKey[0].ikPublica});
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao carregar dados do usuário" });
        }
    },

    async loadMessages(req, res) {
        try {
            const token = req.cookies?.reuseToken;
            const payload = await jwt.verify(token, env.JWT_SECRET);
            const idConversa = req.params.id;
            const offset = req.query.offset || 0;

            const messages = await getMessagesByConversation(idConversa, payload.id, offset);
            res.json(messages);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao carregar mensagens" });
        }
    },

    async startConversation(req, res) {
        try {
            const token = req.cookies?.reuseToken;
            const payload = await jwt.verify(token, env.JWT_SECRET);
            const partnerId = req.body.partnerId;

            if (!partnerId) return res.status(400).json({ error: "ID do parceiro é obrigatório" });
            if (partnerId === payload.id) return res.status(400).json({ error: "Não pode iniciar conversa consigo mesmo" });

            const idConversa = await findOrCreateConversation(payload.id, partnerId);
            res.json({ idConversa });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao iniciar conversa" });
        }
    }
}