import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import logger from './utils/logger.util.js';
import connectDB from './config/database.config.js';
const PORT = process.env.PORT || 3000;
const startServer  = async():Promise<void> => {
    try{
        await connectDB(); 
        app.listen(PORT,()=>{
            logger.info(`🚀 server is running on http://localhost:${PORT} ....`);
            logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
        });
    } catch(error){
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

process.on('unhandledRejection',(reason:any)=>{
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
}); // to handle promise rejections

process.on('uncaughtException',(error:Error)=>{
    logger.error('Uncaught Exception:', error);
    process.exit(1);
}); // to handle unexpected errors