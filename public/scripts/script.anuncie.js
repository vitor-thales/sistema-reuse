console.log("✅ script.anuncie.js carregou");

const btnAbrir = document.getElementById("botaoNovoAnuncio");
const btnFechar = document.getElementById("botaoFecharModal");
const modal = document.getElementById("telaNovoAnuncio");
const form = document.getElementById("formAnuncio");

const fileInput = form?.querySelector('input[name="imagens_produto"]');
const previewAnexos = document.getElementById("previewAnexos");

const MAX_FILES = 5;
let selectedFiles = [];
let previewUrls = [];

/* =========================
   HELPERS
   ========================= */

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

/* =========================
   VALOR TOTAL (CENTAVOS AUTO + LIMITE 50K)
   ========================= */

const MAX_BRL = 50000; // R$ 50.000,00
const MAX_DIGITS = String(Math.round(MAX_BRL * 100)); // "5000000"

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
  return clamped.toFixed(2); // "0.55"
}

/**
 * BLINDAGEM: sempre clona e substitui o input no DOM.
 * Isso remove QUALQUER listener antigo que esteja preso nele.
 */
function hardResetInput(input) {
  if (!input) return null;

  const clone = input.cloneNode(true);

  // forçamos text pra poder mostrar "R$ 0,55"
  clone.setAttribute("type", "text");
  clone.setAttribute("inputmode", "numeric");
  clone.setAttribute("autocomplete", "off");

  // remove atributos do number que atrapalham
  clone.removeAttribute("step");
  clone.removeAttribute("min");
  clone.removeAttribute("max");

  // limpa valor inicial e dataset
  clone.value = "";
  clone.dataset.digits = "";

  input.parentNode?.replaceChild(clone, input);
  return clone;
}

function attachCentavosMask(valorInput) {
  if (!valorInput) return null;

  // BLINDA e substitui o elemento (mata máscaras antigas)
  valorInput = hardResetInput(valorInput);
  if (!valorInput) return null;

  let digits = ""; // buffer interno

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

    // bloqueia todo o resto
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

  // LOG pra você ter certeza de que esse campo foi substituído
  console.log("✅ valorTotal blindado (clone aplicado):", valorInput);

  return valorInput;
}

/* =========================
   SETUP VALIDATIONS
   ========================= */

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

/* =========================
   IMAGENS
   ========================= */

function updateFileInput() {
  if (!fileInput) return;
  const dataTransfer = new DataTransfer();
  selectedFiles.forEach((file) => dataTransfer.items.add(file));
  fileInput.files = dataTransfer.files;
}

function clearPreviews() {
  previewUrls.forEach((url) => URL.revokeObjectURL(url));
  previewUrls = [];
  if (previewAnexos) previewAnexos.innerHTML = "";
}

function renderPreviews() {
  if (!previewAnexos) return;

  clearPreviews();
  selectedFiles.forEach((file, index) => {
    const wrapper = document.createElement("div");
    wrapper.className =
      "relative w-24 h-24 rounded-xl overflow-hidden border border-stronggray/40 bg-gray-100";

    const img = document.createElement("img");
    const url = URL.createObjectURL(file);
    previewUrls.push(url);
    img.src = url;
    img.alt = file.name;
    img.className = "w-full h-full object-cover";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className =
      "absolute -top-1 -right-1 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center";
    removeBtn.setAttribute("aria-label", `Remover ${file.name}`);
    removeBtn.textContent = "X";
    removeBtn.onclick = () => {
      selectedFiles = selectedFiles.filter((_, fileIndex) => fileIndex !== index);
      updateFileInput();
      renderPreviews();
    };

    wrapper.appendChild(img);
    wrapper.appendChild(removeBtn);
    previewAnexos.appendChild(wrapper);
  });
}

fileInput?.addEventListener("change", (event) => {
  const incomingFiles = Array.from(event.target.files || []);
  const availableSlots = MAX_FILES - selectedFiles.length;

  if (availableSlots <= 0) {
    alert("Você já adicionou o número máximo de imagens.");
    fileInput.value = "";
    return;
  }

  selectedFiles = selectedFiles.concat(incomingFiles.slice(0, availableSlots));

  if (incomingFiles.length > availableSlots) {
    alert(`Apenas ${MAX_FILES} imagens são permitidas. As demais foram ignoradas.`);
  }

  updateFileInput();
  renderPreviews();
});

/* =========================
   MODAL
   ========================= */

if (btnAbrir && modal) {
  btnAbrir.onclick = () => {
    modal.style.display = "flex";
  };
}

if (btnFechar && modal) {
  btnFechar.onclick = () => {
    modal.style.display = "none";
  };
}

/* =========================
   SUBMIT
   ========================= */

if (form) {
  form.onsubmit = async (e) => {
    e.preventDefault();

    clampNonNegativeNumber(form.querySelector('[name="quantidade"]'), { integer: true });
    clampNonNegativeNumber(form.querySelector('[name="pesoTotal"]'), { integer: false });

    const origem = form.querySelector('[name="origem"]');
    const composicao = form.querySelector('[name="composicao"]');
    const descricao = form.querySelector('[name="descricao"]');

    if (origem) origem.value = stripHtmlTags(origem.value || "");
    if (composicao) composicao.value = stripHtmlTags(composicao.value || "");
    if (descricao) descricao.value = stripHtmlTags(descricao.value || "");

    const valorInput = valorTotalRef || form.querySelector('[name="valorTotal"]');

    // converte do buffer -> "0.55"
    if (valorInput) {
      const digits = valorInput.dataset.digits || "";
      valorInput.value = digitsToNumberString(digits); // pode virar "" (a combinar)
    }

    const formData = new FormData(form);

    try {
      const response = await fetch("/anuncie", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Erro ao salvar anúncio.");
      }

      const result = await response.json();
      alert(result.message || "Anúncio publicado com sucesso!");

      if (modal) modal.style.display = "none";
      form.reset();
      selectedFiles = [];
      updateFileInput();
      renderPreviews();

      // reseta valorTotal
      if (valorInput) {
        valorInput.dataset.digits = "";
        valorInput.value = "";
      }
    } catch (err) {
      alert(err.message || "Erro ao salvar anúncio.");
    }
  };
}
