import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

import { getConversationsWithLastMessage, getMessagesByConversation } from "../models/messages.model.js";

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
    }
}