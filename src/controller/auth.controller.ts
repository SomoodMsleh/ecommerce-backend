import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response.util.js";
import * as authServices from '../services/auth.service.js';
import {AuthRequest} from "../middlewares/auth.middleware.js"
import ApiError from "../utils/error.util.js";
import { userInfo } from "node:os";



export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body.username || !req.body.firstName || !req.body.lastName || !req.body.password || !req.body.email) {
            throw new ApiError("Missing required fields", 400)
        }
        const result = await authServices.registerUser(req.body);
        successResponse(res, 201, 'Registration successful', result);
    } catch (error) {
        next(error);
    }
};

export const isEmailVerified = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const verificationCode = req.body.verificationCode; 
        if (!verificationCode) {
            throw new ApiError("Verification code is required", 400);
        }
        const result = await authServices.verifyEmail(verificationCode);
        successResponse(res, 200, "Email verified successfully. You can now login.", result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req:Request,res:Response,next:NextFunction) =>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            throw new ApiError("Email and password are required",400);
        }
        const result = await authServices.loginUser(res,email,password);
        successResponse(res, 200, "Logged in successfully", result);
    }catch(error){
        next(error);
    }
};

export const forgetPassword = async (req:Request,res:Response,next:NextFunction) =>{
    try{
        const email = req.body.email;
        if (!email){
            throw new ApiError("Email is required",400);
        }
        const result = await authServices.userForgetPassword(email);
        successResponse(res, 200, "If this email exists in our system, a password reset link has been sent", result);
    }catch(error){
        next(error)
    }
};

export const resetPassword = async (req:Request,res:Response,next:NextFunction)=>{
    try{
        const token = req.params.token;
        const password = req.body.password;
        if (!token || !password) {
            throw new ApiError("Token and password are required", 400);
        }
        const result = await authServices.userResetPassword(token,password);
        successResponse(res, 200, "Password reset successfully", result);
    } catch(error){
        next(error);
    }
}

export const logout = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if (refreshToken){
            await authServices.logoutUser(res, refreshToken);
        }
        successResponse(res, 200, 'Logout successful');
    }catch(error){
        next(error)
    }
};

export const refreshToken = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refreshToken1 = req.cookies?.refreshToken || req.body.refreshToken;
        if (!refreshToken1){
            throw new ApiError("Refresh token is required",400)
        }
        const result = await authServices.refreshAccessToken(res,refreshToken1);
        successResponse(res, 200, 'Token refreshed',result);
    }catch(error){
        next(error)
    }
};

export const enable2FA = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user._id.toString();
        const result = await authServices.enable2FA(userId);
        successResponse(res, 200, '2FA setup initiated',result);
    }catch(error){
        next(error)
    }
};


export const verify2FA =  async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const token = req.body.token;
        if(!token){
            throw new ApiError("2FA token is required",400);
        }
        const userId = req.user._id.toString();
        const result = await authServices.verify2FA(userId,token);
        successResponse(res, 200, '2FA verified successfully',result);
    }catch(error){
        next(error)
    }
};

export const verify2FALogin = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const { userId, token } = req.body;
        if(!token){
            throw new ApiError("2FA token is required",400);
        }
        const result = await authServices.verify2FALogin(res,userId,token);
        successResponse(res, 200, '',result);
    }catch(error){
        next(error)
    }
};