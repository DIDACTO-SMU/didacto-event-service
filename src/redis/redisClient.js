import redis from 'redis'
import dotenv from 'dotenv';

dotenv.config();

// Redis 클라이언트 생성
const redisClient = redis.createClient({ 
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

export const pub = redisClient.duplicate();
export const sub = redisClient.duplicate();


export const redisInit = async () => {
  pub.on('error', (err) => console.error('Redis Pub Client Error', err));
  sub.on('error', (err) => console.error('Redis Sub Client Error', err));
  
  
  await Promise.all([
      redisClient.connect(),
      pub.connect(),
      sub.connect()
  ])
  
  redisClient.flushAll();
}








export default redisClient;