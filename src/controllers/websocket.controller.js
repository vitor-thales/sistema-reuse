import { createE2EData, markAsRead, verifyChatParticipants } from "../models/messages.model.js";

export default {
    io: null,

    init(socket, io) {
        this.io = io;

        socket.on("join", (userId) => {
            socket.join(`user_${userId}`);
        });

        socket.on("send_message", (data) => this._handleMessage(data));

        socket.on("mark_as_read", (data) => this._handleReadStatus(data));
    },

    async _handleMessage(data) {
        try {
            const { idRemetente, idDestinatario, idConversa } = data;

            if (idRemetente === idDestinatario) {
                throw new Error("Você não pode enviar mensagens para si mesmo.");
            }

            const isParticipant = await verifyChatParticipants(idConversa, idRemetente, idDestinatario);
            if (!isParticipant) {
                throw new Error("Conversa inválida ou você não faz parte dela.");
            }

            const msgId = await createE2EData(data);
            
            const messageToPush = {
                idMensagem: msgId,
                ...data,
                dataEnvio: new Date()
            };

            this.io.to(`user_${data.idDestinatario}`).emit("receive_message", messageToPush);
            this.io.to(`user_${data.idRemetente}`).emit("message_confirm", messageToPush);

        } catch(err) {
            console.error("[socket] Erro ao processar mensagem: ", err.message);
            this.io.to(`user_${data.idRemetente}`).emit("error", err.message || "Erro ao processar mensagem.");
        }
    },

    async _handleReadStatus(data) {
        try {
            const { idConversa, idUsuario, lastMessageId, recipientId } = data;

            await markAsRead(idConversa, idUsuario, lastMessageId);

            this.io.to(`user_${recipientId}`).emit("messages_read_update", {
                idConversa,
                lastReadId: lastMessageId
            });
        } catch (err) {
            console.error("[socket] Erro ao marcar como lida:", err);
        }
    }
}