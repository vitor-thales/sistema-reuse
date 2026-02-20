import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const ChatEngine = {
    privateKey: null,
    myPublicKey: null,
    signingKey: null,
    socket: null,

    async init(userId, myPublicKeyBase64) {
        this.myPublicKey = myPublicKeyBase64;
        try {
            const privateKeyBuffer = await this._restorePrivateKeyBuffer();

            this.privateKey = await crypto.subtle.importKey(
                "pkcs8",
                privateKeyBuffer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["decrypt"]
            );

            this.signingKey = await crypto.subtle.importKey(
                "pkcs8",
                privateKeyBuffer,
                { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
                false,
                ["sign"]
            );

            this._initSocket(userId);
        } catch (err) {
            console.error("Error:", err);
        }
    },

    async signData(dataBuffer) {
        const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", this.signingKey, dataBuffer);
        return this._bufToBase64(signature);
    },

    _sanitize(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    },

    async encryptMessage(plainText, recipientPublicKeyBase64) {
        const safeText = this._sanitize(plainText);

        const encoder = new TextEncoder();
        const textData = encoder.encode(safeText);

        const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedContent = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, textData);

        const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);

        const wrapKey = async (pem) => {
            const cleanPem = pem
                .replace(/-----BEGIN PUBLIC KEY-----/g, "")
                .replace(/-----END PUBLIC KEY-----/g, "")
                .replace(/\s+/g, "");

            const binaryDer = Uint8Array.from(atob(cleanPem), (c) => c.charCodeAt(0));

            const rsaKey = await crypto.subtle.importKey(
                "spki",
                binaryDer,
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["encrypt"]
            );
            return await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKey, rawAesKey);
        };

        const wrappedKeyRecipient = await wrapKey(recipientPublicKeyBase64);
        const wrappedKeySender = await wrapKey(this.myPublicKey);

        return {
            content: this._bufToBase64(encryptedContent),
            iv: this._bufToBase64(iv),
            keyForRecipient: this._bufToBase64(wrappedKeyRecipient),
            keyForSender: this._bufToBase64(wrappedKeySender),
        };
    },

    async encryptAndSign(plainText, recipientPublicKeyBase64) {
        const pkg = await this.encryptMessage(plainText, recipientPublicKeyBase64);

        const encoder = new TextEncoder();
        const signData = encoder.encode(pkg.content + pkg.iv);
        const signature = await this.signData(signData);

        return { ...pkg, signature };
    },

    async decryptMessage(encryptedBlob, wrappedKeyBase64, ivBase64) {
        const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
        const wrappedKey = Uint8Array.from(atob(wrappedKeyBase64), (c) => c.charCodeAt(0));
        const content = Uint8Array.from(atob(encryptedBlob), (c) => c.charCodeAt(0));

        const rawAesKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, this.privateKey, wrappedKey);

        const aesKey = await crypto.subtle.importKey("raw", rawAesKey, "AES-GCM", false, ["decrypt"]);

        const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, content);

        return new TextDecoder().decode(decryptedBuffer);
    },

    async verifySignature(dataBuffer, signatureBase64, senderPublicKeyBase64) {
        const senderKey = await crypto.subtle.importKey(
            "spki",
            Uint8Array.from(atob(senderPublicKeyBase64), (c) => c.charCodeAt(0)),
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["verify"]
        );

        const signature = Uint8Array.from(atob(signatureBase64), (c) => c.charCodeAt(0));

        return await crypto.subtle.verify("RSASSA-PKCS1-v1_5", senderKey, signature, dataBuffer);
    },

    async _restorePrivateKeyBuffer() {
        const encryptedKeyB64 = localStorage.getItem("persistent_kp");
        const ivB64 = localStorage.getItem("persistent_iv");
        const deviceSecretB64 = document.cookie
            .split("; ")
            .find((row) => row.startsWith("device_secret="))
            ?.split("=")[1];

        if (!encryptedKeyB64 || !deviceSecretB64) throw new Error("Chaves não encontradas!");

        const deviceSecret = Uint8Array.from(atob(deviceSecretB64), (c) => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
        const encryptedKey = Uint8Array.from(atob(encryptedKeyB64), (c) => c.charCodeAt(0));

        const persistenceKey = await crypto.subtle.importKey("raw", deviceSecret, "AES-GCM", false, ["decrypt"]);

        return await crypto.subtle.decrypt({ name: "AES-GCM", iv }, persistenceKey, encryptedKey);
    },

    _initSocket(userId) {
        this.socket = io("http://localhost:8080");
        window.reuseSocket = this.socket;
        window.__reuseUserId = userId;

        this.socket.emit("join", userId);

        this.socket.on("receive_message", async (data) => {
            await this._processIncomingMessage(data, userId, "received");
        });

        this.socket.on("message_confirm", async (data) => {
            window.dispatchEvent(new CustomEvent("chat:confirmed", { detail: data }));
        });

        this.socket.on("error", (errorMessage) => {
            window.dispatchEvent(new CustomEvent("chat:error", { detail: errorMessage }));
        });

        this.socket.on("messages_read_update", (data) => {
            window.dispatchEvent(new CustomEvent("chat:read", { detail: data }));
        });
    },

    async _processIncomingMessage(data, userId, type) {
        try {
            const encoder = new TextEncoder();
            const signData = encoder.encode(data.content + data.iv);

            const isValid = await this.verifySignature(signData, data.signature, data.senderPublicKey);

            if (!isValid) return;

            const isMe = data.idRemetente === userId;
            const keyToUse = isMe ? data.keyForSender : data.keyForRecipient;

            if (!keyToUse) return;

            let text;
            try {
                text = await this.decryptMessage(data.content, keyToUse, data.iv);
            } catch {
                return;
            }

            window.dispatchEvent(
                new CustomEvent("chat:message", {
                    detail: {
                        ...data,
                        decryptedText: text,
                        type: type,
                    },
                })
            );
        } catch { }
    },

    async markConversationAsRead(idConversa, lastMessageId, recipientId, myUserId) {
        this.socket.emit("mark_as_read", {
            idConversa,
            idUsuario: myUserId,
            lastMessageId,
            recipientId,
        });
    },

    _bufToBase64(buf) {
        return btoa(String.fromCharCode(...new Uint8Array(buf)));
    },
};

export default ChatEngine;