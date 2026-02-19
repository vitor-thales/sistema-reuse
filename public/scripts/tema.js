document.addEventListener("DOMContentLoaded", () => {
  const radioClaro = document.getElementById("tema-claro");
  const radioEscuro = document.getElementById("tema-escuro");

<<<<<<< HEAD
  // Mesmo se não tiver os radios (ou estiver em outra página), ainda aplica tema salvo
  const temaSalvo = localStorage.getItem("tema"); // "claro" | "escuro"
=======
  const temaSalvo = localStorage.getItem("tema"); 
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
  const isDark = temaSalvo === "escuro";

  function aplicarTema(dark) {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("tema", dark ? "escuro" : "claro");

<<<<<<< HEAD
    // mantém os radios sincronizados quando existirem
=======
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
    if (radioClaro && radioEscuro) {
      radioClaro.checked = !dark;
      radioEscuro.checked = dark;
    }
  }

<<<<<<< HEAD
  // aplica tema inicial
  aplicarTema(isDark);

  // se não tiver os radios, só sai (tema já foi aplicado)
  if (!radioClaro || !radioEscuro) return;

  // Evento: tema claro
=======
  aplicarTema(isDark);

  if (!radioClaro || !radioEscuro) return;

>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
  radioClaro.addEventListener("change", () => {
    if (radioClaro.checked) aplicarTema(false);
  });

<<<<<<< HEAD
  // Evento: tema escuro
=======
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
  radioEscuro.addEventListener("change", () => {
    if (radioEscuro.checked) aplicarTema(true);
  });

<<<<<<< HEAD
  // Se em algum lugar do projeto você disparar isso:
  // window.dispatchEvent(new CustomEvent("tema:toggle", { detail: { dark: true } }))
  // ele também troca o tema sem depender dos radios.
=======
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
  window.addEventListener("tema:toggle", (e) => {
    const dark = Boolean(e?.detail?.dark);
    aplicarTema(dark);
  });
});
