import { db } from "../config/database.js";

export async function getMonthTotalMessages() {
    const [rows] = await db.query(
        `SELECT 
            COUNT(CASE WHEN dataEnvio >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END) AS total_mes_atual,
            ROUND(
                ((COUNT(CASE WHEN dataEnvio >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END) - 
                COUNT(CASE WHEN dataEnvio >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01') 
                            AND dataEnvio < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END))
                / NULLIF(COUNT(CASE WHEN dataEnvio >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01') 
                                    AND dataEnvio < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN 1 END), 0)) * 100, 
            2) AS percentual_crescimento
        FROM tbMensagens
        WHERE dataEnvio >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01');`
    );
    return rows;
}

export async function createE2EData(payload) {
    const connection = await db.getConnection(); 

    try {
        await connection.beginTransaction();

        const [res] = await connection.query(
            `INSERT INTO tbMensagens (idConversa, idRemetente, idDestinatario, content, iv, sig, entregue)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                payload.idConversa, 
                payload.idRemetente, 
                payload.idDestinatario, 
                payload.content, 
                payload.iv, 
                payload.signature,
                true
            ]
        );

        const lastId = res.insertId;

        await connection.query(
            `INSERT INTO tbMensagensKeys (idMensagem, idEmpresa, wrappedKey)
            VALUES (?, ?, ?), (?, ?, ?)`,
            [
                lastId, payload.idRemetente, payload.keyForSender, 
                lastId, payload.idDestinatario, payload.keyForRecipient
            ]
        );

        await connection.commit();
        return lastId;
    } catch (err) {
        await connection.rollback();
        console.error("Database Transaction Error:", err);
        throw err; 
    } finally {
        connection.release();
    }
}

export async function markAsRead(idConversa, idUsuario, lastMessageId) {
    try {
        await db.query(
            `UPDATE tbMensagens 
            SET lida = TRUE 
            WHERE idConversa = ? AND idDestinatario = ? AND idMensagem <= ?`,
            [idConversa, idUsuario, lastMessageId]
        );
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const getConversationsWithLastMessage = async (userId) => {
    const [rows] = await db.query(`
        SELECT 
            c.idConversa,
            e.nomeFantasia AS partnerName,
            e.razaoSocial AS scndPartnerName,
            e.idEmpresa AS partnerId,
            e.ikPublica AS partnerPublicKey,
            m.content AS lastMessageContent,
            m.iv AS lastMessageIv,
            m.dataEnvio,
            m.lida,
            m.idRemetente,
            k.wrappedKey
        FROM tbConversas c
        JOIN tbEmpresas e ON (c.idEmpresa1 = e.idEmpresa OR c.idEmpresa2 = e.idEmpresa) AND e.idEmpresa != ?
        LEFT JOIN tbMensagens m ON m.idMensagem = (
            SELECT MAX(idMensagem) 
            FROM tbMensagens 
            WHERE idConversa = c.idConversa
        )
        LEFT JOIN tbMensagensKeys k ON m.idMensagem = k.idMensagem AND k.idEmpresa = ?
        WHERE c.idEmpresa1 = ? OR c.idEmpresa2 = ?
        ORDER BY m.dataEnvio DESC
    `, [userId, userId, userId, userId]);
    return rows;
};

export async function findOrCreateConversation(id1, id2) {
    const [existing] = await db.query(
        `SELECT idConversa FROM tbConversas 
         WHERE (idEmpresa1 = ? AND idEmpresa2 = ?) OR (idEmpresa1 = ? AND idEmpresa2 = ?)`,
        [id1, id2, id2, id1]
    );
    
    if (existing.length > 0) {
        return existing[0].idConversa;
    }

    const [res] = await db.query(
        `INSERT INTO tbConversas (idEmpresa1, idEmpresa2) VALUES (?, ?)`,
        [id1, id2]
    );
    return res.insertId;
}

export const getMessagesByConversation = async (idConversa, userId, offset = 0) => {
    const [rows] = await db.query(`
        SELECT 
            m.idMensagem,
            m.idRemetente,
            m.idDestinatario,
            m.content,
            m.iv,
            m.sig,
            m.dataEnvio,
            m.entregue,
            m.lida,
            k.wrappedKey,
            sender.ikPublica AS senderPublicKey
        FROM tbMensagens m
        JOIN tbMensagensKeys k ON m.idMensagem = k.idMensagem AND k.idEmpresa = ?
        JOIN tbEmpresas sender ON m.idRemetente = sender.idEmpresa
        WHERE m.idConversa = ?
        ORDER BY m.idMensagem DESC
        LIMIT 25 OFFSET ?
    `, [userId, idConversa, parseInt(offset)]);
    
    return rows.reverse();
};

export async function verifyChatParticipants(idConversa, id1, id2) {
    const [rows] = await db.query(
        `SELECT idConversa FROM tbConversas 
         WHERE idConversa = ? 
         AND ((idEmpresa1 = ? AND idEmpresa2 = ?) OR (idEmpresa1 = ? AND idEmpresa2 = ?))`,
        [idConversa, id1, id2, id2, id1]
    );
    return rows.length > 0;
}

export async function getUserPublicKey(id) {
    const [rows] = await db.query(
        "SELECT ikPublica FROM tbEmpresas WHERE idEmpresa = ?",
        [id]
    );
    return rows;
}