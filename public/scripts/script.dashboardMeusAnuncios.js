(function () {
    const elViewsMonth = document.getElementById("dash-views-month");
    const elSalesMonth = document.getElementById("dash-sales-month");
    const elActive = document.getElementById("dash-active");

    const elViewsBadge = document.getElementById("dash-views-badge");
    const elSalesBadge = document.getElementById("dash-sales-badge");

    const btnRefresh = document.getElementById("dash-refresh");
    const inputSearch = document.getElementById("dash-search");
    const listRoot = document.getElementById("dash-list");
    const canvas = document.getElementById("chartSemana");

    // Ajuste aqui se seus endpoints tiverem outros caminhos
    const API = {
        resumo: "./api/meus-anuncios/resumo",
        semana: "./api/meus-anuncios/semana",
        lista: "./api/meus-anuncios/lista",
        toggle: "./api/meus-anuncios/toggle", // POST { idAnuncio, action: "pause"|"resume" }
    };

    const fmtInt = (n) => {
        const v = Number(n);
        if (!Number.isFinite(v)) return "0";
        return v.toLocaleString("pt-BR");
    };

    const fmtBRL = (n) => {
        const v = Number(n);
        if (!Number.isFinite(v)) return "—";
        return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    };

    const statusLabel = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "ativo") return "ativo";
        if (s === "pausado") return "pausado";
        if (s === "vendido") return "vendido";
        return s || "—";
    };

    const statusBadgeClass = (status) => {
        const s = String(status || "").toLowerCase();
        if (s === "ativo") return "bg-emerald-50 text-emerald-600";
        if (s === "pausado") return "bg-orange-50 text-orange-600";
        if (s === "vendido") return "bg-gray-100 text-gray-600";
        return "bg-gray-100 text-gray-600";
    };

    const buildImgUrl = (nomeArquivo) => {
        if (!nomeArquivo) return "../images/adicionar.png";
        return `/uploads/${nomeArquivo}`;
    };

    async function fetchJson(url, opts = {}) {
        const res = await fetch(url, { credentials: "include", ...opts });

        if (!res.ok) {
            let msg = `Erro ${res.status}`;
            try {
                const j = await res.json();
                msg = j?.error || j?.message || msg;
            } catch { }
            throw new Error(msg);
        }

        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) return res.json();
        return null;
    }

    /* =========================
       CHART
       ========================= */

    let chart = null;

    function renderChartSemana(data) {
        if (!canvas || typeof Chart === "undefined") return;

        const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

        const values = [
            Number(data?.seg || 0),
            Number(data?.ter || 0),
            Number(data?.qua || 0),
            Number(data?.qui || 0),
            Number(data?.sex || 0),
            Number(data?.sab || 0),
            Number(data?.dom || 0),
        ];

        if (chart) chart.destroy();

        chart = new Chart(canvas, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Visualizações",
                        data: values,
                        borderRadius: 10,
                        borderSkipped: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true },
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                    y: { beginAtZero: true, ticks: { precision: 0, font: { size: 11 } } },
                },
            },
        });

        canvas.parentElement.style.height = "14rem";
    }

    /* =========================
       RESUMO
       ========================= */

    function renderResumo(data) {
        const views = Number(data?.visualizacoesMensais || 0);
        const sales = Number(data?.vendasMes || 0);
        const active = Number(data?.anunciosAtivos || 0);

        if (elViewsMonth) elViewsMonth.textContent = fmtInt(views);
        if (elSalesMonth) elSalesMonth.textContent = fmtInt(sales);
        if (elActive) elActive.textContent = fmtInt(active);

        if (elViewsBadge) elViewsBadge.textContent = views > 0 ? "+12%" : "0%";
        if (elSalesBadge) elSalesBadge.textContent = sales > 0 ? "+10%" : "0%";
    }

    /* =========================
       LISTA + AÇÕES
       ========================= */

    let cacheLista = [];

    function buildRow(anuncio) {
        const img = buildImgUrl(anuncio?.nomeArquivo);
        const nome = anuncio?.nomeProduto || "—";
        const cat = anuncio?.categoria || "—";
        const status = statusLabel(anuncio?.status);
        const badgeCls = statusBadgeClass(anuncio?.status);

        const valor =
            anuncio?.valorTotal === null || anuncio?.valorTotal === undefined
                ? "a combinar"
                : fmtBRL(anuncio?.valorTotal);

        const qtd =
            anuncio?.quantidade !== null && anuncio?.quantidade !== undefined
                ? `${fmtInt(anuncio?.quantidade)} ${anuncio?.unidadeMedida || ""}`.trim()
                : "—";

        const viewsMes = fmtInt(anuncio?.visualizacoesMes || 0);

        const container = document.createElement("div");
        container.className = "p-5 flex items-center gap-4";

        container.innerHTML = `
      <img src="${img}" alt="thumb"
        class="w-16 h-16 rounded-xl object-cover border border-stronggray/60 bg-gray-100" />

      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-darkblue truncate">${nome}</p>
            <div class="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
              <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold">${cat}</span>

              <span class="inline-flex items-center gap-2">
                <i class="fa-solid fa-chart-line"></i>
                ${viewsMes} visualizações
              </span>

              <span class="inline-flex items-center gap-2">
                <i class="fa-solid fa-box"></i>
                Estoque: ${qtd}
              </span>
            </div>
          </div>

          <span class="shrink-0 text-[0.7rem] px-2.5 py-1 rounded-full font-semibold ${badgeCls}">
            ${status}
          </span>
        </div>

        <div class="flex items-center justify-between gap-3 mt-3">
          <p class="text-sm font-bold text-darkblue">${valor}</p>

          <div class="flex items-center gap-2">
            <button type="button"
              class="h-9 px-3 rounded-xl border border-stronggray text-darkblue bg-white hover:bg-gray-50 transition text-sm font-semibold inline-flex items-center gap-2"
              data-action="editar" data-id="${anuncio?.idAnuncio}">
              <i class="fa-solid fa-pen-to-square"></i>
              Editar
            </button>

            <button type="button"
              class="h-9 px-3 rounded-xl border border-stronggray text-darkblue bg-white hover:bg-gray-50 transition text-sm font-semibold inline-flex items-center gap-2"
              data-action="toggle" data-id="${anuncio?.idAnuncio}" data-status="${status}">
              <i class="fa-solid ${status === "pausado" ? "fa-circle-play" : "fa-circle-pause"}"></i>
              ${status === "pausado" ? "Reativar" : "Pausar"}
            </button>
          </div>
        </div>
      </div>
    `;

        container.addEventListener("click", async (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;

            const id = Number(btn.getAttribute("data-id"));
            const action = btn.getAttribute("data-action");
            const st = btn.getAttribute("data-status");

            if (!id) return;

            if (action === "editar") {
                // Como você ainda NÃO tem modal de editar, eu deixo o comportamento mais seguro:
                // 1) redireciona (você pode trocar pra abrir modal quando ele existir)
                window.location.href = `/detalhes/${id}`;
                return;
            }

            if (action === "toggle") {
                const current = String(st || "").toLowerCase();
                const nextAction = current === "pausado" ? "resume" : "pause";

                // confirmação simples (depois trocamos por modal bonito)
                const ok = confirm(
                    nextAction === "pause"
                        ? "Deseja pausar este anúncio?"
                        : "Deseja reativar este anúncio?"
                );
                if (!ok) return;

                try {
                    await fetchJson(API.toggle, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ idAnuncio: id, action: nextAction }),
                    });

                    // recarrega tudo pra refletir no dashboard + lista
                    await loadAll();
                } catch (err) {
                    alert(
                        `Não foi possível ${nextAction === "pause" ? "pausar" : "reativar"}: ${err.message}\n\n` +
                        `Se você ainda não criou o endpoint ${API.toggle}, me avisa que eu implemento o backend agora.`
                    );
                }
            }
        });

        return container;
    }

    function renderLista(lista) {
        cacheLista = Array.isArray(lista) ? lista : [];

        if (!listRoot) return;

        if (!cacheLista.length) {
            listRoot.innerHTML = `
        <div class="p-6 text-sm text-gray-500">
          Nenhum anúncio encontrado.
        </div>
      `;
            return;
        }

        listRoot.innerHTML = "";
        cacheLista.forEach((a) => listRoot.appendChild(buildRow(a)));
    }

    function applySearch() {
        const q = (inputSearch?.value || "").trim().toLowerCase();
        if (!q) return renderLista(cacheLista);

        const filtered = cacheLista.filter((a) => {
            const nome = String(a?.nomeProduto || "").toLowerCase();
            const cat = String(a?.categoria || "").toLowerCase();
            return nome.includes(q) || cat.includes(q);
        });

        if (!listRoot) return;

        listRoot.innerHTML = "";
        filtered.forEach((a) => listRoot.appendChild(buildRow(a)));

        if (!filtered.length) {
            listRoot.innerHTML = `
        <div class="p-6 text-sm text-gray-500">
          Nenhum anúncio bate com sua busca.
        </div>
      `;
        }
    }

    /* =========================
       LOAD
       ========================= */

    async function loadAll() {
        try {
            const [resumo, semana, lista] = await Promise.all([
                fetchJson(API.resumo),
                fetchJson(API.semana),
                fetchJson(API.lista),
            ]);

            renderResumo(resumo);
            renderChartSemana(semana);
            renderLista(lista);
        } catch (err) {
            console.error(err);
            if (listRoot) {
                listRoot.innerHTML = `
          <div class="p-6 text-sm text-red-600">
            Falha ao carregar dashboard: ${err.message}
          </div>
        `;
            }
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        loadAll();
        btnRefresh?.addEventListener("click", () => loadAll());
        inputSearch?.addEventListener("input", () => applySearch());
    });
})();
