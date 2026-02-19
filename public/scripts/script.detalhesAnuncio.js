document.addEventListener("DOMContentLoaded", async () => {
  const imgPrincipal = document.getElementById("img-principal");
  const thumbs = document.getElementById("thumbs");
  const badgeStatus = document.getElementById("badge-status");

  const chipCategoria = document.getElementById("chip-categoria");
  const titulo = document.getElementById("titulo");
  const preco = document.getElementById("preco");
  const precoUnidade = document.getElementById("preco-unidade");

  const empresaIniciais = document.getElementById("empresa-iniciais");
  const empresaNome = document.getElementById("empresa-nome");
  const empresaLocal = document.getElementById("empresa-local");

  const metaQuantidade = document.getElementById("meta-quantidade");
  const metaPeso = document.getElementById("meta-peso");
  const metaData = document.getElementById("meta-data");

  const descricao = document.getElementById("descricao");

  const specCategoria = document.getElementById("spec-categoria");
  const specCondicao = document.getElementById("spec-condicao");
  const specOrigem = document.getElementById("spec-origem");
  const specComposicao = document.getElementById("spec-composicao");
  const specColeta = document.getElementById("spec-coleta");

  const btnContato = document.getElementById("btn-contato");

  function formatCurrency(value) {
    if (value === null || value === undefined || value === "") return "A combinar";
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatDateBR(isoOrDate) {
    if (!isoOrDate) return "—";
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  }

  function getIniciais(nome) {
    const parts = String(nome || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "RE";
    const a = parts[0][0] || "";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  }

  function setStatus(statusRaw) {
    const s = String(statusRaw || "disponível").toLowerCase();
    const pending = s.includes("aguard") || s.includes("pend") || s.includes("coleta");

    badgeStatus.textContent = pending ? "aguardando coleta" : "disponível";
    badgeStatus.classList.remove("bg-green-500", "bg-amber-500");
    badgeStatus.classList.add(pending ? "bg-amber-500" : "bg-green-500");
  }

  function renderThumbs(imagens = []) {
    thumbs.innerHTML = "";

    const list = Array.isArray(imagens) ? imagens : [];
    const urls = list.length ? list : [imgPrincipal.src];

    urls.slice(0, 4).forEach((url, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "rounded-2xl overflow-hidden border border-stronggray bg-gray-50 hover:opacity-95 transition";

      const img = document.createElement("img");
      img.src = url;
      img.alt = `Miniatura ${idx + 1}`;
      img.className = "w-full h-[5.5rem] object-cover";

      btn.addEventListener("click", () => {
        imgPrincipal.src = url;
      });

      btn.appendChild(img);
      thumbs.appendChild(btn);
    });
  }

  const parts = window.location.pathname.split("/").filter(Boolean);
  const id = parts[parts.length - 1];

  if (!id) {
    toast.show("ID do anúncio não encontrado na URL.", "error");
    return;
  }

  try {
    await fetch(`/detalhes/view/${id}`, {method: "POST"});

    const r = await fetch(`/detalhes/api/${id}`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const data = await r.json();

    const imagens = (data.imagens || []).map((x) => {
      if (String(x).startsWith("http")) return x;
      return `/uploads/${x}`;
    });

    const res = await fetch(`/mensagens/api/getPartner/${data.idEmpresa}`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const json = await res.json();

    if (imagens[0]) imgPrincipal.src = imagens[0];
    renderThumbs(imagens);

    setStatus(data.status);

    chipCategoria.textContent = data.categoria || "Categoria";
    titulo.textContent = data.nomeProduto || "Produto";

    preco.textContent = formatCurrency(data.valorTotal);

    if (data.valorUnidade && data.unidadeMedida) {
      precoUnidade.textContent = `(${formatCurrency(data.valorUnidade)}/${data.unidadeMedida})`;
    } else {
      precoUnidade.textContent = "";
    }
    empresaNome.textContent = json.nome || "Empresa";
    empresaIniciais.textContent = getIniciais(json.nome);
    empresaLocal.querySelector("span").textContent =
      `${data.cidade || "—"}, ${data.estado || "—"}`;

    metaQuantidade.textContent = data.quantidade ? `${data.quantidade} ${data.unidadeMedida || ""}`.trim() : "—";
    metaPeso.textContent = data.pesoTotal ? `${data.pesoTotal} Kg` : "—";
    metaData.textContent = formatDateBR(data.dataPublicacao);

    descricao.textContent = data.descricao || "—";

    specCategoria.textContent = data.categoria || "—";
    specCondicao.textContent = data.condicao || "—";
    specOrigem.textContent = data.origem || "—";
    specComposicao.textContent = data.composicao || "—";
    specColeta.textContent = data.modalidadeColeta || "—";

    btnContato.addEventListener("click", async () => {
      startNewChat(data.idEmpresa, json.nome, json.publicKey);
    });

  } catch (err) {
    console.error(err);
    const notFound = await fetch("/404");
    const text = await notFound.text();
    document.body.innerHTML = new DOMParser().parseFromString(text, "text/html").body.innerHTML;
    document.body.classList.add("flex", "items-center", "justify-center", "p-6");
  }
});
