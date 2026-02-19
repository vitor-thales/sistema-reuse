import { toast } from "./utils/script.toast.js"

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

    const modal = document.getElementById("telaNovoAnuncio");
    const btnAbrirCriar = document.getElementById("botaoNovoAnuncio");
    const btnFecharModal = document.getElementById("botaoFecharModal");
    const form = document.getElementById("formAnuncio");

    const previewAnexos = document.getElementById("previewAnexos");
    const removerImagensIdsEl = document.getElementById("removerImagensIds");

    const API = {
        resumo: "./api/meus-anuncios/resumo",
        semana: "./api/meus-anuncios/semana",
        lista: "./api/meus-anuncios/lista",
        detalhe: (id) => `./api/meus-anuncios/${id}`,
        editar: (id) => `./api/meus-anuncios/${id}`,
        status: (id) => `./api/meus-anuncios/${id}/status`,
        del: (id) => `./api/meus-anuncios/${id}`,
        criar: "./",
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

    function applyDeltaBadge(el, pct) {
        if (!el) return;

        const n = Number(pct);

        el.classList.remove(
            "bg-emerald-50",
            "text-emerald-600",
            "bg-rose-50",
            "text-rose-600",
            "bg-gray-100",
            "text-gray-600"
        );

        if (!Number.isFinite(n)) {
            el.textContent = "—";
            el.classList.add("bg-gray-100", "text-gray-600");
            return;
        }

        const sign = n > 0 ? "+" : "";
        el.textContent = `${sign}${n.toFixed(0)}%`;

        if (n >= 0) el.classList.add("bg-emerald-50", "text-emerald-600");
        else el.classList.add("bg-rose-50", "text-rose-600");
    }

    function renderResumo(data) {
        const views = Number(data?.visualizacoesMensais || 0);
        const sales = Number(data?.vendasMes || 0);
        const active = Number(data?.anunciosAtivos || 0);

        if (elViewsMonth) elViewsMonth.textContent = fmtInt(views);
        if (elSalesMonth) elSalesMonth.textContent = fmtInt(sales);
        if (elActive) elActive.textContent = fmtInt(active);

        applyDeltaBadge(elViewsBadge, data?.viewsDeltaPct);
        applyDeltaBadge(elSalesBadge, data?.salesDeltaPct);
    }

    function clampNonNegativeNumber(el, { integer = false } = {}) {
        if (!el) return;

        let v = (el.value ?? "").toString();

        v = v.replace(/[eE+\-]/g, "");
        v = v.replace(",", ".");
        v = v.replace(/[^0-9.]/g, "");

        const parts = v.split(".");
        if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");

        if (v === "") {
            el.value = "";
            return;
        }

        let num = Number(v);
        if (!Number.isFinite(num) || num < 0) num = 0;
        if (integer) num = Math.floor(num);

        el.value = num.toString();
    }

    function attachNonNegativeNumeric(el, opts) {
        if (!el) return;

        el.addEventListener("keydown", (e) => {
            const blocked = ["e", "E", "+", "-"];
            if (blocked.includes(e.key)) e.preventDefault();
        });

        el.addEventListener("input", () => clampNonNegativeNumber(el, opts));
        el.addEventListener("blur", () => clampNonNegativeNumber(el, opts));

        el.setAttribute("min", "0");
    }

    function stripHtmlTags(text) {
        return String(text || "").replace(/<[^>]*>/g, "");
    }

    function attachNoHtml(el) {
        if (!el) return;

        el.addEventListener("keydown", (e) => {
            if (e.key === "<" || e.key === ">") e.preventDefault();
        });

        el.addEventListener("paste", (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData("text");
            const clean = stripHtmlTags(text);
            document.execCommand("insertText", false, clean);
        });

        el.addEventListener("input", () => {
            const clean = stripHtmlTags(el.value);
            if (clean !== el.value) el.value = clean;
        });

        el.addEventListener("drop", (e) => {
            e.preventDefault();
            const text = e.dataTransfer.getData("text");
            el.value = (el.value || "") + stripHtmlTags(text);
        });
    }

    const MAX_BRL = 50000;
    const MAX_DIGITS = String(Math.round(MAX_BRL * 100));

    function clampDigitsToMax(digits) {
        if (!digits) return "";
        let norm = digits.replace(/^0+/, "");
        if (norm === "") norm = "0";

        if (norm.length > MAX_DIGITS.length) return MAX_DIGITS;
        if (norm.length === MAX_DIGITS.length && norm > MAX_DIGITS) return MAX_DIGITS;

        return norm;
    }

    function formatBRLFromDigits(digits) {
        const n = Number(digits || "0") / 100;
        return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function digitsToNumberString(digits) {
        const d = (digits || "").replace(/\D/g, "");
        if (!d) return "";

        const n = Number(d) / 100;
        if (!Number.isFinite(n)) return "";

        const clamped = Math.min(Math.max(n, 0), MAX_BRL);
        return clamped.toFixed(2);
    }

    function hardResetInput(input) {
        if (!input) return null;

        const clone = input.cloneNode(true);

        clone.setAttribute("type", "text");
        clone.setAttribute("inputmode", "numeric");
        clone.setAttribute("autocomplete", "off");

        clone.removeAttribute("step");
        clone.removeAttribute("min");
        clone.removeAttribute("max");

        clone.value = "";
        clone.dataset.digits = "";

        input.parentNode?.replaceChild(clone, input);
        return clone;
    }

    function attachCentavosMask(valorInput) {
        if (!valorInput) return null;

        valorInput = hardResetInput(valorInput);
        if (!valorInput) return null;

        let digits = "";
        const render = () => {
            if (!digits || digits === "0") {
                valorInput.value = "";
                valorInput.dataset.digits = "";
                return;
            }
            valorInput.value = formatBRLFromDigits(digits);
            valorInput.dataset.digits = digits;
        };

        const navKeys = new Set([
            "Tab", "Enter", "Escape",
            "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
            "Home", "End"
        ]);

        valorInput.addEventListener("keydown", (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (navKeys.has(e.key)) return;

            if (e.key === "Backspace" || e.key === "Delete") {
                e.preventDefault();
                digits = digits.slice(0, -1);
                render();
                return;
            }

            if (/^\d$/.test(e.key)) {
                e.preventDefault();
                digits = clampDigitsToMax(digits + e.key);
                render();
                return;
            }

            e.preventDefault();
        });

        valorInput.addEventListener("paste", (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData("text") || "";
            digits = clampDigitsToMax(text.replace(/\D/g, ""));
            render();
        });

        valorInput.addEventListener("blur", render);

        render();

        return valorInput;
    }

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
                datasets: [{ label: "Visualizações", data: values, borderRadius: 10, borderSkipped: false }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                    y: { beginAtZero: true, ticks: { precision: 0, font: { size: 11 } } },
                },
            },
        });

        canvas.parentElement.style.height = "14rem";
    }

    let valorTotalRef = null;

    (function setupValidations() {
        if (!form) return;

        const valorTotal = form.querySelector('[name="valorTotal"]');
        const quantidade = form.querySelector('[name="quantidade"]');
        const pesoTotal = form.querySelector('[name="pesoTotal"]');

        valorTotalRef = attachCentavosMask(valorTotal);

        attachNonNegativeNumeric(quantidade, { integer: true });
        attachNonNegativeNumeric(pesoTotal, { integer: false });

        attachNoHtml(form.querySelector('[name="origem"]'));
        attachNoHtml(form.querySelector('[name="composicao"]'));
        attachNoHtml(form.querySelector('[name="descricao"]'));
    })();


    const MAX_FILES = 5;
    let mode = "create";
    let editingId = null;

    let selectedFiles = [];
    let previewUrls = [];
    let existingImages = [];
    let removedImageIds = [];

    function openModal() {
        if (!modal) return;
        modal.style.display = "flex";
        document.body.classList.add("overflow-hidden");
    }

    function closeModal() {
        if (!modal) return;
        modal.style.display = "none";
        document.body.classList.remove("overflow-hidden");
    }

    btnAbrirCriar?.addEventListener("click", () => {
        setCreateMode();
        openModal();
    });

    btnFecharModal?.addEventListener("click", closeModal);

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });

    function resetPreviews() {
        previewUrls.forEach((u) => URL.revokeObjectURL(u));
        previewUrls = [];
        if (previewAnexos) previewAnexos.innerHTML = "";
    }

    function setCreateMode() {
        mode = "create";
        editingId = null;
        selectedFiles = [];
        existingImages = [];
        removedImageIds = [];
        if (removerImagensIdsEl) removerImagensIdsEl.value = "";
        form?.reset();
        resetPreviews();
        updateFileInput();
    }

    function setEditMode(id) {
        mode = "edit";
        editingId = Number(id);
        selectedFiles = [];
        existingImages = [];
        removedImageIds = [];
        if (removerImagensIdsEl) removerImagensIdsEl.value = "";
        form?.reset();
        resetPreviews();
        updateFileInput();
    }

    function updateFileInput() {
        if (!form) return;
        const fileInput = form.querySelector('input[name="imagens_produto"]');
        if (!fileInput) return;

        const dt = new DataTransfer();
        selectedFiles.forEach((f) => dt.items.add(f));
        fileInput.files = dt.files;
    }

    function renderPreviews() {
        if (!previewAnexos) return;

        resetPreviews();

        existingImages
            .filter((img) => !removedImageIds.includes(img.idImagem))
            .forEach((img) => {
                const wrap = document.createElement("div");
                wrap.className =
                    "relative w-24 h-24 rounded-xl overflow-hidden border border-stronggray/40 bg-gray-100";

                const image = document.createElement("img");
                image.src = buildImgUrl(img.nomeArquivo);
                image.alt = img.nomeArquivo;
                image.className = "w-full h-full object-cover";

                const btn = document.createElement("button");
                btn.type = "button";
                btn.className =
                    "absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center";
                btn.textContent = "X";
                btn.title = "Remover imagem";
                btn.onclick = () => {
                    removedImageIds.push(img.idImagem);
                    if (removerImagensIdsEl) removerImagensIdsEl.value = removedImageIds.join(",");
                    renderPreviews();
                };

                wrap.appendChild(image);
                wrap.appendChild(btn);
                previewAnexos.appendChild(wrap);
            });

        selectedFiles.forEach((file, idx) => {
            const wrap = document.createElement("div");
            wrap.className =
                "relative w-24 h-24 rounded-xl overflow-hidden border border-stronggray/40 bg-gray-100";

            const image = document.createElement("img");
            const url = URL.createObjectURL(file);
            previewUrls.push(url);
            image.src = url;
            image.alt = file.name;
            image.className = "w-full h-full object-cover";

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className =
                "absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center";
            btn.textContent = "X";
            btn.title = "Remover imagem";
            btn.onclick = () => {
                selectedFiles = selectedFiles.filter((_, i) => i !== idx);
                updateFileInput();
                renderPreviews();
            };

            wrap.appendChild(image);
            wrap.appendChild(btn);
            previewAnexos.appendChild(wrap);
        });
    }

    async function carregarCategorias() {
        const select = document.getElementById("select-categorias");

        try {
            const response = await fetch("/anuncie/categorias");
            const categorias = await response.json();   

            select.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';

            categorias.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.idCategoria;
                option.textContent = cat.nome;
                select.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar categorias:", error);
            select.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    function attachUploadListener() {
        if (!form) return;
        const fileInput = form.querySelector('input[name="imagens_produto"]');
        if (!fileInput) return;

        fileInput.addEventListener("change", (e) => {
            const incoming = Array.from(e.target.files || []);
            const used = (existingImages.length - removedImageIds.length) + selectedFiles.length;
            const slots = Math.max(0, MAX_FILES - used);

            if (slots <= 0) {
                toast.show("Você já adicionou o número máximo de imagens.", "error");
                fileInput.value = "";
                return;
            }

            selectedFiles = selectedFiles.concat(incoming.slice(0, slots));

            if (incoming.length > slots) {
                toast.show(`Apenas ${MAX_FILES} imagens são permitidas. As demais foram ignoradas.`);
            }

            updateFileInput();
            renderPreviews();
        });
    }

    attachUploadListener();

    function reverseCondicaoToSelectValue(dbValue) {
        const s = String(dbValue || "").toLowerCase();
        if (s.includes("funcional")) return "usado-funcional";
        if (s.includes("não funcional") || s.includes("nao funcional") || s.includes("sucata"))
            return "sucata";
        if (s.includes("novo")) return "novo";
        return "usado-funcional";
    }

    function reverseModalidadeToSelectValue(dbValue) {
        const s = String(dbValue || "").toLowerCase();
        if (s.includes("agendamento")) return "agendamento";
        if (s.includes("entrega")) return "entrega";
        if (s.includes("retirada")) return "retirada";
        return "agendamento";
    }

    function setField(name, value) {
        if (!form) return;
        const el = form.querySelector(`[name="${name}"]`);
        if (!el) return;
        el.value = value ?? "";
    }

    async function openEdit(id) {
        setEditMode(id);

        const res = await fetchJson(API.detalhe(id));
        const data = res?.data || res;
        const anuncio = data?.anuncio;
        const imagens = data?.imagens || [];
        console.log(anuncio);

        if (!anuncio) throw new Error("Não foi possível carregar o anúncio.");

        setField("nomeProduto", anuncio.nomeProduto);
        setField("valorTotal", anuncio.valorTotal == null ? "" : fmtBRL(anuncio.valorTotal));
        setField("quantidade", anuncio.quantidade ?? "");
        setField("unidadeMedida", anuncio.unidadeMedida ?? "");
        setField("pesoTotal", anuncio.pesoTotal ?? "");
        setField("descricao", anuncio.descricao ?? "");

        setField("tipo", anuncio.categoria ?? "");
        setField("condicao", reverseCondicaoToSelectValue(anuncio.condicao));
        setField("origem", anuncio.origem ?? "");
        setField("composicao", anuncio.composicao ?? "");
        setField("modalidadeColeta", reverseModalidadeToSelectValue(anuncio.modalidadeColeta));

        existingImages = imagens.map((x) => ({
            idImagem: Number(x.idImagem),
            nomeArquivo: x.nomeArquivo,
        }));

        removedImageIds = [];
        if (removerImagensIdsEl) removerImagensIdsEl.value = "";

        selectedFiles = [];
        updateFileInput();
        renderPreviews();

        openModal();
    }

    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const fd = new FormData(form);

            if (mode === "edit") {
                if (!editingId) throw new Error("ID do anúncio não encontrado para edição.");
                if (removerImagensIdsEl) fd.set("removerImagensIds", removerImagensIdsEl.value || "");

                const res = await fetch(API.editar(editingId), {
                    method: "PATCH",
                    credentials: "include",
                    body: fd,
                });

                if (!res.ok) {
                    let msg = `Erro ${res.status}`;
                    try {
                        const j = await res.json();
                        msg = j?.error || j?.message || msg;
                    } catch { }
                    throw new Error(msg);
                }

                toast.show("Alterações salvas com sucesso!");
                closeModal();
                await loadAll();
                return;
            }

            const res = await fetch(API.criar, {
                method: "POST",
                credentials: "include",
                body: fd,
            });

            if (!res.ok) {
                let msg = `Erro ${res.status}`;
                try {
                    const j = await res.json();
                    msg = j?.error || j?.message || msg;
                } catch { }
                throw new Error(msg);
            }

            toast.show("Anúncio publicado com sucesso!");
            closeModal();
            setCreateMode();
            await loadAll();
        } catch (err) {
            toast.show(err.message || "Erro ao salvar.", "error");
        }
    });

    let openMenuEl = null;

    function closeOpenMenu() {
        if (!openMenuEl) return;
        openMenuEl.classList.add("hidden");
        openMenuEl.style.position = "";
        openMenuEl.style.left = "";
        openMenuEl.style.top = "";
        openMenuEl.style.zIndex = "";
        openMenuEl = null;
    }

    document.addEventListener("click", (e) => {
        if (!openMenuEl) return;
        const insideMenu = e.target.closest('[data-menu="row"]');
        const menuBtn = e.target.closest('[data-action="menu"]');
        if (!insideMenu && !menuBtn) closeOpenMenu();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeOpenMenu();
    });

    function positionMenuSmart(menuEl, buttonEl) {
        const btnRect = buttonEl.getBoundingClientRect();

        menuEl.classList.remove("hidden");
        menuEl.style.position = "fixed";
        menuEl.style.zIndex = "9999";

        menuEl.style.left = "-9999px";
        menuEl.style.top = "-9999px";
        const menuRect = menuEl.getBoundingClientRect();

        const padding = 8;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const spaceBelow = vh - btnRect.bottom;
        const spaceAbove = btnRect.top;

        const openUp = spaceBelow < menuRect.height + padding && spaceAbove >= menuRect.height + padding;

        let top = openUp ? btnRect.top - menuRect.height - 8 : btnRect.bottom + 8;
        let left = btnRect.right - menuRect.width;

        if (left < padding) left = padding;
        if (left + menuRect.width > vw - padding) left = vw - padding - menuRect.width;

        if (top < padding) top = padding;
        if (top + menuRect.height > vh - padding) top = vh - padding - menuRect.height;

        menuEl.style.left = `${left}px`;
        menuEl.style.top = `${top}px`;
    }

    window.addEventListener("resize", () => {
        if (!openMenuEl) return;
        const id = openMenuEl.getAttribute("data-id");
        const btn = document.querySelector(`button[data-action="menu"][data-id="${id}"]`);
        if (btn) positionMenuSmart(openMenuEl, btn);
    });

    window.addEventListener(
        "scroll",
        () => {
            if (!openMenuEl) return;
            const id = openMenuEl.getAttribute("data-id");
            const btn = document.querySelector(`button[data-action="menu"][data-id="${id}"]`);
            if (btn) positionMenuSmart(openMenuEl, btn);
        },
        true
    );

    async function apiSetStatus(id, status) {
        await fetchJson(API.status(id), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
    }

    async function apiDelete(id) {
        await fetchJson(API.del(id), { method: "DELETE" });
    }

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
              <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-mainblue/15 text-mainblue font-semibold">${cat}</span>

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
            <div class="relative">
              <button type="button"
                class="h-9 w-9 rounded-xl border border-stronggray text-darkblue bg-white hover:bg-gray-50 transition inline-flex items-center justify-center"
                aria-label="Opções"
                data-action="menu"
                data-id="${anuncio?.idAnuncio}">
                <i class="fa-solid fa-ellipsis-vertical"></i>
              </button>

              <div class="hidden w-56 bg-white border border-stronggray rounded-2xl shadow-lg overflow-hidden"
                   data-menu="row"
                   data-id="${anuncio?.idAnuncio}">
                <button type="button"
                  class="w-full px-4 py-3 text-sm text-darkblue hover:bg-gray-50 flex items-center gap-3"
                  data-action="sold"
                  data-id="${anuncio?.idAnuncio}">
                  <i class="fa-solid fa-bag-shopping text-gray-500"></i>
                  Marcar como vendido
                </button>

                <div class="h-px bg-stronggray/60"></div>

                <button type="button"
                  class="w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  data-action="delete"
                  data-id="${anuncio?.idAnuncio}">
                  <i class="fa-solid fa-trash text-red-500"></i>
                  Excluir anúncio
                </button>
              </div>
            </div>

            <button type="button"
              class="h-9 px-3 rounded-xl border border-stronggray text-darkblue bg-white hover:bg-gray-50 transition text-sm font-semibold inline-flex items-center gap-2"
              data-action="editar"
              data-id="${anuncio?.idAnuncio}">
              <i class="fa-solid fa-pen-to-square"></i>
              Editar
            </button>

            <button type="button"
              class="h-9 px-3 rounded-xl border border-stronggray text-darkblue bg-white hover:bg-gray-50 transition text-sm font-semibold inline-flex items-center gap-2"
              data-action="toggle"
              data-id="${anuncio?.idAnuncio}"
              data-status="${status}">
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

            const action = btn.getAttribute("data-action");
            const id = Number(btn.getAttribute("data-id"));
            if (!id) return;

            if (action === "menu") {
                const menu = container.querySelector(`[data-menu="row"][data-id="${id}"]`);
                if (!menu) return;

                if (openMenuEl && openMenuEl !== menu) closeOpenMenu();

                const willOpen = menu.classList.contains("hidden");
                if (!willOpen) {
                    closeOpenMenu();
                    return;
                }

                openMenuEl = menu;
                positionMenuSmart(menu, btn);
                return;
            }

            if (action === "sold") {
                closeOpenMenu();

                const ok = toast.confirm("Marcar este anúncio como VENDIDO? Essa ação não é reversível!");
                if (!ok) return;

                try {
                    await apiSetStatus(id, "vendido");
                    await loadAll();
                } catch (err) {
                    toast.show("Não foi possível marcar como vendido: " + err.message, "error");
                }
                return;
            }

            if (action === "delete") {
                closeOpenMenu();

                const ok = toast.confirm(
                    "Tem certeza que deseja EXCLUIR este anúncio?\n\nEssa ação não é reversível!"
                );
                if (!ok) return;

                try {
                    await apiDelete(id);
                    await loadAll();
                } catch (err) {
                    toast.show("Não foi possível excluir: " + err.message, "error");
                }
                return;
            }

            if (action === "editar") {
                closeOpenMenu();
                try {
                    await openEdit(id);
                } catch (err) {
                    toast.show("Não foi possível abrir para edição: " + err.message, "error");
                }
                return;
            }

            if (action === "toggle") {
                closeOpenMenu();

                const current = (btn.getAttribute("data-status") || "").toLowerCase();
                const next = current === "pausado" ? "ativo" : "pausado";

                try {
                    await apiSetStatus(id, next);
                    await loadAll();
                } catch (err) {
                    toast.show("Não foi possível pausar/reativar: " + err.message, "error");
                }
                return;
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

    async function loadAll() {
        try {
            closeOpenMenu();

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
        carregarCategorias();
    });
})();