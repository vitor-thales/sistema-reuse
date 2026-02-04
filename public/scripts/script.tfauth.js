import { toast } from "./utils/script.toast.js";

const inputs = document.querySelectorAll('#step-verification input');

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

window.showTwoFactor = async function(method) {
    const selection = document.getElementById('step-selection');
    const verification = document.getElementById('step-verification');
    const text = document.getElementById('verification-text');

    if(method === 'email') {
        text.innerText = "Sua conta possui verificação em duas etapas, para conseguir entrar insira o código enviado para seu e-mail.";
    } else {
        text.innerText = "Sua conta possui verificação em duas etapas, para conseguir entrar insira o código enviado para seu celular.";
    }

    try {
        const res = await fetch("http://localhost:8080/login/api/sendTFCode", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({method})
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json.error);
    } catch (err) {
        toast.show(err, "error");
        return;
    }

    selection.classList.add('hidden');
    verification.classList.remove('hidden');
    verification.classList.add('flex');
}