import app from "./app.js";
import { env } from "./config/env.js";
import http from "http";
import { Server } from "socket.io";
import Websocket from "./controllers/websocket.controller.js";

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => Websocket.init(socket, io));

server.listen(env.PORT, async () => {
    console.log(`[+] Servidor rodando em http://localhost:${env.PORT}`);
});
