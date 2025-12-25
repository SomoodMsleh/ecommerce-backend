import { AuthRequest } from "./auth.middleware.js";
import { Response,NextFunction } from "express";
import ApiError from "../utils/error.util.js";

const authorize = (...roles: string[])=>{
    return (req:AuthRequest,res:Response,next:NextFunction):void=>{
        if (!req.user) {
            throw new ApiError('Unauthorized',401);
        }
        if(!roles.includes(req.user.role)){
            throw new ApiError('Access denied. Insufficient permissions',403);
        }
        next()
    }
};

export default authorize;