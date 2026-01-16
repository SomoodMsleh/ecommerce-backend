import { rateLimit } from "express-rate-limit";
import redisClient from "../config/redis.config.js";
import { Request, Response} from "express";
import RedisStore from 'rate-limit-redis'

// Interface to customize rate limiter options
interface RateLimiterOptions {
    windowMs?: number; // Time window in milliseconds
    max?: number;      // Maximum number of requests allowed
    message?: string;  // Custom error message
}

// Factory function that returns a rate limiter middleware
const ratelimiter = (options: RateLimiterOptions = {}) => {

    // Default configuration if no options are provided
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100,                // 100 requests per window
        message = "Too many requests, please try again later"
    } = options;

    // Create rate limiter middleware
    return rateLimit({
        windowMs,
        max,

        // Default response message
        message: { success: false, message },

        // Enable standard RateLimit headers (RateLimit-* headers)
        standardHeaders: true,

        // Disable legacy X-RateLimit-* headers
        legacyHeaders: false,

        // Custom handler when the rate limit is exceeded
        handler: (req: Request, res: Response) => {
            res.status(429).json({
                success: false,
                message,
            });
        },

        // =======================
        // Custom Redis Store
        // =======================
        // Use RedisStore for distributed rate limiting
        store: new RedisStore({
            // @ts-expect-error - Redis client compatibility
            client: redisClient,
            prefix: "rl:", // Prefix for Redis keys
        }),
    });
};

export default ratelimiter;
