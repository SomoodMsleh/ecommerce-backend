import {rateLimit} from "express-rate-limit";

const ratelimiter = (options?:{windowMs?:number,max?:number})=>{
    return rateLimit({
        windowMs: options?.windowMs || 15*60*1000,
        max:options?.max || 100,
        message:"Too many requests from this IP, please try again later",       
        standardHeaders: true,
        legacyHeaders: false,
    });
}; 

export default ratelimiter;