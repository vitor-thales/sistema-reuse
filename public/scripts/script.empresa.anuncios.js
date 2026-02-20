document.addEventListener("DOMContentLoaded", () => {
    const gridProdutos = document.querySelector("section.grid");
    const contadorProdutos = document.querySelector(".mb-6 p");
    const nomeEmpresaHeader = document.querySelector("h1 + p");
    const logoIniciais = document.querySelector(".w-16.h-16");

    const pathSegments = window.location.pathname.split('/');
    const empresaId = pathSegments[pathSegments.length - 1];

    function formatCurrency(value) {
        if (!value && value !== 0) return "A combinar";
        return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function createProductCard(produto) {
        const article = document.createElement("article");
        article.className = "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col";

        article.innerHTML = `
            <div class="relative">
                <img class="w-full h-40 object-cover" 
                     alt="${produto.nomeProduto}" 
                     src="${produto.nomeArquivo ? `/uploads/${produto.nomeArquivo}` : '/images/favicon.ico'}">
                ${produto.status === 'disponivel' ? '<span class="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-md opacity-80">disponível</span>' : ''}
            </div>
            
            <div class="p-4 flex flex-col gap-3 flex-1">
                <div class="flex flex-col gap-1">
                    <span class="inline-flex w-fit px-3 py-1 rounded-full text-xs bg-mainblue/15 text-mainblue">
                        ${produto.categoria || "Geral"}
                    </span>
                    <h4 class="font-semibold text-darkblue text-sm leading-snug line-clamp-2">${produto.nomeProduto}</h4>
                    <p class="text-xs text-gray-500 line-clamp-1">${produto.descricao || ""}</p>
                </div>
                
                <div class="flex flex-col gap-1 text-xs text-gray-500">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-building text-gray-400"></i>
                        <span class="line-clamp-1">${produto.nomeEmpresa || "Empresa"}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-location-dot text-gray-400"></i>
                        <span class="line-clamp-1">${produto.cidade}, ${produto.estado}</span>
                    </div>
                </div>
                
                <div class="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                    <p class="text-lg font-semibold text-darkblue">${formatCurrency(produto.valorTotal)}</p>
                    <a class="px-4 py-2 rounded-full bg-mainblue text-white text-xs font-semibold hover:opacity-90 transition" 
                       href="/detalhes/${produto.idAnuncio}">Ver Detalhes</a>
                </div>
            </div>
        `;
        return article;
    }

    async function carregarProdutosDaEmpresa() {
        if (!empresaId) {
            contadorProdutos.textContent = "ID da empresa não fornecido.";
            return;
        }

        try {
            // Assuming your API can filter by idEmpresa
            const response = await fetch(`/detalhes-empresa/api/anuncios/${empresaId}`);
            if (!response.ok) throw new Error("Erro ao buscar produtos");

            let produtos = await response.json();
            produtos = produtos.anuncios;

            gridProdutos.innerHTML = "";

            if (produtos.length === 0) {
                contadorProdutos.textContent = "Nenhum produto disponível.";
                return;
            }

            if (produtos[0]) {
                console.log(produtos);
                nomeEmpresaHeader.textContent = produtos[0].nomeEmpresa;
                logoIniciais.textContent = produtos[0].nomeEmpresa.substring(0, 2).toUpperCase();
            }

            contadorProdutos.textContent = `${produtos.length} produtos disponíveis`;

            produtos.forEach(produto => {
                gridProdutos.appendChild(createProductCard(produto));
            });

        } catch (err) {
            console.error(err);
            contadorProdutos.textContent = "Erro ao carregar catálogo.";
        }
    }

    carregarProdutosDaEmpresa();
});