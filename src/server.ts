import express from 'express';
import dotenv from 'dotenv';
import logger from './utils/logger.util.js';
dotenv.config();
const app = express();
app.get('/',(req,res)=>{
    res.json({message: "Hello, world!"});
});
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    logger.info(`🚀 server is running on http://localhost:${PORT} ....`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
})