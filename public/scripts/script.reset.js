import { toast } from "./utils/script.toast.js";

const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');
const submitBtn = document.getElementById('submit-btn');
const reqContainer = document.getElementById('password-requirements');
const matchError = document.getElementById('match-error');
const resetForm = document.getElementById('form-reset-password');

const requirements = {
    length: { el: document.getElementById('req-length'), regex: /.{8,}/ },
    number: { el: document.getElementById('req-number'), regex: /[0-9]/ },
    case: { el: document.getElementById('req-case'), regex: /^(?=.*[a-z])(?=.*[A-Z]).+$/ }
};

const validate = () => {
    const val = passwordInput.value;
    const confVal = confirmInput.value;
    
    if (val.length > 0) {
        reqContainer.style.maxHeight = "100px";
        reqContainer.style.opacity = "1";
    } else {
        reqContainer.style.maxHeight = "0";
        reqContainer.style.opacity = "0";
    }

    let allRequirementsMet = true;
    for (const key in requirements) {
        const met = requirements[key].regex.test(val);
        const el = requirements[key].el;
        
        if (met) {
            el.style.opacity = "0";
            el.style.maxHeight = "0";
            el.style.marginTop = "0";
        } else {
            el.style.opacity = "1";
            el.style.maxHeight = "20px";
            el.style.marginTop = "4px";
            allRequirementsMet = false;
        }
    }

    passwordInput.style.borderColor = (val.length > 0 && !allRequirementsMet) ? "text-red" : "";

    const hasStartedConfirming = confVal.length > 0;
    const matches = val === confVal && hasStartedConfirming;

    if (hasStartedConfirming) {
        if (!matches) {
            confirmInput.style.borderColor = "text-red";
            matchError.style.maxHeight = "20px";
            matchError.style.opacity = "1";
            matchError.style.marginTop = "4px";
        } else {
            confirmInput.style.borderColor = "";
            matchError.style.maxHeight = "0";
            matchError.style.opacity = "0";
            matchError.style.marginTop = "0";
        }
    }

    if (allRequirementsMet && matches) {
        submitBtn.disabled = false;
        submitBtn.classList.replace('bg-gray-400', 'bg-mainblue');
        submitBtn.classList.replace('cursor-not-allowed', 'cursor-pointer');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.replace('bg-mainblue', 'bg-gray-400');
        submitBtn.classList.replace('cursor-pointer', 'cursor-not-allowed');
    }
};

passwordInput.addEventListener('input', validate);
confirmInput.addEventListener('input', validate);

resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn.disabled) return;

    const pathParts = window.location.pathname.split("/");
    const idUsuario = pathParts[2];
    const codigoReset = pathParts[3];

    const payload = {
        novaSenha: passwordInput.value,
        confirmarSenha: confirmInput.value,
        idUsuario: idUsuario,
        codigoReset: codigoReset
    };

    try {
        submitBtn.innerText = "ENVIANDO...";
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-70');

        const response = await fetch('/recuperar-senha/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            toast.show("Senha redefinida com sucesso!");

            setTimeout(() => window.location.href = "/login", 2000);
        } else {
            const errorData = await response.json();
            toast.show(`Erro: ${errorData.error || 'Falha ao redefinir senha.'}`, "error");

            submitBtn.innerText = "REDEFINIR";
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-70');
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
        toast.show("Erro de conexão com o servidor.", "error");
        
        submitBtn.innerText = "REDEFINIR";
        submitBtn.disabled = false;
    }
});