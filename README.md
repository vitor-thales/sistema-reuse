# ReUse - Plataforma B2B de Resíduos Eletrônicos

O **ReUse** é uma plataforma B2B (Business to Business) desenvolvida como Trabalho de Conclusão de Curso (TCC) para o curso Técnico em Desenvolvimento de Sistemas do **SENAI**. O sistema visa conectar empresas em todo o Brasil para a negociação segura e eficiente de resíduos eletrônicos, promovendo a economia circular.

---

## 🚀 Tecnologias Utilizadas

O projeto foi construído com uma stack moderna focada em performance e segurança:

* **Front-end:** HTML5, CSS3, TailwindCSS.
* **Back-end:** Node.js, Express, Socket.io (Real-time).
* **Banco de Dados:** MySQL.
* **Segurança:** JSON Web Token (JWT), Criptografia RSA e AES.
* **Serviços Externos:** API Brevo (Envio de e-mails/2FA) e API ViaCEP (Preenchimento automático endereço).

---

## 🛠️ Funcionalidades Principais

1.  **Autenticação Avançada:** Login com JWT e suporte a Autenticação de Dois Fatores (2FA) via e-mail.
2.  **Registro Controlado:** Solicitações de cadastro empresarial que passam por aprovação administrativa.
3.  **Marketplace B2B:** Página principal com filtros avançados e sistema de busca de produtos.
4.  **Mensageria Segura:** Chat em tempo real com criptografia de ponta-a-ponta (E2E) usando RSA e AES.
5.  **Dashboard do Usuário:** Gestão de anúncios com gráficos de vendas e métricas de visualização.
6.  **Painel Administrativo Completo:**
    * Gestão de usuários administrativos e permissões.
    * Controle de categorias e aprovação de novos cadastros.
    * Gráficos analíticos para monitoramento do sistema.
7.  **Privacidade:** Configurações de conta e tratamento de erros customizados (404, 401).

---

## 👥 Contribuições e Divisão de Tarefas

O projeto foi desenvolvido pela dupla **Vitor** e **Thales**.

### **Vitor**
* Arquitetura e estruturação do Banco de Dados (MySQL).
* Sistema de Autenticação (Login, Cadastro e 2FA).
* Desenvolvimento de todo o Painel Administrativo e Sistema de Permissões.
* Implementação do Sistema de Mensagens (Back-end e Criptografia).

### **Thales**
* Desenvolvimento do Marketplace (Página Principal, Filtros e Busca).
* Sistema de Anúncios e integração de gráficos para o usuário.
* Desenvolvimento das Páginas de Configurações e experiência do cliente.
* Interface das páginas institucionais e de erro.

---

## 📂 Estrutura de Pastas

```text
├── public/                 # Arquivos estáticos e client-side
│   ├── components/         # Componentes HTML reutilizáveis
│   ├── fonts/              # Fontes do projeto
│   ├── images/             # Assets de imagem
│   ├── pages/              # Views (HTML)
│   ├── uploads/            # Arquivos públicos enviados
│   ├── scripts/            # Lógica JS do Front-end
│   │   ├── components/
│   │   └── utils/
│   └── styles/             # Estilização (Tailwind/CSS)
├── src/                    # Core do Back-end
│   ├── config/             # Configurações de DB e APIs
│   ├── controllers/        # Regras de negócio
│   ├── middlewares/        # Filtros e segurança (Auth)
│   ├── models/             # Abstração de dados (SQL)
│   ├── private_uploads/    # Arquivos sensíveis
│   ├── routes/             # Definição de rotas da API
│   ├── utils/              # Funções utilitárias e criptografia
│   └── validators/         # Validação de esquemas e dados
├── app.js                  # Configurações do app Express
├── server.js               # Inicialização do servidor e Socket.io
├── .env.example            # Exemplo de variáveis de ambiente
└── db.sql                  # Schema do banco de dados
```
---

## 🔧 Como Rodar o Projeto
1. **Clone o repositório:**
```bash
git clone https://github.com/vitor-thales/sistema-reuse.git
```
2. **Instale as Dependências:**
```bash
npm install
```
3. **Configure o Banco de Dados:**
* Importe o arquivo `db.sql` no seu MySQL.
4. **Variáveis de Ambiente:**
* Renomeie o `.env.example` para `.env` e preencha com suas credenciais (DB, Brevo API, Secret Keys).
5. **Inicie o Servidor:**
```bash
npm start
```

---

### .ENV:

* **PORT:** Porta do servidor
* **DB_HOST:** IP do Banco de Dados
* **DB_USER:** Usuário do Banco de Dados
* **DB_PASS:** Senha do Banco de Dados
* **DB_NAME:** Nome do Banco de Dados
* **JWT_SECRET:** String aleatória (Preferencialmente >64 caracteres)
* **TFAUTH_JWT_SECRET:** String aleatória (Preferencialmente >64 caracteres)
* **TOKEN_EXPIRY:** Tempo em segundos da duração de uma sessão de login
* **SALT:** Valor numérico sado para gerar o hash das senhas (Recomendado >12)
* **SMTP_SERVER:** Servidor do seu serviço smtp
* **SMTP_PORT:** Porta do servidor smtp
* **BREVO_LOGIN:** Login no API da Brevo
* **BREVO_PASS:** Senha no API da Brevo
* **MAIL_SENDER:** E-mail utilizado no sistema
* **MAIL_NAME:** Nome do e-mail utilizado no sistema

---


**Projeto desenvolvido para fins acadêmicos - SENAI 2026.**
