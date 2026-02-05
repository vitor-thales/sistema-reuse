document.addEventListener("DOMContentLoaded", () => {

  const contadorAnuncios = document.getElementById("contador-anuncios");
  const gridAnuncios = document.getElementById("listaAnuncios"); // ID correto
  const anunciosVazio = document.getElementById("anunciosVazio");

  if (!contadorAnuncios || !gridAnuncios) {
    console.error("IDs não encontrados no HTML");
    return;
  }

  function formatCurrency(value) {
    if (!value) return "A combinar";

    return Number(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function createCard(anuncio) {

    const card = document.createElement("article");
    card.className =
      "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col";

    const image = document.createElement("img");
    image.className = "w-full h-40 object-cover";
    image.alt = anuncio.nomeProduto || "Anúncio";

    if (anuncio.nomeArquivo) {
      image.src = `/uploads/${anuncio.nomeArquivo}`;
    } else {
      image.src = "/images/adicionar.png";
    }

    const body = document.createElement("div");
    body.className = "p-4 flex flex-col gap-2";


    const title = document.createElement("h4");
    title.className = "font-semibold text-darkblue text-sm";
    title.textContent = anuncio.nomeProduto || "Produto sem título";

    const price = document.createElement("p");
    price.className = "text-mainblue font-bold";
    price.textContent = formatCurrency(anuncio.valorTotal);

    const meta = document.createElement("p");
    meta.className = "text-xs text-gray-500";
    meta.textContent =
      `${anuncio.quantidade || 0} ${anuncio.unidadeMedida || ""}`.trim();

    const company = document.createElement("p");
    company.className = "text-xs text-gray-400";
    company.textContent =
      anuncio.nomeEmpresa || "Empresa não informada";

    body.appendChild(title);
    body.appendChild(price);
    body.appendChild(meta);
    body.appendChild(company);

    card.appendChild(image);
    card.appendChild(body);

    return card;
  }

  async function carregarAnuncios() {
    try {

      const response = await fetch("/anuncie/api/anuncios");

      if (!response.ok) {
        throw new Error("Erro HTTP " + response.status);
      }

      const anuncios = await response.json();

      gridAnuncios.innerHTML = "";

      if (!anuncios || anuncios.length === 0) {
        contadorAnuncios.textContent = "Nenhum anúncio encontrado.";
        anunciosVazio?.classList.remove("hidden");
        return;
      }

      anunciosVazio?.classList.add("hidden");
      contadorAnuncios.textContent =
        `${anuncios.length} anúncios disponíveis`;

      anuncios.forEach((anuncio) => {
        const card = createCard(anuncio);
        gridAnuncios.appendChild(card);
      });

    } catch (err) {
      console.error("Erro ao carregar anúncios:", err);
      contadorAnuncios.textContent =
        "Não foi possível carregar os anúncios.";
    }
  }

  carregarAnuncios();
});
