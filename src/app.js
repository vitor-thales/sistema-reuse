import express from 'express';
import path from "path";
import { publicDir } from './utils/paths.js';
import loginRoute from "./routes/login.route.js"
import landingPageRoute from "./routes/landingPage.route.js"
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(express.static(path.join(publicDir)));
app.use(cookieParser());

app.use("/login", loginRoute);
app.use("/", landingPageRoute);

export default app;