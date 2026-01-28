import Queue from "bull";
import logger from "../utils/logger.util.js";
import { sendEmail } from "../services/email.service.js";
import ApiError from "../utils/error.util.js";

// Create queue for email sending
export const emailQueue = new Queue("email", {
    redis:{
        host : process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || "6379", 10), // 10 is radix for decimal
        password: process.env.REDIS_PASSWORD || undefined,
    },
    defaultJobOptions:{
        attempts: 3, // Retry up to 3 times on failure
        backoff:{
            type: "exponential", // Exponential backoff strategy (Exponential delay between retries)
            delay: 2000, // Initial delay of 2 seconds
        },
        removeOnComplete: true, // Remove job from queue on successful completion
        removeOnFail: false, // Retain failed jobs for debugging
    }
});

// Email Queue Processor
emailQueue.process(async (job)=>{
    const { to, subject, html } = job.data;
    if (!to || !subject || !html) {
        throw new ApiError("Invalid email job data", 400);
    }
    await sendEmail({to, subject, html});
});

// Event listeners for logging
emailQueue.on("completed", (job) => {
    logger.info(`📧 Email job ${job.id} completed successfully`);
});
// Error handlers
emailQueue.on("failed", (job, err)=>{
    logger.error(`❌ Email job ${job.id} failed:`, err);
});


