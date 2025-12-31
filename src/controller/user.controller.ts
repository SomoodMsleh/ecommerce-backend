import { Request,Response,NextFunction } from "express";
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

export const getAddresses = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user._id.toString();
        const addresses = await userService.getUserAddresses(userId);
        successResponse(res,200,'Addresses retrieved successfully', addresses);
    }catch(error){
        next(error);
    }
};

export const addAddresses = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const address = req.body.address;
        if(!address){
            throw new ApiError("Address data is required",400)
        }
        const userId = req.user._id.toString();
        const result = await userService.addUserAddresses(userId,address);
        successResponse(res,200,'Address retrieved successfully', result);
    }catch(error){
        next(error);
    }
};

export const updateAddress = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const address = req.body.address;
        if(!address){
            throw new ApiError("Address update data is required",400)
        }
        const userId = req.user._id.toString();
        const addressId = req.params.addressId;
        const result = await userService.updateUserAddresses(userId,addressId,address);
        successResponse(res,200,'Address updated successfully', result);
    }catch(error){
        next(error);
    }
};

export const deleteAddress =  async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const userId = req.user._id.toString();
        const addressId = req.params.addressId;
        await userService.deleteUserAddresses(userId,addressId);
        successResponse(res,200,'Address deleted successfully');
    }catch(error){
        next(error);
    }
};

export const changePassword =  async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const {currentPassword,otp,newPassword} = req.body;
        if (!newPassword) {
            throw new ApiError("New password is required", 400);
        }
        const userId = req.user._id.toString();
        await userService.changeUserPassword(userId,newPassword,currentPassword,otp);
        successResponse(res, 200, 'Password changed successfully');
    }catch(error){
        next(error);
    }
};


export const deleteAccount = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try{
        const {password,otp} = req.body;
        const userId = req.user._id.toString();
        await userService.deleteUserAccount(res,userId,password,otp);
        successResponse(res, 200, 'Account deleted successfully');
    }catch(error){
        next(error);
    }
};

export const restoreAccount = async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const { restoreToken } = req.params;
        if (!restoreToken) {
            throw new ApiError("Restore token is required", 400);
        }
        await userService.restoreUserAccount(restoreToken);
        successResponse(res, 200, "Account restored successfully");
    }catch(error){
        next(error);
    }
};