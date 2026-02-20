document.addEventListener("DOMContentLoaded", () => {
  const radioClaro = document.getElementById("tema-claro");
  const radioEscuro = document.getElementById("tema-escuro");

  const temaSalvo = localStorage.getItem("tema"); 
  const isDark = temaSalvo === "escuro";

  function aplicarTema(dark) {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("tema", dark ? "escuro" : "claro");

    if (radioClaro && radioEscuro) {
      radioClaro.checked = !dark;
      radioEscuro.checked = dark;
    }
  }

  aplicarTema(isDark);

  if (!radioClaro || !radioEscuro) return;

  radioClaro.addEventListener("change", () => {
    if (radioClaro.checked) aplicarTema(false);
  });

  radioEscuro.addEventListener("change", () => {
    if (radioEscuro.checked) aplicarTema(true);
  });

  window.addEventListener("tema:toggle", (e) => {
    const dark = Boolean(e?.detail?.dark);
    aplicarTema(dark);
  });
});
