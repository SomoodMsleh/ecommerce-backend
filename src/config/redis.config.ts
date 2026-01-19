import { Redis } from "ioredis";
import logger from "../utils/logger.util.js";

// Create a Redis client (Singleton connection)
const redisClient = new Redis({
    // Redis server host (from environment variables or localhost)
    host: process.env.REDIS_HOST || "127.0.0.1",

    // Redis server port (default: 6379)
    port: parseInt(process.env.REDIS_PORT || "6379", 10),

    // Redis password if authentication is enabled
    password: process.env.REDIS_PASSWORD || undefined,

    // Redis reconnection strategy
    // times => number of reconnection attempts
    retryStrategy: (times: number) => {
        // Increase delay gradually, max 2 seconds
        const delay = Math.min(times * 50, 2000);
        return delay;
    },

    // Delay connection until the first Redis command is executed
    lazyConnect: true,

    // Disable request retry limit (useful for queues and background jobs)
    maxRetriesPerRequest: null,
});

// =======================
// Event Listeners
// =======================

// Triggered when Redis connects successfully
redisClient.on("connect", () => {
    logger.info("🔌 Redis connecting...");
});

redisClient.on("ready", () => {
    logger.info("✅ Redis ready");
});

redisClient.on("error", (err) => {
    logger.warn("⚠️ Redis error:", err.message);
});

redisClient.on("end", () => {
    logger.warn("🔴 Redis connection closed");
});

// =======================
// Graceful Shutdown
// =======================

// Close Redis connection when the app is terminated (Ctrl + C)
process.on("SIGINT", async () => {
    await redisClient.quit();
    logger.info("🛑 Redis connection closed");
    process.exit(0);
});

export default redisClient;
