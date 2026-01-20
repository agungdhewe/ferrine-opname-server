import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

try {
    await redisClient.connect();
    console.log('Redis connected successfully');
} catch (error) {
    console.error('Failed to connect to Redis', error);
}

export default redisClient;
