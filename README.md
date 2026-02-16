# 💬 Módulo de Chat ReUse (E2EE)

Este módulo implementa um sistema de mensagens com **criptografia de ponta-a-ponta (E2EE)**, garantindo que nem mesmo o servidor consiga ler o conteúdo das mensagens.

---

## 📂 Documentação para Integração
Para saber como integrar o front-end (enviar, receber e descriptografar), consulte o arquivo de guia prático que preparei:

👉 **Caminho:** `public/scripts/EXEMPLO.MEDELETA.js`

Neste arquivo você encontrará exemplos de:
- Como inicializar o `ChatEngine`.
- Como ouvir eventos de novas mensagens.
- Como formatar o payload para envio via Socket.

---

## 🏗️ Estrutura Técnica

### 1. Camada de Segurança (`ChatEngine.js`)
* **Criptografia Híbrida:** RSA-OAEP (para chaves) + AES-GCM (para o texto).
* **Assinatura Digital:** RSASSA-PKCS1-v1_5 para garantir a autenticidade do remetente.
* **Proteção XSS:** Sanitização automática de tags HTML antes da criptografia.
* **Persistência:** Recuperação automática de chaves privadas via Cookie/LocalStorage.

### 2. Comunicação em Tempo Real (`WebSocket`)
* **Socket.io:** Gerencia o tráfego instantâneo.
* **Eventos Customizados:** O motor dispara eventos nativos no `window` (`chat:message`, `chat:read`, `chat:confirmed`) para que o front-end reaja sem precisar mexer na lógica de segurança.

### 3. Banco de Dados
* `tbConversas`: Vínculo entre as empresas participantes.
* `tbMensagens`: Armazena o conteúdo criptografado, IV e assinatura.
* `tbMensagensKeys`: Armazena a chave da mensagem trancada individualmente para cada empresa (Multi-recipient E2EE).

---

## ⚠️ Observações Importantes
* **Chaves:** Se o usuário limpar o `localStorage` ou os cookies de `device_secret`, ele perderá o acesso às mensagens antigas (comportamento padrão de segurança E2EE).
* **Participantes:** O servidor valida se os usuários pertencem à conversa antes de processar qualquer mensagem via Socket.
* **Para Testes:** Se quiser usar o sistema de chat você precisa usar um conta que foi cadastrada pelo sistema de cadastro mesmo, se for inserida manualmente NÃO vai funcionar e vai ter vários erros

---
*Desenvolvido para o sistema ReUse - 2026*
