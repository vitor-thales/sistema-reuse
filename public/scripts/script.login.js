import { toast } from "./utils/script.toast.js";

async function deriveKeyFromPassword(password, saltBase64) {
    const salt = Uint8Array.from(atob(saltBase64), c => c.charCodeAt(0));
    const encoder = new TextEncoder();
    const baseKey = await crypto.subtle.importKey(
        "raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]
    );
    return await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false, ["decrypt", "encrypt"]
    );
}

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login");
    const loginForm = document.getElementById("form-login");

    loginButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const form = new FormData(loginForm);
        const data = {
            login: form.get("login"),
            password: form.get("senha"),
        };

        try {
            const res = await fetch("/login/api/credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (res.status == 404) toast.show("Credenciais Inválidas", "error");
            else if (res.status == 500)
                toast.show("Erro interno do sistema", "error");
            else if (res.status == 301) { 
                sessionStorage.setItem("tempReUse", data.password);

                window.location.href = "http://localhost:8080/login/verificar"; 
            }
            else { 
                const { encryptedPrivateKey, salt, iv } = await res.json();
                
                if(encryptedPrivateKey) {
                    const wrappingKey = await deriveKeyFromPassword(data.password, salt);

                    const encryptedBuffer = Uint8Array.from(atob(encryptedPrivateKey), c => c.charCodeAt(0));
                    const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

                    const decryptedPrivateKeyBuffer = await crypto.subtle.decrypt(
                        { name: "AES-GCM", iv: ivBuffer },
                        wrappingKey,
                        encryptedBuffer
                    );

                    const deviceSecret = crypto.getRandomValues(new Uint8Array(32));
                    const deviceSecretBase64 = btoa(String.fromCharCode(...deviceSecret));

                    const persistenceKey = await crypto.subtle.importKey(
                        "raw", 
                        deviceSecret, 
                        "AES-GCM", 
                        false, 
                        ["encrypt", "decrypt"]
                    );

                    const persistenceIv = crypto.getRandomValues(new Uint8Array(12));
                    
                    const reEncryptedKey = await crypto.subtle.encrypt(
                        { name: "AES-GCM", iv: persistenceIv },
                        persistenceKey,
                        decryptedPrivateKeyBuffer
                    );

                    localStorage.setItem("persistent_kp", btoa(String.fromCharCode(...new Uint8Array(reEncryptedKey))));
                    localStorage.setItem("persistent_iv", btoa(String.fromCharCode(...persistenceIv)));

                    document.cookie = `device_secret=${deviceSecretBase64}; path=/; Max-Age=604800; SameSite=Strict;`;
                }

                toast.show("Login realizado com sucesso! Redirecionando...");
                setTimeout(() => window.location.href = "/", 2000);
            }
        } catch (err) {
            console.error(err);
            toast.show(err, "error");
        }
    });
});