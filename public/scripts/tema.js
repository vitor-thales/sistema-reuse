document.addEventListener("DOMContentLoaded", () => {
  const radioClaro = document.getElementById("tema-claro");
  const radioEscuro = document.getElementById("tema-escuro");

  // Mesmo se não tiver os radios (ou estiver em outra página), ainda aplica tema salvo
  const temaSalvo = localStorage.getItem("tema"); // "claro" | "escuro"
  const isDark = temaSalvo === "escuro";

  function aplicarTema(dark) {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("tema", dark ? "escuro" : "claro");

    // mantém os radios sincronizados quando existirem
    if (radioClaro && radioEscuro) {
      radioClaro.checked = !dark;
      radioEscuro.checked = dark;
    }
  }

  // aplica tema inicial
  aplicarTema(isDark);

  // se não tiver os radios, só sai (tema já foi aplicado)
  if (!radioClaro || !radioEscuro) return;

  // Evento: tema claro
  radioClaro.addEventListener("change", () => {
    if (radioClaro.checked) aplicarTema(false);
  });

  // Evento: tema escuro
  radioEscuro.addEventListener("change", () => {
    if (radioEscuro.checked) aplicarTema(true);
  });

  // Se em algum lugar do projeto você disparar isso:
  // window.dispatchEvent(new CustomEvent("tema:toggle", { detail: { dark: true } }))
  // ele também troca o tema sem depender dos radios.
  window.addEventListener("tema:toggle", (e) => {
    const dark = Boolean(e?.detail?.dark);
    aplicarTema(dark);
  });
});
