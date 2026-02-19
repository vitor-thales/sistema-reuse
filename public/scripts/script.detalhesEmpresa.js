document.addEventListener("DOMContentLoaded", () => {
    const getIdEmpresaFromUrl = () => {
        // /detalhes-empresa/123
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
        const idEmpresa = getIdEmpresaFromUrl();
        if (!idEmpresa) {
            alert("URL inválida (idEmpresa não encontrado).");
            return;
        }

        const res = await fetch(`/detalhes-empresa/api/${idEmpresa}`, {
            credentials: "include",
        });

        if (!res.ok) {
            const msg = `Erro ${res.status}`;
            alert(msg);
            return;
        }

        const { perfil, produtosRecentes } = await res.json();

        // Header do perfil
        setText("empresa-nome", perfil?.nomeEmpresa);
        setText("empresa-local", perfil?.enderecoEmpresa);
        setText("empresa-membro", perfil?.membroDesde ? `Membro desde ${perfil.membroDesde}` : "");
        setText("empresa-iniciais", buildIniciais(perfil?.nomeEmpresa));

        // Cards
        setText("empresa-card-ativos", fmtInt(perfil?.anunciosAtivos || 0));
        setText("empresa-card-vendas", fmtInt(perfil?.vendasRealizadas || 0));
        setText("empresa-card-taxa", `${Number(perfil?.taxaResposta || 0)}%`);

        // Sobre / contato
        setText("empresa-sobre", perfil?.sobreEmpresa, "Sem descrição.");
        setText("empresa-email", perfil?.emailEmpresa, "—");
        setText("empresa-telefone", perfil?.foneEmpresa, "—");

        // Performance
        const taxa = Number(perfil?.taxaResposta || 0);
        setText("empresa-taxa-label", `${taxa}%`);
        const bar = el("empresa-taxa-bar");
        if (bar) bar.style.width = `${Math.max(0, Math.min(100, taxa))}%`;

        setText("empresa-tempo-resposta", tempoRespostaLabel(perfil?.tempoResposta));

        // Badge "X ativos" (sem aqueles badges do produto; esse é o do topo do grid)
        setText("empresa-produtos-badge", `${fmtInt(perfil?.anunciosAtivos || 0)} ativos`);

        // Link "Ver todos"
        setHref("empresa-ver-todos", `/buscar?empresa=${idEmpresa}`);

        // Produtos recentes
        renderProdutos(el("empresa-produtos-grid"), perfil, produtosRecentes);
    }

    load().catch((e) => {
        console.error(e);
        alert("Falha ao carregar detalhes da empresa.");
    });
});
