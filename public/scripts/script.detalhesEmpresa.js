import { toast } from "./utils/script.toast.js";

document.addEventListener("DOMContentLoaded", () => {
    const getIdEmpresaFromUrl = () => {
        const parts = window.location.pathname.split("/").filter(Boolean);
        const last = parts[parts.length - 1];
        const id = Number(last);
        return Number.isFinite(id) ? id : null;
    };

    const fmtInt = (n) => {
        const v = Number(n);
        if (!Number.isFinite(v)) return "0";
        return v.toLocaleString("pt-BR");
    };

    const fmtBRL = (n) => {
        const v = Number(n);
        if (!Number.isFinite(v)) return "A combinar";
        return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const safeText = (s) => String(s ?? "").trim();

    const el = (id) => document.getElementById(id);

    function setText(id, value, fallback = "—") {
        const node = el(id);
        if (!node) return;
        const v = safeText(value);
        node.textContent = v ? v : fallback;
    }

    const formatPhoneNumber = (value) => {
      if (!value) return "";

      const digits = value.replace(/\D/g, "");

      return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    };

    const formatYearMonth = (dateString) => {
      const date = new Date(`${dateString}-01T12:00:00`);

      const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
      const year = date.getFullYear();

      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

      return `${capitalizedMonth}, ${year}`;
    };

    const formatCNPJ = (value) => {
      if (!value) return "";

      const digits = value.replace(/\D/g, "");

      return digits.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        "$1.$2.$3/$4-$5"
      );
    };

    function setHref(id, href) {
        const node = el(id);
        if (!node) return;
        node.href = href;
    }

    function buildIniciais(nome) {
        const parts = safeText(nome).split(/\s+/).filter(Boolean);
        if (!parts.length) return "—";
        const a = parts[0]?.[0] || "";
        const b = parts.length > 1 ? (parts[1]?.[0] || "") : (parts[0]?.[1] || "");
        return (a + b).toUpperCase() || "—";
    }

    function tempoRespostaLabel(minutos) {
        const m = Number(minutos);
        if (!Number.isFinite(m) || m <= 0) return "—";

        if (m < 60) return `< 1 hora`;
        const h = Math.round(m / 60);

        if (h <= 2) return "< 2 horas";
        if (h <= 6) return "< 6 horas";
        if (h <= 12) return "< 12 horas";
        if (h <= 24) return "< 24 horas";
        return `~ ${h} horas`;
    }

    function renderProdutos(gridEl, perfil, produtos) {
        if (!gridEl) return;

        gridEl.innerHTML = "";

        if (!Array.isArray(produtos) || produtos.length === 0) {
            gridEl.innerHTML = `
        <div class="col-span-full text-sm text-gray-500">
          Esta empresa ainda não possui anúncios ativos.
        </div>
      `;
            return;
        }

        produtos.forEach((p) => {
            const imgSrc = p?.nomeArquivo ? `/uploads/${p.nomeArquivo}` : "../images/adicionar.png";
            const categoria = safeText(p?.categoria) || "Categoria";
            const qtd = Number(p?.quantidade);
            const unidade = safeText(p?.unidadeMedida);
            const qtdLabel = Number.isFinite(qtd) ? `${fmtInt(qtd)}${unidade ? unidade : ""}` : "";

            const card = document.createElement("article");
            card.className = "bg-white border border-stronggray rounded-2xl overflow-hidden";

            card.innerHTML = `
        <div class="relative">
          <img src="${imgSrc}" alt="Produto" class="w-full h-36 object-cover" />
        </div>

        <div class="p-4">
          <div class="flex items-center justify-between gap-2">
            <span class="text-[0.65rem] px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold">
              ${categoria}
            </span>
            <span class="text-[0.65rem] text-gray-400">${qtdLabel}</span>
          </div>

          <h3 class="mt-2 text-sm font-semibold text-darkblue line-clamp-2">
            ${safeText(p?.nomeProduto) || "Produto"}
          </h3>

          <div class="mt-2 text-xs text-gray-400 space-y-1">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-building"></i>
              <span class="line-clamp-1">${safeText(perfil?.nomeEmpresa) || "Empresa"}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-location-dot"></i>
              <span class="line-clamp-1">${safeText(perfil?.enderecoEmpresa) || "—"}</span>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3">
            <p class="text-base font-bold text-darkblue">${fmtBRL(p?.valorTotal)}</p>
            <a href="/detalhes/${p?.idAnuncio}"
               class="h-9 px-4 rounded-xl bg-mainblue text-white text-xs font-semibold inline-flex items-center justify-center hover:brightness-110 transition">
              Ver Detalhes
            </a>
          </div>
        </div>
      `;

            gridEl.appendChild(card);
        });
    }

    async function load() {
        const enviarMensagens = document.getElementById("btn-enviar-mensagem");

        const idEmpresa = getIdEmpresaFromUrl();
        if (!idEmpresa) {
            toast.show("URL inválida (idEmpresa não encontrado).", "error");
            const notFound = await fetch("/404");
            const text = await notFound.text();
            document.body.innerHTML = new DOMParser().parseFromString(text, "text/html").body.innerHTML;
            document.body.classList.add("flex", "items-center", "justify-center", "p-6");
            return;
        }

        const r = await fetch(`/mensagens/api/getPartner/${idEmpresa}`);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json();

        enviarMensagens.addEventListener("click", () => startNewChat(idEmpresa, j.nome, j.publicKey));

        const res = await fetch(`/detalhes-empresa/api/${idEmpresa}`, {
            credentials: "include",
        });

        if (!res.ok) {
            const msg = `Erro ${res.status}`;
            const notFound = await fetch("/404");
            const text = await notFound.text();
            document.body.innerHTML = new DOMParser().parseFromString(text, "text/html").body.innerHTML;
            document.body.classList.add("flex", "items-center", "justify-center", "p-6");
            toast.show(msg, "error");
            return;
        }

        const { perfil, produtosRecentes, privacidade } = await res.json();

        let nome = privacidade[0].privMostrarRazaoSocial ? perfil?.razaoSocialEmpresa : perfil?.nomeEmpresa;
        if(privacidade[0].privMostrarCNPJ) nome += ` (${formatCNPJ(perfil?.cnpjEmpresa)})`; 

        setText("empresa-nome", nome);
        setText("empresa-local", privacidade[0].privPerfilPrivado ? "Privado" : perfil?.enderecoEmpresa);
        setText("empresa-membro", perfil?.membroDesde ? `Membro desde ${formatYearMonth(perfil.membroDesde)}` : "");
        setText("empresa-iniciais", buildIniciais(perfil?.nomeEmpresa));

        setText("empresa-card-ativos", fmtInt(perfil?.anunciosAtivos || 0));
        setText("empresa-card-vendas", fmtInt(perfil?.vendasRealizadas || 0));
        setText("empresa-card-taxa", `${Number(perfil?.taxaResposta || 0)}%`);

        setText("empresa-sobre", perfil?.sobreEmpresa, "Sem descrição.");
        setText("empresa-email", privacidade[0].privPerfilPrivado ? "Privado" : perfil?.emailEmpresa, "Privado");
        setText("empresa-telefone", privacidade[0].privPerfilPrivado ? "Privado" : formatPhoneNumber(perfil?.foneEmpresa), "Privado");

        const taxa = Number(perfil?.taxaResposta || 0);
        setText("empresa-taxa-label", `${taxa}%`);
        const bar = el("empresa-taxa-bar");
        if (bar) bar.style.width = `${Math.max(0, Math.min(100, taxa))}%`;

        setText("empresa-tempo-resposta", tempoRespostaLabel(perfil?.tempoResposta));

        setText("empresa-produtos-badge", `${fmtInt(perfil?.anunciosAtivos || 0)} ativos`);

        setHref("empresa-ver-todos", `/detalhes-empresa/anuncios/${idEmpresa}`);

        renderProdutos(el("empresa-produtos-grid"), perfil, produtosRecentes);
    }

    load().catch(async (e) => {
        console.error(e);
        const notFound = await fetch("/404");
        const text = await notFound.text();
        document.body.innerHTML = new DOMParser().parseFromString(text, "text/html").body.innerHTML;
        document.body.classList.add("flex", "items-center", "justify-center", "p-6");
        toast.show("Falha ao carregar detalhes da empresa.", "error");
    });
});
