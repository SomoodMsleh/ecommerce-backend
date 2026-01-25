import userModel from "../models/User.model.js";
import RefreshTokenModel from "../models/RefreshToken.model.js";
import logger from "../utils/logger.util.js";
import redisClient from "../config/redis.config.js";
import { deleteFromCloudinary } from "../utils/cloudinary.util.js";
import cron from "node-cron";

export const cleanupExpiredAccounts = async (): Promise<void> =>{
    try {
        logger.info("🧹 Starting account cleanup job...");
        const deletionDeadline = new Date(); // current date
        deletionDeadline.setDate(deletionDeadline.getDate() - 30); // 30 days age 
        
        const usersToDelete = await userModel.find({
            isActive: false,
            updatedAt: { $lte: deletionDeadline}
        }).select('_id email avatar');

        if (usersToDelete.length === 0){
            logger.info("✨ No expired accounts to delete");
            return;            
        }

        logger.info(`📋 Found ${usersToDelete.length} accounts to permanently delete`);
        let deletedCount = 0;
        let errorCount = 0;

        for (const user of usersToDelete){
            try{
                const userId = user._id.toString();
                if (user.avatar?.public_id){
                    try{
                        await deleteFromCloudinary(user.avatar.public_id);
                        logger.info(`🗑️  Deleted avatar for user: ${user.email}`);
                    }catch(error){
                        logger.error(`❌ Failed to delete avatar for ${user.email}:`, error);
                    }
                }
                await RefreshTokenModel.deleteMany({user:userId});
                await userModel.findByIdAndDelete(userId);
                await cleanupUserRedisKeys(userId, user.email); 

                logger.info(`✅ Permanently deleted account: ${user.email}`);
                deletedCount++;
            }catch(error){
                errorCount++;
                logger.error(`❌ Failed to delete user ${user.email}:`, error);
            }
        }
        logger.info(`🎉 Account cleanup completed:`);
        logger.info(`✅ Deleted: ${deletedCount}`);
        logger.info(`❌ Errors: ${errorCount}`);

    }catch (error) {
        logger.error("💥 Error in account cleanup job:", error);
    }
};

async function cleanupUserRedisKeys (userId:string, email:string) :Promise<void>{
    try{
        const keysToDelete = [
            `verify_email:${email}`,
            `deleted:${userId}`,
            `failed_login:${email}`,
            `failed_2fa:${userId}`,
            `pwd_change:${userId}`
        ]
        for (const key of keysToDelete){
            try{
                await redisClient.del(key);
            }catch(error){
                logger.debug(`Could not delete Redis key ${key}:`, error);
            }
        }
        logger.debug(`🧹 Cleaned up Redis keys for user: ${email}`);
    }catch(error){
        logger.error(`Failed to cleanup Redis keys for user ${email}:`, error);
    }
}

export const cleanupExpiredRedisData = async ():Promise<void> =>{
    try{
        logger.info("🧹 Starting Redis expired data cleanup...")

        const stats ={
            verificationCodes: 0,
            failedLogins: 0,
            failed2FA: 0,
            passwordChanges: 0,
        }
        try{
            const verifyEmailKeys = await scanKeys("verify_email:*");
            stats.verificationCodes = verifyEmailKeys.length;

            const failedLoginKeys = await scanKeys("failed_login:*");
            stats.failedLogins = failedLoginKeys.length;

            // Failed 2FA attempts
            const failed2FAKeys = await scanKeys("failed_2fa:*");
            stats.failed2FA = failed2FAKeys.length;

            // Password change attempts
            const pwdChangeKeys = await scanKeys("pwd_change:*");
            stats.passwordChanges = pwdChangeKeys.length;

            
            logger.info(`📊 Redis Stats:`);
            logger.info(`   Verification codes: ${stats.verificationCodes}`);
            logger.info(`   Failed logins: ${stats.failedLogins}`);
            logger.info(`   Failed 2FA: ${stats.failed2FA}`);
            logger.info(`   Password changes: ${stats.passwordChanges}`);
        }catch(error){
            logger.error("Failed to get Redis stats:", error);
        }
        logger.info("✅ Redis cleanup check completed");
    }catch(error){
        logger.error("💥 Error in Redis cleanup:", error);
    }
};

async function scanKeys(pattern:string):Promise<string[]>{
    const Keys:string[] = [];
    let cursor = 0;
    do{
        const result = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = parseInt(result[0]);
        Keys.push(...result[1]);
    } while (cursor !== 0);
    return Keys;
}

export const scheduleAccountCleanup = (): void => {
    // Run account deletion every day at 3:00 AM
    cron.schedule("0 3 * * *", async ()=>{
        logger.info("⏰ Running scheduled account cleanup job (03:00 AM)");
        await cleanupExpiredAccounts();
    });

    // Run Redis stats check every 6 hours
    cron.schedule("0 */6 * * *", async ()=>{
        logger.info("⏰ Running Redis cleanup check");
        await cleanupExpiredRedisData();
    });

    logger.info("⏰ Account cleanup cron jobs scheduled:");
    logger.info("   📅 Account deletion: Daily at 03:00 AM");
    logger.info("   📅 Redis stats: Every 6 hours");
};

export const runCleanupOnStartup = (): void => {
    setTimeout(async() =>{
        logger.info("🚀 Running account cleanup on server startup");
        await cleanupExpiredAccounts();
    }, 120000);
};
