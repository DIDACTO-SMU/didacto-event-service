
import {selectSocketUser, saveSocketUser, removeSocketUser} from "../redis/redisCommand.js"
import { io } from '../index.js';  
import SocketEventType from './enum.js'

export const socketOnConnectionHandler = (socket) => {
    socket.on(SocketEventType.JOIN_MASTER, async (roomId) => {

        // Redis에서 이미 접속중인 소켓 확인
        const existUserSocketId = await selectSocketUser(roomId, "master");

        // 현재 소켓과 ID가 다른 이미 Room에 접속중인 소켓이 있으면
        if(existUserSocketId && existUserSocketId != socket.id){
            // 접속중인 클라이언트 소켓에 알려준다.
            await io.to(existUserSocketId).emit(SocketEventType.FORCE_KICK, JSON.stringify({
                message: "다른 연결이 감지되었습니다. 연결을 해제합니다."
            })); 

            let existSocket = await io.in(existUserSocketId).fetchSockets(); 
            if(existSocket && existSocket[0]){
                await existSocket[0].leave(roomId); // Room에서 강퇴시킨다.
            }
            
            await removeSocketUser(roomId, "master"); // Redis에서 삭제

            // await socket.join(roomId);
            await socket.emit(SocketEventType.SYSTEM_MESSAGE, JSON.stringify({
                message: "이미 접속중인 다른 연결을 해제하고 접속합니다."
            }))
        }
        else{
            // await socket.join(roomId);
        }
        

        // 학생이 연결 상태인지 확인 (학생 선접속)
        const existSlaveSocketId = await selectSocketUser(roomId, "slave");
        if(!existSlaveSocketId){
            await socket.emit("slave-disconnect", JSON.stringify({
                message: "해당 학생이 연결되지 않은 상태입니다. 연결을 종료합니다."
            }))
            await socket.leave(roomId);
            await removeSocketUser(roomId, "master")
            return;
        }



        if(!existUserSocketId || existUserSocketId != socket.id){
            const result = await saveSocketUser(roomId, "master", socket.id); // Redis에 저장
            //저장 실패 시
            if(!result){ 
                await socket.emit(SocketEventType.SYSTEM_MESSAGE, JSON.stringify({
                    message: "서버에 문제가 발생했습니다. 연결을 종료합니다."
                }))
                await socket.leave(roomId);
                await removeSocketUser(roomId, "master")
            }
            else{
                await socket.join(roomId)
                await socket.emit(SocketEventType.SYSTEM_MESSAGE, JSON.stringify({
                    message: `Room ${roomId} 접속 완료`
                }))
            }
        }
        

        socket.on('disconnect', async () => {
            const exist = await selectSocketUser(roomId, "master");
            if(exist && socket.id == exist){
                await removeSocketUser(roomId, "master")
            }
        });
    })

    socket.on(SocketEventType.JOIN_SLAVE, async (roomId) => {

        // Redis에서 이미 접속중인 소켓 확인
        const existUserSocketId = await selectSocketUser(roomId, "slave");

        // 현재 소켓과 ID가 다른 이미 Room에 접속중인 소켓이 있으면
        if(existUserSocketId && existUserSocketId != socket.id){
            await io.to(existUserSocketId).emit(SocketEventType.FORCE_KICK, JSON.stringify({
                message: "다른 연결이 감지되었습니다. 연결을 해제합니다."
            }));  // 접속중인 클라이언트 소켓에 알려준다.

            let existSocket = await io.in(existUserSocketId).fetchSockets(); 
            if(existSocket && existSocket[0]){
                await existSocket[0].leave(roomId); // Room에서 강퇴시킨다.
            }

            await removeSocketUser(roomId, "slave"); // Redis에서 삭제

            // await socket.join(roomId);
            await socket.emit(SocketEventType.SYSTEM_MESSAGE, JSON.stringify({
                message: "이미 접속중인 다른 연결을 해제하고 접속합니다."
            }))
        }
        else{
            // await socket.join(roomId);
        }
        await socket.emit(SocketEventType.SYSTEM_MESSAGE, JSON.stringify({
            message: `Room ${roomId} 접속 완료`
        }))

        if(!existUserSocketId || existUserSocketId != socket.id){
            const result = await saveSocketUser(roomId, "slave", socket.id); // Redis에 저장
            await socket.join(roomId);

            //저장 실패 시
            if(!result){ 
                await socket.emit(SocketEventType.SYSTEM_MESSAGE, JSON.stringify({
                    message: "서버에 문제가 발생했습니다. 연결을 종료합니다."
                }))
                await socket.leave(roomId);
                await removeSocketUser(roomId, "slave")
            }
        }


        socket.on('disconnect', async () => {
            const exist = await selectSocketUser(roomId, "slave");
            if(exist && socket.id == exist){
                await removeSocketUser(roomId, "slave")
            }
            await socket.broadcast.to(roomId).emit(SocketEventType.SLAVE_DISCONN, JSON.stringify({
                message: "학생의 연결이 끊겼습니다."
            }));
        });
    })


    socket.on(SocketEventType.RTC_MESSAGE, (data) => {
        var room = JSON.parse(data).roomId;
        socket.broadcast.to(room).emit(SocketEventType.RTC_MESSAGE, data);
    })

    socket.on(SocketEventType.REMOTE_EVENT, (data) => {
        var room = JSON.parse(data).roomId;
        socket.broadcast.to(room).emit(SocketEventType.REMOTE_EVENT, data);
    })



}
