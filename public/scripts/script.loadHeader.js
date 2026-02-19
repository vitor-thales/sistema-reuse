import { loadUserDataAndStart } from "./components/messages.js";

fetch('/components/header.html')
  .then(response => response.text())
  .then(async (data) => {
    document.getElementById('header-placeholder').innerHTML = data;

    const iconeUsuario = document.getElementById("userIcon");

    if (iconeUsuario) {
      iconeUsuario.addEventListener("click", () => {
        window.location.href = "/configuracoes";
      });
    }

    const btnAnuncie = document.getElementById('botaoAnuncie');
    const btnEntrar = document.getElementById('botaoEntrar');
    const logo = document.getElementById('logoRetorna');

    async function handleAnuncieClick() {
      try {
        const response = await fetch('/auth/check');
        const data = await response.json();

        if (data.loggedIn) {
          window.location.href = '/anuncie/novo';
          return;
        }

<<<<<<< HEAD
        alert('Você precisa estar logado para anunciar.');
        window.location.href = '/pages/login.html';
      } catch (err) {
        alert('Não foi possível verificar o login. Tente novamente.');
=======
        toast.show('Você precisa estar logado para anunciar.', "error");
        window.location.href = '/pages/login.html';
      } catch (err) {
        toast.show('Não foi possível verificar o login. Tente novamente.', "error");
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
      }
    }

    btnEntrar?.addEventListener('click', () => {
      window.location.href = '/pages/login.html';
    });

    btnAnuncie?.addEventListener('click', handleAnuncieClick);

    logo?.addEventListener('click', () => {
      window.location.href = '/';
    });
    await atualizarHeader();

    loadUserDataAndStart();
  });

<<<<<<< HEAD
function exibirNotificacao(mensagem) {
  alert(mensagem);
}

=======
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
async function verificarLogin() {
  try {
    const r = await fetch("/login/api/checkLogin");
    if (!r.ok) return false;
    const d = await r.json();
    return d.loggedIn === true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function atualizarHeader() {
  const botaoEntrar = document.getElementById("botaoEntrar");
  const iconeUser = document.getElementById("userIcon");
<<<<<<< HEAD
  const iconeNotificacao = document.getElementById("notificacoes")
=======
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
  const iconeChat = document.getElementById("mensagens");

  if (!botaoEntrar || !iconeUser) {
    console.warn("Header: botaoEntrar ou userIcon não encontrado no DOM");
    return;
  }

  const logado = await verificarLogin();

  if (logado) {
<<<<<<< HEAD
    iconeChat.style.display = "inline-block"
    iconeNotificacao.style.display = "inline-block"
    botaoEntrar.style.display = "none";
    iconeUser.style.display = "inline-block";
  } else {
    iconeChat.style.display = "none"
    iconeNotificacao.style.display = "none"
=======
    iconeChat.style.display = "inline-block";
    botaoEntrar.style.display = "none";
    iconeUser.style.display = "inline-block";
  } else {
    iconeChat.style.display = "none";
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
    botaoEntrar.style.display = "inline-block";
    iconeUser.style.display = "none";
  }
}
