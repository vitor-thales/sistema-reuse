import app from "./app.js";
import { env } from "./config/env.js";
import bcrypt from "bcryptjs";

app.listen(env.PORT, async () => {
    console.log(`[+] Servidor rodando em http://localhost:${env.PORT}`);
});
