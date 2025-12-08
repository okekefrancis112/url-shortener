// const Redis = require("ioredis");
// const dotenv = require("dotenv");
// dotenv.config();

// const redisClient = new Redis(process.env.REDIS_URL);

// module.exports = redisClient;

import { Redis } from "@upstash/redis";

export const redisClient = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
