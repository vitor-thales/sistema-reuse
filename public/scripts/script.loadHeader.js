import { loadUserDataAndStart } from "./components/messages.js";
import { toast } from "./utils/script.toast.js";

const unreadChats = new Set();

function setBadgeCount(n) {
  const badge = document.getElementById("chatBadge");
  if (!badge) return;

  const count = Number(n) || 0;

  if (count <= 0) {
    badge.classList.add("hidden");
    badge.textContent = "0";
    return;
  }

  badge.classList.remove("hidden");
  badge.textContent = count > 99 ? "99+" : String(count);
}

function markChatUnread(idConversa) {
  if (!idConversa) return;
  unreadChats.add(String(idConversa));
  setBadgeCount(unreadChats.size);
}

function markChatRead(idConversa) {
  if (!idConversa) return;
  unreadChats.delete(String(idConversa));
  setBadgeCount(unreadChats.size);
}

function initChatBadge(userId) {
  const badge = document.getElementById("chatBadge");
  const chatIcon = document.getElementById("mensagens");
  if (!badge || !chatIcon) return;

  setBadgeCount(unreadChats.size);

  window.addEventListener("chat:message", (e) => {
    const msg = e.detail;
    if (!msg) return;
    if (Number(msg.idDestinatario) === Number(userId)) {
      markChatUnread(msg.idConversa);
    }
  });

  window.addEventListener("chat:read", (e) => {
    const data = e.detail;
    if (!data) return;
    markChatRead(data.idConversa);
  });
}

fetch("/components/header.html")
  .then((response) => response.text())
  .then(async (data) => {
    const holder = document.getElementById("header-placeholder");
    if (!holder) return;

    holder.innerHTML = data;

    const iconeUsuario = document.getElementById("userIcon");
    if (iconeUsuario) {
      iconeUsuario.addEventListener("click", () => {
        window.location.href = "/configuracoes";
      });
    }

    const btnAnuncie = document.getElementById("botaoAnuncie");
    const btnEntrar = document.getElementById("botaoEntrar");
    const logo = document.getElementById("logoRetorna");

    async function handleAnuncieClick() {
      try {
        const response = await fetch("/auth/check");
        const data = await response.json();

        if (data.loggedIn) {
          window.location.href = "/anuncie/novo";
          return;
        }

        if (window.toast?.show) {
          window.toast.show("Você precisa estar logado para anunciar.", "error");
        }

        window.location.href = "/login";
      } catch (err) {
        if (window.toast?.show) {
          window.toast.show("Não foi possível verificar o login. Tente novamente.", "error");
        }
      }
    }

    btnEntrar?.addEventListener("click", () => {
      window.location.href = "/login";
    });

    btnAnuncie?.addEventListener("click", handleAnuncieClick);

    logo?.addEventListener("click", () => {
      window.location.href = "/";
    });

    const barraPesquisa = document.getElementById("barraPesquisa");

    barraPesquisa?.addEventListener("input", () => {
      const q = (barraPesquisa.value || "").trim().toLowerCase();
      window.dispatchEvent(new CustomEvent("reuse:search", { detail: { q } }));
    });

    await atualizarHeader();
    loadUserDataAndStart();

    if (window.__reuseUserId != null) {
      initChatBadge(window.__reuseUserId);
    } else {
      const tryInit = setInterval(() => {
        if (window.__reuseUserId != null) {
          clearInterval(tryInit);
          initChatBadge(window.__reuseUserId);
        }
      }, 150);
    }
  });

async function verificarLogin() {
  try {
    const r = await fetch("/login/api/checkLogin");
    if (!r.ok) return false;
    const d = await r.json();
    return d.loggedIn === true;
  } catch (e) {
    return false;
  }
}

async function atualizarHeader() {
  const botaoEntrar = document.getElementById("botaoEntrar");
  const iconeUser = document.getElementById("userIcon");
  const iconeChat = document.getElementById("mensagens");

  if (!botaoEntrar || !iconeUser || !iconeChat) return;

  const logado = await verificarLogin();

  if (logado) {
    iconeChat.style.display = "inline-block";
    botaoEntrar.style.display = "none";
    iconeUser.style.display = "inline-block";
  } else {
    iconeChat.style.display = "none";
    botaoEntrar.style.display = "inline-block";
    iconeUser.style.display = "none";
  }
}