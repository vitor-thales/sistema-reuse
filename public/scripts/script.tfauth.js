import { toast } from "./utils/script.toast.js";

document.addEventListener("DOMContentLoaded", () => {
    const inputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('btn-verify');
    const resendBtn = document.getElementById('btn-resend');
    let cooldownTimer = null;

    async function sendTFCode() {
        try {
            const res = await fetch("http://localhost:8080/login/api/sendTFCode", {
                method: "POST"
            });
            const json = await res.json();

            if (!res.ok) throw new Error(json.error);
            startCooldown(60);
        } catch (err) {
            toast.show(err, "error");
            return;
        }
    }

    function startCooldown(seconds) {
        let timeLeft = seconds;
        resendBtn.disabled = true;
        resendBtn.classList.add('opacity-50', 'cursor-not-allowed', 'no-underline');
        
        cooldownTimer = setInterval(() => {
            resendBtn.innerText = `Reenviar em ${timeLeft}s`;
            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(cooldownTimer);
                resendBtn.disabled = false;
                resendBtn.innerText = "Não recebi o código. Reenviar.";
                resendBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'no-underline');
            }
        }, 1000);
    }

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

    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length > 1) {
                e.target.value = e.target.value.slice(0, 1);
            }
            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const data = e.clipboardData.getData('text').trim();
            if (!/^\d+$/.test(data)) return; 

            const digits = data.split('');
            digits.forEach((digit, i) => {
                if (inputs[index + i]) {
                    inputs[index + i].value = digit;
                }
            });
            
            const lastIdx = Math.min(index + digits.length - 1, inputs.length - 1);
            inputs[lastIdx].focus();
        });
    });

    const getCode = () => Array.from(inputs).map(i => i.value).join('');

    verifyBtn.addEventListener('click', async () => {
        const code = getCode();
        if(code.length < 6) {
            toast.show("Insira o código completo", "error");
            return;
        }

        verifyBtn.disabled = true;
        verifyBtn.innerText = "PROCESSANDO...";

        try {
            const res = await fetch("/login/api/tfAuthLogin", {
                method: "POST",
                headers: {'Content-Type': "application/json"},
                body: JSON.stringify({code})
            });

            const json = await res.json();

            if (res.ok) {
                const { encryptedPrivateKey, salt, iv } = json;

                const wrappingKey = await deriveKeyFromPassword(sessionStorage.getItem("tempReUse"), salt);

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

                sessionStorage.clear();

                toast.show("Sucesso! Redirecionando...", "success");
                setTimeout(() => window.location.href = "/", 1000);
            } else {
                toast.show(json.error || "Erro na verificação", "error");
                verifyBtn.disabled = false;
                verifyBtn.innerText = "VERIFICAR";
            }
        } catch (err) {
            console.log(err);
            toast.show("Erro de conexão com o servidor", "error");
            verifyBtn.disabled = false;
            verifyBtn.innerText = "VERIFICAR";
        }
    });

    resendBtn.addEventListener('click', sendTFCode);

    startCooldown(60);
});