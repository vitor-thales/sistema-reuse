import express from 'express';
import path from "path";
import cookieParser from 'cookie-parser';

import { publicDir } from './utils/paths.js';

import loginRoute from "./routes/login.route.js";
import cadastroRoute from "./routes/cadastro.route.js";

const app = express();

app.use(express.json());
app.use(express.static(path.join(publicDir)));
app.use(cookieParser());

app.use("/login", loginRoute);
app.use("/registrar", cadastroRoute);

export default app;