import {rateLimit} from "express-rate-limit";
import ApiError from "../utils/error.util.js";
import { Request, Response,NextFunction } from "express";
interface RateLimiterOptions {
    windowMs?: number;
    max?: number;
}


const ratelimiter = (options?:RateLimiterOptions)=>{
    return rateLimit({
        windowMs: options?.windowMs || 15*60*1000,
        max:options?.max || 100,      
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req:Request, res:Response, next:NextFunction) => {
            next(new ApiError("Too many requests from this IP, please try again later",429));
        }
    });
}; 

export default ratelimiter;