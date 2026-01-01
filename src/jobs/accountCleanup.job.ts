import userModel from "../models/User.model.js";
import logger from "../utils/logger.util.js";
import cron from "node-cron";

export const startAccountCleanupJob = ()=>{
    cron.schedule('0 3 * * *',async()=>{
        try{
            const now = new Date();
            const result = await userModel.deleteMany({
                isActive:false,
                deleteAfter: {$lte:now}
            });
            if(result.deletedCount){
                logger.info(`🗑️ Deleted ${result.deletedCount} inactive accounts`);
            }
        }catch(error){
            logger.error('❌ Account cleanup job failed', error);
        }
    });
    logger.info('⏰ Account cleanup cron job started (03:00 AM daily)');
};

