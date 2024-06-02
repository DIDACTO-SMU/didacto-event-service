
import {selectSocketUser, saveSocketUser, removeSocketUser} from "../redis/redisCommand.js"
import { io } from '../index.js';  

export const socketOnConnectionHandler = (socket) => {
    socket.on("join-master", async (roomId) => {

        // Redis에서 이미 접속중인 소켓 확인
        const existUserSocketId = await selectSocketUser(roomId, "master");

        // 현재 소켓과 ID가 다른 이미 Room에 접속중인 소켓이 있으면
        if(existUserSocketId && existUserSocketId != socket.id){
            // 접속중인 클라이언트 소켓에 알려준다.
            await io.to(existUserSocketId).emit('kick', {
                message: "다른 연결이 감지되었습니다. 연결을 해제합니다."
            }); 

            let existSocket = await io.in(existUserSocketId).fetchSockets(); 
            if(existSocket){
                await existSocket[0].leave(roomId); // Room에서 강퇴시킨다.
            }
            
            await removeSocketUser(roomId, "master"); // Redis에서 삭제

            await socket.join(roomId);
            await socket.emit("server-msg", {
                message: "이미 접속중인 다른 연결을 해제하고 접속합니다."
            })
        }
        else{
            await socket.join(roomId);
        }

        if(!existUserSocketId || existUserSocketId != socket.id){
            const result = await saveSocketUser(roomId, "master", socket.id); // Redis에 저장

            //저장 실패 시
            if(!result){ 
                await socket.emit("server-msg", {
                    message: "서버에 문제가 발생했습니다. 연결을 종료합니다."
                })
                await socket.disconnect();
            }
        }
        


        socket.on('disconnect', async () => {
            const existUserSocketId = await selectSocketUser(roomId, "master");
            if(existUserSocketId && existUserSocketId == socket.id){
                await removeSocketUser(roomId, "master");
            }
        });
    })

    socket.on("join-slave", async (roomId) => {

        // Redis에서 이미 접속중인 소켓 확인
        const existUserSocketId = await selectSocketUser(roomId, "slave");

        // 현재 소켓과 ID가 다른 이미 Room에 접속중인 소켓이 있으면
        if(existUserSocketId && existUserSocketId != socket.id){
            await io.to(existUserSocketId).emit('kick', {
                message: "다른 연결이 감지되었습니다. 연결을 해제합니다."
            });  // 접속중인 클라이언트 소켓에 알려준다.

            let existSocket = await io.in(existUserSocketId).fetchSockets(); 
            if(existSocket){
                await existSocket[0].leave(roomId); // Room에서 강퇴시킨다.
            }

            await removeSocketUser(roomId, "slave"); // Redis에서 삭제

            await socket.join(roomId);
            await socket.emit("server-msg", {
                message: "이미 접속중인 다른 연결을 해제하고 접속합니다."
            })
        }
        else{
            await socket.join(roomId);
        }

        if(!existUserSocketId || existUserSocketId != socket.id){
            const result = await saveSocketUser(roomId, "slave", socket.id); // Redis에 저장

            //저장 실패 시
            if(!result){ 
                await socket.emit("server-msg", {
                    message: "서버에 문제가 발생했습니다. 연결을 종료합니다."
                })
                await socket.disconnect();
            }
        }


        socket.on('disconnect', async () => {
            const existUserSocketId = await selectSocketUser(roomId, "slave");
            if(existUserSocketId && existUserSocketId == socket.id){
                await removeSocketUser(roomId, "slave");
            }
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
   
}