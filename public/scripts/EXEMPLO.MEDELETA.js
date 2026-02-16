/**
 * GUIA RÁPIDO: INTEGRAÇÃO FRONT-END CHAT E2EE
 * Este arquivo contém exemplos práticos de como usar o ChatEngine,
 * as rotas de API (Express) e os eventos de Socket.io.
 * OBS: Eu verifiquei as funções algumas vezes mas ainda assim pode ter algum
 * erro que eu acabei deixando passar, então se não tiver funcionando algo,
 * pode ser que não seja da sua parte, qualquer dúvida só chamar.
 * OBS2: Eu não marquei a resposta de cada uma das rotas mas qualquer coisa
 * só dar um console.log pra ver o que elas retornam certinho.
 */

// ---------------------------------------------------------
// 1. INICIALIZAÇÃO
// ---------------------------------------------------------
// Deve ser chamado assim que o usuário entrar na página de chat.
// idUsuario: número do ID do banco.
// minhaChavePublica: String Base64 que veio da tbEmpresas pra ser mais específico a ikPublica.
await ChatEngine.init(idUsuario, minhaChavePublica);


// ---------------------------------------------------------
// 2. BUSCANDO DADOS (API REST)
// ---------------------------------------------------------

// Exemplo: Carregar lista de contatos/conversas no menu lateral
async function carregarMenuConversas() {
    const response = await fetch('/api/getConversations');
    const conversas = await response.json();
    /*
    Aqui em conversas você vai receber uma lista com todas as conversas, cada um dos items da lista contem os seguintes dados:
    - idConversa
    - partnerName (Nome Fantasia) Cuidado! Esse valor pode ser nulo já que ele não é um campo obrigatório!
    - scndPartnerName (Razão Social) Se a empresa não tiver nome fantasia usa esse daqui!
    - partnetId (Id da empresa com quem é a conversa)
    - lastMessageContent (Ultima mensagem enviada na conversa, tá criptografada)
    - dataEnvio (Data que foi enviada essa mensagem)
    - lida (Se foi lida)
    - idRemetente (Quem enviou a mensagem, pode ser usado para verificar se foi o usuário que enviou a mensagem ou recebeu)
    */
    
    conversas.forEach(conv => {
        console.log(`Conversa com: ${conv.partnerName}`);
        console.log(`Última mensagem: ${conv.lastMessageContent}`); // Ainda criptografada!
        //Tem exemplos de como descriptografar mais pra frente
    });
}

// Exemplo: Carregar histórico de uma conversa (com paginação)
let messageOffset = 0;
async function abrirConversa(idConversa) {
    const response = await fetch(`/api/getMessages/${idConversa}?offset=${messageOffset}`);
    const mensagens = await response.json();
    /*
    Aqui você recebe as últimas 25 mensagens da conversa, carregar todas de uma vez pode demorar demais causando
    lentidão no sistema, então você tem que criar uma função que ao subir na conversa ele vai enviando mais requisições
    pra rota para carregar mais mensagens, só aumentar o messageOffset por 25 cada vez, os campos enviados são:
    - idMensagem,
    - idRemetente,
    - idDestinatario,
    - content (mensagem criptografada),
    - iv (usada na descriptografia e verificação da assinatura da mensagem),
    - sig (assinatura da mensagem, serve pra confirmar que a mensagem não foi adulterada e que realmente veio de onde esperado),
    - dataEnvio,
    - lida,
    - wrappedKey (usada na descriptografia),
    - senderPublicKey
    */
    
    for (const msg of mensagens) {
        /*
        Não vou me extender muito mas explicando brevemente a criptografia ela basicamente gera uma chave aleatória de criptografia
        para cada mensagem, criptografa a mensagem e então com a ikPublica do outro usuario que vai receber a mensagem nós criptografamos
        essa chave o usuário recebe a mensagem, usa sua ikPrivada e descriptografa a chave e então usa ela pra descriptografar e 
        ler a mensagem. O usuário também gera uma outra versão dessa chave usando sua própia ikPública para que ele possa ler suas
        própias mensagens.
        */
        // Descriptografando cada mensagem do histórico
        // Importante: Usamos o wrappedKey que o servidor trouxe especificamente para nós
        const textoClaro = await ChatEngine.decryptMessage(msg.content, msg.wrappedKey, msg.iv);
        //renderizarNaTela(msg.idRemetente, textoClaro, msg.dataEnvio); Função exemplo
    }
    messageOffset += 25; // Prepara o próximo scroll
}


// ---------------------------------------------------------
// 3. ENVIANDO MENSAGENS (SOCKET.IO)
// ---------------------------------------------------------

async function botaoEnviar() {
    const texto = document.getElementById('inputMsg').value;
    const chavePublicaDestinatario = "MIIBIjANBgkqhkiG..."; // Buscar a ikPublica da tbEmpresas do parceiro

    // O ChatEngine faz o "trabalho pesado" de criptografar e assinar
    const envelope = await ChatEngine.encryptAndSign(texto, chavePublicaDestinatario);

    const payload = {
        idConversa: 1,
        idRemetente: idUsuarioLogado,
        idDestinatario: idParceiro,
        content: envelope.content,
        iv: envelope.iv,
        signature: envelope.signature,
        keyForSender: envelope.keyForSender,       // Chave para VOCÊ ler depois
        keyForRecipient: envelope.keyForRecipient, // Chave para ELE ler
        senderPublicKey: ChatEngine.myPublicKey   // Sua chave para ele verificar sua assinatura
    };

    ChatEngine.socket.emit("send_message", payload);
}


// ---------------------------------------------------------
// 4. RECEBENDO MENSAGENS E ATUALIZAÇÕES
// ---------------------------------------------------------

// O ChatEngine dispara um evento customizado no window quando algo chega
// Esse evento em específico é para quando você recebe uma mensagem
// Como pode ver esse evento já devolve tudo necessário até a mensagem já descriptografada
window.addEventListener('chat:message', (e) => {
    const { decryptedText, idRemetente } = e.detail;

    console.log("Alguém me enviou:", decryptedText);
    
    renderizarNaTela(idRemetente, decryptedText);
});

// Esse evento é disparado logo após enviar a mensagem, ou ao menos deve ser
// significa que deu tudo certo, o servidor recebeu a mensagem e enviou pro outro usuário
// ai você pode marcar como enviado como no whatsapp por exemplo
window.addEventListener('chat:confirmed', (e) => {
    const { idMensagem } = e.detail;

    console.log("Minha mensagem foi salva no banco e o ID é:", idMensagem);
});

// Listener para quando o parceiro ler suas mensagens
window.addEventListener('chat:read', (e) => {
    const { lastReadId } = e.detail;
    console.log(`O parceiro leu tudo até a mensagem: ${lastReadId}`);
    // Hora de colocar o "check duplo" nas suas mensagens até esse ID
});

// Esse evento acontece quando dá algum erro ao enviar uma mensagem, checa o console do servidor
// que provavelmente vai tar lá
window.addEventListener('chat:error', (e) => {
    const { errorMessage } = e.detail;
    console.log(`Erro ao enviar a mensagem: ${errorMessage}`);
});


// ---------------------------------------------------------
// 5. MARCAR COMO LIDO
// ---------------------------------------------------------
// Chame isso quando o usuário clicar na conversa ou quando chegar msg nova e ele estiver com o chat aberto
function usuarioLendoConversa(idConversa, ultimoIdMensagem, idParceiro) {
    ChatEngine.markConversationAsRead(idConversa, ultimoIdMensagem, idParceiro, idUsuarioLogado);
}

// ---------------------------------------------------------
// RESUMO DE DADOS DO BANCO (SQL)
// ---------------------------------------------------------
/*
   Sempre que precisar de chaves públicas dos outros: 
   SELECT ikPublica FROM tbEmpresas WHERE idEmpresa = X;
*/