import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import router from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';
import { Request,Response } from 'express';
import cookieParser from 'cookie-parser';
const app:Application = express(); 
app.use(helmet());
app.use(cors({origin: process.env.CLIENT_URL , credentials: true })); // enable CORS for all origins 
app.use(express.json({limit: '10mb'})); // parse JSON request bodies with a limit of 10mb
app.use(express.urlencoded({ extended:true, limit: '10mb'})); // parse URL-encoded request bodies with a limit of 10mb
app.use(cookieParser()); 
app.use('/api/v1',router);
app.get('/health', (req:Request,res:Response)=>{
    res.status(200).json({status:'OK', timeStamp: new Date().toISOString()}); // Health check endpoint 
}) 
app.use(errorHandler); // Global Error Handling Middleware
export default app;