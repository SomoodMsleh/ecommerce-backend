import ApiError from "../utils/error.util.js";
import { Request, Response,NextFunction ,RequestHandler} from "express";

type asyncRequestHandle= (req:Request, res:Response, next:NextFunction)=> Promise<void | Response>; // Type definition for async request handler 

const asyncHandler = (fun:asyncRequestHandle):RequestHandler =>{
    return (req:Request, res:Response, next:NextFunction):void =>{
        Promise.resolve(fun(req, res, next)).catch((err)=>{
            if (err instanceof ApiError){
                return next(err);
            } // If it's already an ApiError, pass it to the next middleware
            const message = err.message || "Internal Server Error"; 
            const statusCode = err.statusCode || 500;
            return next(new ApiError(message, statusCode)); // wrap non ApiErrors into ApiError
        }); // catching errors from async functions
    }; // Returning a standard RequestHandler
}; // Middleware to handel async errors


export default asyncHandler;