import { maskInput, stripMaskNumber } from "./utils/script.masks.js";
import { toast } from "./utils/script.toast.js";

const form = document.getElementById("form-forgot-password");
const submitBtn = form.querySelector('button[type="submit"]');
let cooldownTimer = null;

async function sendResetSolicitation(event) {
    event.preventDefault();

    const cnpj = stripMaskNumber(document.getElementById("cnpj").value);
    if(cnpj.length !== 14) return toast.show("O CNPJ inserido é inválido!", "error");

    setButtonState(false);

    try {
        const res = await fetch('/recuperar-senha/api/send-mail', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({cnpj})
        });

        const json = await res.json();

        if(!res.ok) {
            throw new Error(json.error);
        } else {
            toast.show("E-mail enviado! Verifique sua caixa de entrada e spam.", 10000);
            startCooldown(60); 
        }
    } catch(err) {
        toast.show(err.message || err, "error");
        setButtonState(true); 
    }
}

function setButtonState(enabled, text = "ENVIAR") {
    submitBtn.disabled = !enabled;
    submitBtn.innerText = text;
    
    if (enabled) {
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
        submitBtn.classList.add("hover:bg-blue-700", "hover:cursor-pointer");
    } else {
        submitBtn.classList.add("opacity-50", "cursor-not-allowed");
        submitBtn.classList.remove("hover:bg-blue-700", "hover:cursor-pointer");
    }
}

function startCooldown(seconds) {
    let timeLeft = seconds;
    
    setButtonState(false, `Reenviar em ${timeLeft}s...`);

    cooldownTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(cooldownTimer);
            setButtonState(true);
        } else {
            submitBtn.innerText = `Reenviar em ${timeLeft}s...`;
        }
    }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    const cnpjInput = document.getElementById("cnpj");
    form.addEventListener("submit", sendResetSolicitation);
    maskInput(cnpjInput, "99.999.999/9999-99");
});