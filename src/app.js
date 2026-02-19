import express from 'express';
import path from "path";
import cookieParser from 'cookie-parser';

import loginRoute from "./routes/login.route.js"
import landingPageRoute from "./routes/landingPage.route.js"
import anuncieRoute from "./routes/anuncie.route.js"
import anunciosRouter from "./routes/anuncios.route.js";
import configuracoesRoute from "./routes/configuracoes.route.js";
import logoutRoute from "./routes/logout.route.js";
import detalhesRoute from "./routes/detalhesAnuncio.route.js";
import cadastroRoute from "./routes/cadastro.route.js";
import forgotRoute from "./routes/forgot.route.js";
import adminRoute from "./routes/admin.route.js";
import messagesRoute from "./routes/messages.route.js";
import detalhesEmpresaRoute from "./routes/detalhesEmpresa.route.js";

import { publicDir } from './utils/paths.js';


import errorsController from './controllers/errors.controller.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/styles", express.static(path.join(publicDir , "styles")));
app.use("/fonts", express.static(path.join(publicDir , "fonts")));
app.use("/images", express.static(path.join(publicDir , "images")));
app.use("/scripts", express.static(path.join(publicDir , "scripts")));
app.use("/components", express.static(path.join(publicDir, "components")));
app.use("/uploads", express.static(path.join(publicDir, "uploads")));
app.use("/detalhes-empresa", detalhesEmpresaRoute);
app.use("/", landingPageRoute);
app.use("/auth", logoutRoute);
app.use("/login", loginRoute);
app.use("/anuncie", anuncieRoute);
app.use("/configuracoes", configuracoesRoute);
app.use("/detalhes", detalhesRoute);
app.use("/logout", logoutRoute);
app.use("/registrar", cadastroRoute);
app.use("/recuperar-senha", forgotRoute);
app.use("/admin", adminRoute);
app.use("/mensagens", messagesRoute);
app.use(anunciosRouter);

app.use(errorsController.notFound);
app.use((err, req, res, next) => errorsController.forbidden(err, req, res, next));

export default app;