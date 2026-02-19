import { toast } from "./utils/script.toast.js";

window.loadAllConfigToggles = async function () {
    const res = await fetch("/configuracoes/config-empresa");
    const json = await res.json();
    if(!res.ok) toast.show("Erro carregando configurações do usuário", "error");

    carregarToggle({
        containerId: "toggle-mensagens-empresas",
        title: "Mensagens de empresas",
        description: "Notificações quando receber mensagens de outras empresas",
        checked: json.notMsgEmpresas || false,
        name: "mensagens_empresas"
    });

    carregarToggle({
        containerId: "toggle-atualizacoes-anuncios",
        title: "Atualizações de anúncios",
        description: "Status dos seus anúncios publicados",
        checked: json.notAttAnuncios || false,
        name: "atualizacoes_anuncios"
    });

    carregarToggle({
        containerId: "toggle-perfil-privado",
        title: "Perfil Privado",
        description: "Outras empresas terão acesso apenas ao seu nome fantasia",
        checked: json.privPerfilPrivado || false,
        name: "perfil_privado"
    });

    carregarToggle({
        containerId: "toggle-email-publico",
        title: "Email Corporativo",
        description: "Exibir email no perfil público",
        checked: json.privMostrarEmail || false,
        name: "email_publico"
    });

    carregarToggle({
        containerId: "toggle-telefone-publico",
        title: "Telefone",
        description: "Exibir telefone no perfil público",
        checked: json.privMostrarFone || false,
        name: "telefone_publico"
    });

    carregarToggle({
        containerId: "toggle-endereco-publico",
        title: "Endereço Completo",
        description: "Mostrar endereço detalhado (apenas cidade se desativado)",
        checked: json.privMostrarEndCompleto || false,
        name: "endereco_publico"
    });

    carregarToggle({
        containerId: "toggle-cnpj-publico",
        title: "CNPJ",
        description: "Exibir CNPJ no perfil público",
        checked: json.privMostrarCNPJ || false,
        name: "cnpj_publico"
    });

    carregarToggle({
        containerId: "toggle-razao-social-publico",
        title: "Razão Social",
        description: "Exibir Razão Social no perfil público",
        checked: json.privMostrarRazaoSocial || false,
        name: "razao_social_publica"
    });

    carregarToggle({
        containerId: "toggle-2fa",
        title: "Autenticação de Dois Fatores",
        description: "Adicione uma camada extra de segurança à sua conta",
        checked: json.segAutDuasEtapas || false,
        name: "segAutDuasEtapas"
    });
}

async function carregarToggle({
    containerId,
    title,
    description,
    checked = false,
    name
}) {
    try {
        const response = await fetch('/components/toggle.html');
        const html = await response.text();

        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = html;

        const toggle = container.querySelector('.toggle-input');
        const toggleTitle = container.querySelector('.toggle-title');
        const toggleDesc = container.querySelector('.toggle-description');

        toggleTitle.textContent = title;
        toggleDesc.textContent = description;
        toggle.checked = checked;
        toggle.id = name;

    } catch (err) {
        console.error('Erro ao carregar toggle:', err);
    }
}
