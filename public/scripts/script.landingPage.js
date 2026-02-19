document.addEventListener("DOMContentLoaded", () => {
  const PREVIEW_LIMIT = 4;
  const ENDPOINT_ANUNCIOS = "/api/anuncios";
  const ENDPOINT_CATEGORIAS = "/anuncie/categorias";

  const toggleMoreBtn = document.getElementById("toggleMore");
  const contadorAnuncios = document.getElementById("contador-anuncios");
  const gridAnuncios = document.getElementById("listaAnuncios");
  const anunciosVazio = document.getElementById("anunciosVazio");

  const openBtn = document.getElementById("openFilter");
  const closeBtn = document.getElementById("closeFilter");
  const overlay = document.getElementById("filterOverlay");
  const panel = document.getElementById("filterPanel");

  const conservacaoSelect = document.getElementById("conservacaoSelect");
  const precoMaxRange = document.getElementById("precoMaxRange");
  const precoMinInput = document.getElementById("precoMinInput");
  const precoMaxInput = document.getElementById("precoMaxInput");
  const quantidadeSelect = document.getElementById("quantidadeSelect");
  const cidadeInput = document.getElementById("cidadeInput");
  const estadoSelect = document.getElementById("estadoSelect");
  const applyBtn = document.getElementById("applyFilters");
  const clearBtn = document.getElementById("clearFilters");

  const categoriasContainer = document.getElementById("categoriasContainer");

  let allAnuncios = [];
  let filteredAnuncios = [];
  let searchQuery = "";
  let expanded = false;

  function openFilter() {
    overlay?.classList.remove("opacity-0", "pointer-events-none");
    overlay?.classList.add("opacity-100");

    panel?.classList.remove("translate-x-full");
    panel?.classList.add("translate-x-0");

    document.body.classList.add("overflow-hidden");
  }

  function closeFilter() {
    overlay?.classList.add("opacity-0", "pointer-events-none");
    overlay?.classList.remove("opacity-100");

    panel?.classList.add("translate-x-full");
    panel?.classList.remove("translate-x-0");

    document.body.classList.remove("overflow-hidden");
  }

  openBtn?.addEventListener("click", openFilter);
  closeBtn?.addEventListener("click", closeFilter);
  overlay?.addEventListener("click", closeFilter);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFilter();
  });

  if (!contadorAnuncios || !gridAnuncios) return;

  function formatCurrency(value) {
    if (!value && value !== 0) return "A combinar";
    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function getSelectedCategoria() {
    return document.querySelector('input[name="categoria"]:checked')?.value || "";
  }

  function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
  }

  function normalizePrecoInputs() {
    const maxAllowed = Number(precoMaxRange?.max || 50000);

    let minV = clamp(Number(precoMinInput?.value || 0), 0, maxAllowed);
    let maxV = clamp(Number(precoMaxInput?.value || maxAllowed), 0, maxAllowed);

    if (minV > maxV) minV = maxV;

    if (precoMinInput) precoMinInput.value = String(minV);
    if (precoMaxInput) precoMaxInput.value = String(maxV);
    if (precoMaxRange) precoMaxRange.value = String(maxV);
  }

  precoMaxRange?.addEventListener("input", () => {
    if (precoMaxInput) precoMaxInput.value = precoMaxRange.value;
    normalizePrecoInputs();
  });

  precoMinInput?.addEventListener("input", normalizePrecoInputs);
  precoMaxInput?.addEventListener("input", normalizePrecoInputs);

  function strip(s) {
    return String(s ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function filtrarPorBusca(lista, q) {
    const query = strip(q);
    if (!query) return lista;

    return lista.filter((anuncio) => {
      const nome = strip(anuncio?.nomeProduto);
      const categoriaNome = strip(anuncio?.categoria || anuncio?.tipoProduto);

      return nome.includes(query) || categoriaNome.includes(query);
    });
  }

  function getFilters() {
    const categoria = getSelectedCategoria();
    const conservacao = conservacaoSelect?.value || "";

    normalizePrecoInputs();

    const precoMin = Number(precoMinInput?.value || 0);
    const precoMax = Number(precoMaxInput?.value || 50000);
    const quantidade = quantidadeSelect?.value || "";
    const uf = String(estadoSelect?.value || "").trim().toUpperCase();
    const cidade = (cidadeInput?.value || "").trim();

    return { categoria, conservacao, precoMin, precoMax, quantidade, uf, cidade };
  }

  function buildQueryParams(f) {
    const params = new URLSearchParams();

    if (f.categoria) params.set("categoria", f.categoria);
    if (f.conservacao) params.set("condicao", f.conservacao);
    if (f.quantidade) params.set("quantidade", f.quantidade);
    if (f.uf) params.set("uf", f.uf);
    if (f.cidade) params.set("cidade", f.cidade);

    const userChangedPrice = f.precoMin > 0 || f.precoMax < 50000;

    if (userChangedPrice) {
      params.set("precoMin", String(f.precoMin));
      params.set("precoMax", String(f.precoMax));
    }

    return params.toString();
  }

  function debounce(fn, delay = 250) {
    let t;

    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  function createCard(anuncio) {
    const card = document.createElement("article");

    card.className =
      "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col";

    const media = document.createElement("div");
    media.className = "relative";

    const image = document.createElement("img");
    image.className = "w-full h-40 object-cover";
    image.alt = anuncio.nomeProduto || "Anúncio";
    image.src = anuncio.nomeArquivo
      ? `/uploads/${anuncio.nomeArquivo}`
      : "/images/adicionar.png";

    media.appendChild(image);

    const body = document.createElement("div");
    body.className = "p-4 flex flex-col gap-3 flex-1";

    const chip = document.createElement("span");
    chip.className =
      "inline-flex w-fit px-3 py-1 rounded-full text-xs bg-mainblue/15 text-mainblue";

    chip.textContent =
      anuncio.categoria || anuncio.tipoProduto || "Categoria";

    const titleWrap = document.createElement("div");
    titleWrap.className = "flex flex-col gap-1";

    const title = document.createElement("h4");
    title.className =
      "font-semibold text-darkblue text-sm leading-snug line-clamp-2";

    title.textContent =
      anuncio.nomeProduto || "Produto sem título";

    const subtitle = document.createElement("p");
    subtitle.className =
      "text-xs text-gray-500 line-clamp-1";

    subtitle.textContent =
      anuncio.descricao || "Sem descrição";

    titleWrap.append(chip, title, subtitle);

    const meta = document.createElement("div");
    meta.className =
      "flex flex-col gap-1 text-xs text-gray-500";

    const companyRow = document.createElement("div");
    companyRow.className = "flex items-center gap-2";

    companyRow.innerHTML = `
      <i class="fa-solid fa-building text-gray-400"></i>
      <span class="line-clamp-1">${anuncio.nomeEmpresa || "Empresa"}</span>
    `;

    const locationRow = document.createElement("div");
    locationRow.className = "flex items-center gap-2";

    locationRow.innerHTML = `
      <i class="fa-solid fa-location-dot text-gray-400"></i>
      <span class="line-clamp-1">${anuncio.cidade || ""}, ${anuncio.estado || ""}</span>
    `;

    meta.append(companyRow, locationRow);

    const footer = document.createElement("div");
    footer.className =
      "mt-auto pt-6 flex items-center justify-between border-t border-stronggray";

    const price = document.createElement("p");
    price.className =
      "text-lg font-semibold text-darkblue";

    price.textContent =
      formatCurrency(anuncio.valorTotal);

    const btn = document.createElement("a");
    btn.className =
      "px-4 py-2 rounded-full bg-mainblue text-white text-xs font-semibold hover:opacity-90 transition";

    btn.textContent = "Ver Detalhes";
    btn.href = `/detalhes/${anuncio.idAnuncio || anuncio.id || ""}`;

    footer.append(price, btn);
    body.append(titleWrap, meta, footer);
    card.append(media, body);

    return card;
  }

  function renderAnuncios(lista) {
    gridAnuncios.innerHTML = "";

    const total = Array.isArray(lista) ? lista.length : 0;

    if (!total) {
      contadorAnuncios.textContent = "Nenhum anúncio encontrado.";
      anunciosVazio?.classList.remove("hidden");
      toggleMoreBtn?.classList.add("hidden");
      return;
    }

    anunciosVazio?.classList.add("hidden");

    const shouldPaginate = total > PREVIEW_LIMIT;
    const showing = expanded || !shouldPaginate ? total : PREVIEW_LIMIT;

    contadorAnuncios.textContent = `${total} anúncios disponíveis`;

    lista.slice(0, showing).forEach((a) => {
      gridAnuncios.appendChild(createCard(a));
    });

    if (!toggleMoreBtn) return;

    if (!shouldPaginate) {
      toggleMoreBtn.classList.add("hidden");
    } else {
      toggleMoreBtn.classList.remove("hidden");
      toggleMoreBtn.textContent = expanded ? "Ver menos ↑" : "Ver mais ↓";
    }
  }

  function limparFiltros() {
    document
      .querySelectorAll('input[name="categoria"]')
      .forEach((r) => (r.checked = false));

    if (conservacaoSelect) conservacaoSelect.value = "";
    if (quantidadeSelect) quantidadeSelect.value = "";
    if (estadoSelect) estadoSelect.value = "";
    if (cidadeInput) cidadeInput.value = "";

    if (precoMinInput) precoMinInput.value = "0";
    if (precoMaxInput) precoMaxInput.value = "50000";
    if (precoMaxRange) precoMaxRange.value = "50000";
  }

  async function carregarCategorias() {
    if (!categoriasContainer) return;

    try {
      const response = await fetch(ENDPOINT_CATEGORIAS);
      if (!response.ok) throw new Error();

      const categorias = await response.json();
      const lista = Array.isArray(categorias) ? categorias : [];

      categoriasContainer.innerHTML = "";

      lista.forEach((cat) => {
        const label = document.createElement("label");
        label.className = "flex items-center gap-3";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = "categoria";
        input.value = String(cat.idCategoria);
        input.className = "h-4 w-4 accent-mainblue";

        input.addEventListener("change", () => {
          expanded = false;
          carregarAnuncios();
        });

        const span = document.createElement("span");
        span.textContent = cat.nome;

        label.append(input, span);
        categoriasContainer.appendChild(label);
      });
    } catch {
      categoriasContainer.innerHTML =
        `<p class="text-sm text-red-600">Erro ao carregar categorias.</p>`;
    }
  }

  async function carregarAnuncios() {
    try {
      const filtros = getFilters();
      const qs = buildQueryParams(filtros);

      const response = await fetch(
        `${ENDPOINT_ANUNCIOS}${qs ? `?${qs}` : ""}`
      );

      if (!response.ok) throw new Error();

      const anuncios = await response.json();

      allAnuncios = Array.isArray(anuncios) ? anuncios : [];

      filteredAnuncios = filtrarPorBusca(allAnuncios, searchQuery);

      expanded = false;

      renderAnuncios(filteredAnuncios);
    } catch {
      contadorAnuncios.textContent =
        "Não foi possível carregar os anúncios.";

      anunciosVazio?.classList.remove("hidden");
      gridAnuncios.innerHTML = "";
      toggleMoreBtn?.classList.add("hidden");
    }
  }

  const carregarAnunciosDebounced = debounce(carregarAnuncios, 300);

  [conservacaoSelect, estadoSelect, quantidadeSelect, precoMinInput, precoMaxInput, precoMaxRange]
    .filter(Boolean)
    .forEach((el) => {
      el.addEventListener("change", () => {
        expanded = false;
        carregarAnuncios();
      });

      el.addEventListener("input", () => {
        expanded = false;
        carregarAnunciosDebounced();
      });
    });

  cidadeInput?.addEventListener("input", () => {
    expanded = false;
    carregarAnunciosDebounced();
  });

  cidadeInput?.addEventListener("change", () => {
    expanded = false;
    carregarAnuncios();
  });

  applyBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    expanded = false;
    await carregarAnuncios();
    closeFilter();
  });

  clearBtn?.addEventListener("click", async () => {
    limparFiltros();
    expanded = false;
    await carregarAnuncios();
  });

  toggleMoreBtn?.addEventListener("click", () => {
    expanded = !expanded;
    renderAnuncios(filteredAnuncios);
  });

  window.addEventListener("reuse:search", (e) => {
    searchQuery = e.detail?.q || "";
    filteredAnuncios = filtrarPorBusca(allAnuncios, searchQuery);

    expanded = false;

    renderAnuncios(filteredAnuncios);
  });

  carregarCategorias().finally(() => {
    carregarAnuncios();
  });
});
