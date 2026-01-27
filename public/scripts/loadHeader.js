let usuarioLogado = false; 

fetch('/components/header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;

    const btnAnuncie = document.getElementById('botaoAnuncie');
    const btnEntrar = document.getElementById('botaoEntrar');
    
    btnEntrar.addEventListener('click', function(){
      window.location.href = '/pages/login.html';
    });

    if (btnAnuncie) {
      btnAnuncie.addEventListener('click', function (e) {
        e.preventDefault(); 

        if (usuarioLogado) {
          window.location.href = '/pages/anuncie.html';
        } else {
          exibirNotificacao("Você precisa estar logado para anunciar!");
        }
      });
    }
  });

function exibirNotificacao(mensagem) {
  alert(mensagem);
}