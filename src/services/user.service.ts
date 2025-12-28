import userModel from "../models/User.model.js";
import ApiError from "../utils/error.util.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.util.js";
import logger from "../utils/logger.util.js";
import {uploadToCloudinary,deleteFromCloudinary} from "../utils/cloudinary.util.js";

interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
}

export const getUserProfile = async (userId: string) => {
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    return user;
};

export const updateUserProfile = async (userId: string,updateData:UpdateProfileData) => {
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if(updateData.firstName){
        user.firstName = updateData.firstName;
    }
    if(updateData.lastName){
        user.lastName = updateData.lastName
    }
    if(updateData.phoneNumber){
        user.phoneNumber = updateData.phoneNumber;
    }

    await user.save();
    logger.info(`User profile updated: ${user.email}`);
    return await userModel.findById(userId).select('-password');
};

export const updateUserAvatar = async(userId:string,buffer:Buffer)=>{
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }

    if(user.avatar?.public_id){
        try{
            await deleteFromCloudinary(user.avatar.public_id);
        }catch(error){
            logger.error('Failed to delete old avatar:', error);
        }
    }

    try{
        const {secure_url,public_id} = await uploadToCloudinary(buffer,`${process.env.APP_NAME}/users/avatar/${user._id.toString()}`);
        user.avatar = {secure_url,public_id};
        await user.save();
    }catch(error){
        logger.error('Failed to upload new avatar:', error);
        throw new ApiError("Image upload failed", 500);
    }
    logger.info(`Avatar updated for user: ${user.email}`);
    return {avatar:user.avatar.secure_url};
};

export const deleteUserAvatar = async(userId:string)=>{
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if (!user.avatar) {
        throw new ApiError('No avatar to delete',400);
    }

    if(user.avatar?.public_id){
        try{
            await deleteFromCloudinary(user.avatar.public_id);
        }catch(error){
            logger.error('Failed to delete avatar from cloudinary:', error);
        }
    }
    user.avatar = undefined;
    user.save();
    logger.info(`Avatar deleted for user: ${user.email}`);
    return;
};