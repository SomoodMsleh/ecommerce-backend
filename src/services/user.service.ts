import userModel from "../models/User.model.js";
import ApiError from "../utils/error.util.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.util.js";
import logger from "../utils/logger.util.js";

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

