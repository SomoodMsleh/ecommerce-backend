import {Redis} from "ioredis";
import logger from "../utils/logger.util.js";
const redisClient = new Redis({
    host: process.env.REDIS_HOST ?? "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times:number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    lazyConnect: true,
    maxRetriesPerRequest: null,
});
redisClient.on("connect", () => {
    logger.info("✅ Redis connected successfully");
});
redisClient.on("error", (error) => {
    logger.error("❌ Redis connection error:", error);
});
export default redisClient;
