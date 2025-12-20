import ApiError from "../utils/error.util.js";
import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.util.js";

const errorHandler = async(err: Error, req: Request, res: Response, next: NextFunction): Promise<void> =>{
    if (err instanceof ApiError){
        res.status(err.statusCode).json({
            success: false,
            message : err.message
        }); 
        return;
    } // Handling custom ApiError
    logger.error('Unhandled Error:', err); 
    res.status(500).json({
        success:false,
        message : 'Internal Server Error'
    }); // Handling generic errors
}; //Global Error Handling Middleware

export default errorHandler;
