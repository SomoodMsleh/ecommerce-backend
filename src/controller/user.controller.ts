import { Response,NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { successResponse } from "../utils/response.util.js";
import ApiError from "../utils/error.util.js";
import * as userService from "../services/user.service.js";



export const getProfile = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user._id.toString();
        const result = await userService.getUserProfile(userId);
        successResponse(res,200,"Profile retrieved successfully",result);
    }catch(error){
        next(error);
    }
};

export const updateProfile = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const {firstName,lastName,phoneNumber} = req.body;
        const userId = req.user._id.toString();
        const result = await userService.updateUserProfile(userId,{firstName,lastName,phoneNumber});
        successResponse(res,200,"Profile updated successfully",result);
    }catch(error){
        next(error);
    }
};


export const uploadAvatar = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        if(!req.file){
            throw new ApiError("No file uploaded",400)
        }
        const userId = req.user._id.toString();
        const result = await userService.updateUserAvatar(userId,req.file.buffer);
        successResponse(res,200,"Avatar uploaded successfully",result);
    }catch(error){
        next(error);
    }
};

export const deleteAvatar = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user._id.toString();
        await userService.deleteUserAvatar(userId);
        successResponse(res,200,"Avatar delete successfully");
    }catch(error){
        next(error);
    }
};