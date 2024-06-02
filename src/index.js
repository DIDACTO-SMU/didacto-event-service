import express from "express";
import { instrument } from "@socket.io/admin-ui"
import { Server } from "socket.io"
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { createAdapter } from "@socket.io/redis-adapter";
import dotenv from 'dotenv';
import {redisInit, pub, sub} from "./redis/redisClient.js";
import { socketOnConnectionHandler } from "./socketio/index.js";


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

var server_port = process.env.SERVER_PORT;

await redisInit();

const server = http.createServer(app);


export let io = new Server(server, {
    adapter: createAdapter(pub, sub),
    cors: {
      origin: "*"
    }
});


instrument(io, {
    auth: false, // 실제 비밀번호를 쓰도록 바꿀 수 있음!
    mode: "development",
});

io.on('connection', socketOnConnectionHandler)

app.use('/admin', express.static(__dirname + '/admin'));
// app.use('/js', express.static(__dirname + '/js'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/admin/admin.html'));
})


server.listen(server_port, () => {
    console.log("Started on : " + server_port);
})
