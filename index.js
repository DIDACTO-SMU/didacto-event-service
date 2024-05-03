const express = require('express');
const SocketIO = require('socket.io');


const app = express();

app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})


var server_port = 5004;
const server = app.listen(server_port, () => {
    console.log("Started on : "+ server_port);
})

var io = SocketIO(server, {
    cors: {
      origin: "*"
    }
});


const maxClientsPerRoom = 1;
const roomMasterCounts = {}; // 방(Room)별 클라이언트 수를 추적하는 객체
const roomSlaveCounts = {};
const roomCounts = {};

io.on('connection', (socket) => {

    socket.on("join-master", (roomId) => {
        // 클라이언트가 방(Room)에 조인하려고 할 때, 클라이언트 수를 확인하고 제한합니다.
        if (roomMasterCounts[roomId] === undefined || roomMasterCounts[roomId] < maxClientsPerRoom) {
            roomMasterCounts[roomId] = 1;
        } 
        else {
            // 클라이언트 수가 제한을 초과하면 클라이언트를 방(Room)에 입장시키지 않습니다.
            socket.broadcast.to(roomId).emit('room-full-master', roomId);
            console.log("room full master" + roomMasterCounts[roomId]);
            return;
        }
        socket.join(roomId);
        console.log("User joined in a room : " + roomId + " count:" + roomMasterCounts[roomId]);


        // 클라이언트가 방(Room)을 떠날 때 클라이언트 수를 업데이트합니다.
        socket.on('disconnect', () => {
            roomMasterCounts[roomId]--;
            console.log("master disconnect, count:" + roomMasterCounts[roomId]);
        });
    })

    socket.on("join-slave", (roomId) => {
        
        // 클라이언트가 방(Room)에 조인하려고 할 때, 클라이언트 수를 확인하고 제한합니다.
        if (roomSlaveCounts[roomId] === undefined || roomSlaveCounts[roomId] < maxClientsPerRoom) {
            roomSlaveCounts[roomId] = 1;
        } 
        else {
            // 클라이언트 수가 제한을 초과하면 클라이언트를 방(Room)에 입장시키지 않습니다.
            socket.broadcast.to(roomId).emit('room-full-slave', roomId);
            console.log("room full slave" + roomSlaveCounts[roomId]);
            return;
        }
        socket.join(roomId);
        console.log("slave User joined in a room : " + roomId + " count:" + roomSlaveCounts[roomId]);


        // 클라이언트가 방(Room)을 떠날 때 클라이언트 수를 업데이트합니다.
        socket.on('disconnect', () => {
            roomSlaveCounts[roomId]--;
            console.log("slave disconnect, count:" + roomSlaveCounts[roomId]);
        });
    })



    socket.on("rtc-message", (data) => {
        var room = JSON.parse(data).roomId;
        console.log(JSON.parse(data).event);
        socket.broadcast.to(room).emit('rtc-message', data);
    })

    socket.on("remote-event", (data) => {
        var room = JSON.parse(data).roomId;
        console.log(JSON.parse(data).event);
        socket.broadcast.to(room).emit('remote-event', data);
    })
   
})