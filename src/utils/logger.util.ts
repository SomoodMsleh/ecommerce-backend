import winston from 'winston';
import {fileURLToPath} from 'url';
import { dirname , join } from  'path';

const __filename = fileURLToPath(import.meta.url); // get current file path
const __dirname = dirname(__filename); // get current directory path

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // set log level based on environment 
    format: winston.format.combine(
        winston.format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}), 
        winston.format.errors({stack : true}), // log error stack trace
        winston.format.splat(), // string interpolation
        winston.format.json()
    ), // log format
    transports:[
        new winston.transports.File({
            filename: join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: join(__dirname, '../../logs/combined.log')
        }) // all logs
    ] // log to files
}); // logger configuration


if (process.env.NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format:winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    })) // log to console in non-production
}


export default logger;
