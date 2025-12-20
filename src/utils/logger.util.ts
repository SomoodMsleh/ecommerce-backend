import winston from 'winston';
import {fileURLToPath} from 'url';
import { dirname , join } from  'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({format:'YYYY-MMDD HH:mm:ss'}),
        winston.format.errors({stack : true}),
        winston.format.splat(),
        winston.format.json()
    ),
    transports:[
        new winston.transports.File({
            filename: join(__dirname, '../../logs/error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: join(__dirname, '../../logs/combined.log')
        })
    ]
});

if (process.env.NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format:winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }))
}


export default logger;
