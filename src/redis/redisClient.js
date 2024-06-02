import redis from 'redis'

const redisClient = redis.createClient({
  socket: {
    port: 6391,
    host: "localhost"
  }
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
  redisInit();
});

redisClient.on('error', (err) => {
  console.error('Redis error: ', err);
});



export const setKey = (key, value) => {
    return new Promise((resolve, reject) => {
        redisClient.set(key, value, (err, reply) => {
          if (err) {
            return reject(err);
          }
          resolve(reply);
        });
      });
}


export const getKey = (key) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, reply) => {
          if (err) {
            return reject(err);
          }
          resolve(reply);
        });
      });
}

export const deleteKey = async (key, value) => {
  await redisClient.del(key);
}

// Redis 내부를 모두 초기화하는 함수
export const redisInit = async () => {
    redisClient.flushAll();
};


export default redisClient;