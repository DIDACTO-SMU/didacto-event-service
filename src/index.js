import express from "express";
import { instrument } from "@socket.io/admin-ui"
import { Server } from "socket.io"
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


var server_port = 5004;

const server = http.createServer(app);

var io = new Server(server, {
    cors: {
      origin: "*"
    }
});

instrument(io, {
    auth: false, // 실제 비밀번호를 쓰도록 바꿀 수 있음!
    mode: "development",
});

app.use('/admin', express.static(__dirname + '/admin'));
// app.use('/js', express.static(__dirname + '/js'));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/admin/admin.html'));
})




const maxClientsPerMasterRoom = 2;
const maxClientsPerSlaveRoom = 1;
const roomMasterCounts = {}; // 방(Room)별 클라이언트 수를 추적하는 객체
const roomSlaveCounts = {};

io.on('connection', (socket) => {

    socket.on("join-master", (roomId) => {

        socket.join(roomId);
        const roomCount = io.sockets.adapter.rooms.get(roomId)?.size;
        console.log(new Date() + " Master joined in a room : " + roomId + " Count : " + roomCount);
        
        socket.on('disconnect', () => {
            console.log("master disconnect, count:");
        });
    })

    socket.on("join-slave", (roomId) => {

        socket.join(roomId);
        const roomCount = io.sockets.adapter.rooms.get(roomId)?.size;
        console.log(new Date() + " Slave joined in a room : " + roomId + " Count : " + roomCount);

        socket.on('disconnect', () => {
            // roomSlaveCounts[roomId]--;
            console.log("slave disconnect");
        });
    })



    
    socket.on("rtc-message", (data) => {
        var room = JSON.parse(data).roomId;
        socket.broadcast.to(room).emit('rtc-message', data);
    })

    socket.on("remote-event", (data) => {
        var room = JSON.parse(data).roomId;
        socket.broadcast.to(room).emit('remote-event', data);
    })
   
})

server.listen(server_port, () => {
    console.log("Started on : " + server_port);
})

