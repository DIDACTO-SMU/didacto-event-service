

import redisClient from "./redisClient.js";

const socket_session_dbname = "connected_sockets";

export const selectSocketUser = async (roomId, type) => {
    try{
        const user = await redisClient.hGet(`${socket_session_dbname}/${roomId}`, type);
        if(!user){
            return null;
        }
        else{
            return user;
        }
    }
    catch(e){
        console.error('Error Select socket ID in Redis:', e);
    }
    
}

export const saveSocketUser = async (roomId, type, id) => {
    try{
        const result = await redisClient.hSetNX(`${socket_session_dbname}/${roomId}`, type, id);
        return result;
    }
    catch(e){
        console.error('Error storing socket ID in Redis:', e);
    }
}

export const removeSocketUser = async (roomId, type, id) => {
    try{
        const result =  await redisClient.hDel(`${socket_session_dbname}/${roomId}`, type);
        return result;
    }
    catch(e){
        console.error('Error delete socket ID in Redis:', e);
    }
    
}