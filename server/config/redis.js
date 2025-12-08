// import { Redis } from "@upstash/redis";

// export const redisClient = new Redis({
//     url: process.env.UPSTASH_REDIS_REST_URL,
//     token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// Use dynamic import() for ES module package
let redisClient;

async function createRedisClient() {
    const { Redis } = await import("@upstash/redis");
    return new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

// Create and export the client
redisClient = createRedisClient();

module.exports = { redisClient };
