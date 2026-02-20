import { toast } from "./utils/script.toast.js";

window.maskPhone = function (input) {
    let value = input.value.replace(/\D/g, '');

    if (value.length <= 10) {
        value = value.replace(/^(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    } else {
        value = value.replace(/^(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }

    input.value = value;
}

window.maskCNPJ = function (input) {

    let value = input.value.replace(/\D/g, '');

    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');

    input.value = value;
}

window.limparCamposEndereco = function () {
    document.getElementById("cidade").value = "";
    document.getElementById("bairro").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("estado").value = "";
    document.getElementById("pais").value = "";
}

window.validarSenhaNova = function (senha) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(senha);
}

window.handleCEPChange = function (input) {
    const cepNumeros = (input.value || "").replace(/\D/g, "");

    if (cepNumeros.length === 0) {
        limparCamposEndereco();
    }
}
window.maskCEP = function (input) {
    input.value = input.value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2');
}

window.buscarCEP = async function () {
    const cepInput = document.getElementById("cep");
    const cep = cepInput.value.replace(/\D/g, '');

    if (cep.length !== 8) return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            toast.show("CEP não encontrado", "error");
            return;
        }

        document.getElementById("cidade").value = data.localidade || "";
        document.getElementById("estado").value = data.estado || "";
        document.getElementById("endereco").value = data.logradouro || "";
        document.getElementById("bairro").value = data.bairro || "";

    } catch (err) {
        console.error(err);
        toast.show("Erro ao buscar CEP", "error");
    }
}

window.enviarConfiguracoes = async function () {
    const data = {
        emailCorporativo: document.getElementById("email").value,
        foneCorporativo: document.getElementById("telefone").value,
        descricao: document.getElementById("descricao").value,
        cepEmpresa: document.getElementById("cep").value,
        cidade: document.getElementById("cidade").value,
        endereco: document.getElementById("endereco").value,
        bairro: document.getElementById("bairro").value,
        estado: document.getElementById("estado").value,
        numEndereco: document.getElementById("numero").value,
        compEndereco: document.getElementById("complemento").value,
        privPerfilPrivado: document.getElementById("perfil_privado").checked,
        privMostrarEmail: document.getElementById("email_publico").checked,
        privMostrarFone: document.getElementById("telefone_publico").checked,
        privMostrarEndCompleto: document.getElementById("endereco_publico").checked,
        privMostrarCNPJ: document.getElementById("cnpj_publico").checked,
        privMostrarRazaoSocial: document.getElementById("razao_social_publica").checked,
        segAutDuasEtapas: document.getElementById("segAutDuasEtapas").checked
    };

    const response = await fetch("/configuracoes/config-empresa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.status === "validation_error") {
        result.errors.forEach(err => {
            const input = document.querySelector(`[name="${err.field}"]`);
            if (input) {
                input.classList.add("border-red-500");
            }
            toast.show(err.message, "error");
        });
        return;
    }

    toast.show(result.message);
}

window.trocarSenha = async function () {
    const senhaAtual = document.getElementById("senhaAtual")?.value;
    const senhaNova = document.getElementById("senhaNova")?.value;

    if (!senhaAtual || !senhaNova) {
        toast.show("Preencha todos os campos.", "error");
        return;
    }

    const confirmar = await toast.confirm("Deseja realmente alterar sua senha?");

    if (!confirmar) {
        return;
    }

    try {
        const res = await fetch("/configuracoes/senha", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ senhaAtual, senhaNova }),
        });

    const data = await res.json();

    if (!res.ok) {
        toast.show(data.message || "Erro ao alterar senha.", "error");
        return;
    }

    toast.show("Senha alterada com sucesso!");

    document.getElementById("senhaAtual").value = "";
    document.getElementById("senhaNova").value = "";

} catch (err) {
    console.error(err);
    toast.show("Erro ao conectar com o servidor.", "error");
}
}

window.loadDefaultConfig = async function () {
    loadAllConfigToggles();

    const res = await fetch("/configuracoes/config-empresa");
    const json = await res.json();

    document.getElementById("nomeFantasia").value = json.nomeFantasia;
    document.getElementById("cnpj").value = json.cnpj;
    document.getElementById("cnpj").dispatchEvent(new Event('input'));
    document.getElementById("razaoSocial").value = json.razaoSocial;
    document.getElementById("email").value = json.emailCorporativo;
    document.getElementById("telefone").value = json.foneCorporativo;
    document.getElementById("telefone").dispatchEvent(new Event('input'));
    document.getElementById("descricao").value = json.descricao;

    document.getElementById("cep").value = json.cepEmpresa;
    document.getElementById("cep").dispatchEvent(new Event("input"));
    document.getElementById("cidade").value = json.cidade;
    document.getElementById("estado").value = json.estado;
    document.getElementById("endereco").value = json.endereco;
    document.getElementById("bairro").value = json.bairro;
    document.getElementById("numero").value = json.numEndereco;
    document.getElementById("complemento").value = json.compEndereco;

    document.getElementById("user-perfil").href = `/detalhes-empresa/${json.id}`;
}


const btnLogout = document.getElementById("btnLogout");

btnLogout.addEventListener("click", async () => {
    const confirmLogout = await toast.confirm("Tem certeza que deseja sair da sua conta?");
    if (!confirmLogout) return;

    try {
        const response = await fetch("/logout", {
            method: "POST"
        });
        
        if (!response.ok) {
            throw new Error("Erro ao realizar logout");
        }
        localStorage.clear();
        window.location.href = "/login";
    } catch (err) {
        toast.show("Não foi possível sair da conta.", "error");
    }
});

document.addEventListener("DOMContentLoaded", async () => loadDefaultConfig());