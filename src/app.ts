import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {} from './routes/index.routes.js';
import {} from './middlewares/error.middleware.js';

const app:Application = express(); 
app.use(helmet()); 
app.use(cors({origin: process.env.CLIENT_URL , credentials: true })); // enable CORS for all origins 
app.use(express.json({limit: '10mb'})); // parse JSON request bodies with a limit of 10mb
app.use(express.urlencoded({ extended:true, limit: '10mb'})); // parse URL-encoded request bodies with a limit of 10mb


export default app;