import { Request, Response, NextFunction } from "express";
import userModel from "../models/User.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/error.util.js";

export interface AuthRequest extends Request {
    user?: any;
};

const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> =>{
    try{
        let token = req.headers.authorization?.split(" ")[1]; // (?.) if authorization is exists, split it and get the token
        if (!token) {
            token = req.cookies?.token;
        }
        if(!token){
            throw new ApiError('Access token is required', 401);
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET!) as any;
        const user = await userModel.findById(decoded.userId).select('-password');
        if(!user || !user.isActive){
            throw new ApiError('Invalid token or user inactive ', 401);
        }
        req.user = user;
        next();
    }catch(err){
        next(new ApiError("Authentication failed", 401));
    }
}

export default authenticate;