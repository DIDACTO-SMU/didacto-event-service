const express = require('express');
const SocketIO = require('socket.io');


const app = express();

app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})


var server_port = 5004;
const server = app.listen(server_port, () => {
    console.log("Started on : " + server_port);
})

var io = SocketIO(server, {
    cors: {
      origin: "*"
    }
});


const maxClientsPerMasterRoom = 2;
const maxClientsPerSlaveRoom = 1;
const roomMasterCounts = {}; // 방(Room)별 클라이언트 수를 추적하는 객체
const roomSlaveCounts = {};

io.on('connection', (socket) => {

    socket.on("join-master", (roomId) => {
        // 클라이언트가 방(Room)에 조인하려고 할 때, 클라이언트 수를 확인하고 제한합니다.
        if(roomMasterCounts[roomId] === undefined ){
            roomMasterCounts[roomId] = 1;
        }
        else if (roomMasterCounts[roomId] < maxClientsPerMasterRoom) {
            roomMasterCounts[roomId]++;
            socket.join(roomId);
            console.log("Master joined in a room : " + roomId + " count:" + roomMasterCounts[roomId]);
        } 
        else {
            // 클라이언트 수가 제한을 초과하면 클라이언트를 방(Room)에 입장시키지 않습니다.
            socket.emit('room-full-master', roomId);
            console.log("Master room full : " + roomId + " count : " + roomMasterCounts[roomId]);
        }



        // 클라이언트가 방(Room)을 떠날 때 클라이언트 수를 업데이트합니다.
        socket.on('disconnect', () => {
            roomMasterCounts[roomId]--;
            console.log("master disconnect, count:" + roomMasterCounts[roomId]);
        });
    })

    socket.on("join-slave", (roomId) => {
        if (roomSlaveCounts[roomId] === undefined) {
            roomSlaveCounts[roomId] = 1;
            socket.join(roomId);
            console.log("slave User joined in a room : " + roomId + " count:" + roomSlaveCounts[roomId]);
        } 
        
        // 클라이언트가 방(Room)에 조인하려고 할 때, 클라이언트 수를 확인하고 제한합니다.
        else if (roomSlaveCounts[roomId] < maxClientsPerSlaveRoom) {
            roomSlaveCounts[roomId]++;
            socket.join(roomId);
            console.log("slave User joined in a room : " + roomId + " count:" + roomSlaveCounts[roomId]);
        } 
        else {
            // 클라이언트 수가 제한을 초과하면 클라이언트를 방(Room)에 입장시키지 않습니다.
            socket.emit('room-full-slave', roomId);
            console.log("Slave room full : " + roomId + " count : " + roomSlaveCounts[roomId]);
            return;
        }



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