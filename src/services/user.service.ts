import userModel from "../models/User.model.js";
import RefreshTokenModel from "../models/RefreshToken.model.js";
import ApiError from "../utils/error.util.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.util.js";
import logger from "../utils/logger.util.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.util.js";
import speakeasy from "speakeasy";
import { sendEmail } from "./email.service.js";
import {accountRestoreRequestTemplate,accountRestoreSuccessTemplate} from "../emailTemplates/accountRestoreTemplate.js"
import crypto from "node:crypto";
import {clearAuthCookies , generateRefreshToken} from "../utils/jwt.util.js";
import { Response } from "express";
import * as redisHelper from "../utils/redis.helper.js"

const ACCOUNT_RESTORE_TOKEN_SIZE = 32;
const ACCOUNT_RESTORE_EXPIRY_DAYS = 30;
const MIN_PASSWORD_LENGTH = 6;
interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
}

interface AddressData {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
};


export const getUserProfile = async (userId: string) => {
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    return user;
};

export const updateUserProfile = async (userId: string, updateData: UpdateProfileData) => {
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    // Validate phone number format if provided
    if (updateData.phoneNumber && updateData.phoneNumber.trim()) {
        const phoneRegex = /^\+?[\d\s\-()]+$/;
        if (!phoneRegex.test(updateData.phoneNumber)) {
            throw new ApiError("Invalid phone number format", 400);
        }
    }

    // Validate name fields
    if (updateData.firstName && updateData.firstName.trim().length < 1) {
        throw new ApiError("First name cannot be empty", 400);
    }
    if (updateData.lastName && updateData.lastName.trim().length < 1) {
        throw new ApiError("Last name cannot be empty", 400);
    }

    if (updateData.firstName) {
        user.firstName = updateData.firstName.trim();
    }
    if (updateData.lastName) {
        user.lastName = updateData.lastName.trim();
    }
    if (updateData.phoneNumber) {
        user.phoneNumber = updateData.phoneNumber.trim();
    }
    user.updatedAt = new Date();
    await user.save();
    logger.info(`User profile updated: ${user.email}`);
    return await userModel.findById(userId).select('-password');
};

export const updateUserAvatar = async (userId: string, buffer: Buffer) => {
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }

    if (user.avatar?.public_id) {
        try {
            await deleteFromCloudinary(user.avatar.public_id);
        } catch (error) {
            logger.error('Failed to delete old avatar:', error);
        }
    }

    try {
        const { secure_url, public_id } = await uploadToCloudinary(buffer, `${process.env.APP_NAME}/users/avatar/${user._id.toString()}`);
        user.avatar = { secure_url, public_id };
        user.updatedAt = new Date();
        await user.save();
        logger.info(`Avatar updated for user: ${user.email}`);
        return { avatar: user.avatar.secure_url };
    } catch (error) {
        logger.error('Failed to upload new avatar:', error);
        throw new ApiError("Image upload failed", 500);
    }
};

export const deleteUserAvatar = async (userId: string) => {
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    if (!user.avatar) {
        throw new ApiError('No avatar to delete', 400);
    }

    if (user.avatar?.public_id) {
        try {
            await deleteFromCloudinary(user.avatar.public_id);
        } catch (error) {
            logger.error('Failed to delete avatar from cloudinary:', error);
        }
    }
    user.avatar = undefined;
    user.updatedAt = new Date();
    await user.save();
    logger.info(`Avatar deleted for user: ${user.email}`);
    return;
};


export const getUserAddresses = async (userId: string) => {
    const user = await userModel.findById(userId).select('addresses');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    return user.addresses || [];
};


export const addUserAddresses = async (userId: string, addressData: AddressData) => {
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }

    user.addresses ??= [];
    if (addressData.isDefault) {
        user.addresses.forEach((addr) => {
            addr.isDefault = false;
        });
    }

    if (user.addresses.length == 0) {
        addressData.isDefault = true;
    }
    user.addresses.push(addressData);
    user.updatedAt = new Date();
    await user.save();
    logger.info(`Address added for user: ${user.email}`);
    return user.addresses[user.addresses.length - 1];
};

export const updateUserAddresses = async (userId: string, addressId: string, updateData: Partial<AddressData>) => {
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    if (!user.addresses || user.addresses.length === 0) {
        throw new ApiError("No addresses found", 404);
    }
    const address = user.addresses.id(addressId);
    if (!address) {
        throw new ApiError("Address not found", 404);
    }
    // Validate updated fields if provided
    if (updateData.street !== undefined && !updateData.street?.trim()) {
        throw new ApiError("Street cannot be empty", 400);
    }
    if (updateData.city !== undefined && !updateData.city?.trim()) {
        throw new ApiError("City cannot be empty", 400);
    }
    if (updateData.state !== undefined && !updateData.state?.trim()) {
        throw new ApiError("State cannot be empty", 400);
    }
    if (updateData.zipCode !== undefined && !updateData.zipCode?.trim()) {
        throw new ApiError("Zip code cannot be empty", 400);
    }
    if (updateData.country !== undefined && !updateData.country?.trim()) {
        throw new ApiError("Country cannot be empty", 400);
    }
    if (updateData.isDefault) {
        user.addresses.forEach((add) => {
            add.isDefault = false;
        });
    }
    console.log(address)
    Object.assign(address, updateData);
    user.updatedAt = new Date();
    await user.save();
    logger.info(`Address updated for user: ${user.email}`);
    return address;
};

export const deleteUserAddresses = async (userId: string, addressId: string) => {
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
        throw new ApiError("User not found", 404)
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    if (!user.addresses || user.addresses.length === 0) {
        throw new ApiError("No addresses found", 404);
    }
    const address = user.addresses.id(addressId);
    if (!address) {
        throw new ApiError("Address not found", 404);
    }
    const wasDefault = address.isDefault;
    user.addresses.pull({ _id: addressId });
    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }
    user.updatedAt = new Date();
    await user.save();
    logger.info(`Address deleted for user: ${user.email}`);
    return;
};

export const changeUserPassword = async (res:Response,userId: string, newPassword: string, currentPassword?: string, otp?: string) => {
    // Check rate limiting first
    await redisHelper.checkPasswordChangeAttempts(userId);
    const user = await userModel.findById(userId).select('+password');
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }

    const hasPassword = Boolean(user.password);
    if (user.isTwoFactorEnabled){
        if(!otp){
            await redisHelper.recordPasswordChangeAttempt(userId);
            throw new ApiError("OTP is required",400)
        }
        await redisHelper.checkFailed2FAAttempts(userId);
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: 'base32',
            token: otp,
            window: 2
        })
        if (!verified){
            await redisHelper.recordFailed2FAAttempt(userId);
            await redisHelper.recordPasswordChangeAttempt(userId);
            throw new ApiError("Invalid OTP",401);
        }
        await redisHelper.clearFailed2FAAttempts(userId);
    }

    if(hasPassword){
        if(!currentPassword){
            await redisHelper.recordPasswordChangeAttempt(userId);
            throw new ApiError("Current password is required", 400);
        }
        const isPasswordValid = await comparePassword(currentPassword,user.password);
        if(!isPasswordValid){
            await redisHelper.recordPasswordChangeAttempt(userId);
            throw new ApiError("Current password is incorrect", 401);
        }
        const same = await comparePassword(newPassword,user.password);
        if(same){
            throw new ApiError("New password must be different", 400);
        }
    }
    // Validate new password strength
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new ApiError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
    }
    user.password = await hashPassword(newPassword!);
    user.updatedAt = new Date();
    await user.save()
    await RefreshTokenModel.deleteMany({ user: userId });
    await generateRefreshToken(res, user._id.toString());
    await redisHelper.clearPasswordChangeAttempts(userId);
    logger.info(`Password changed for user: ${user.email}`);
    return;
};

export const deleteUserAccount = async (res:Response,userId: string, password?: string, otp?: string) => {
    const user = await userModel.findById(userId).select('+password');
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    if (!user.isActive) {
        throw new ApiError("Account is already deactivated", 400);
    }
    const hasPassword = Boolean(user.password);
    if (user.isTwoFactorEnabled){
        if(!otp){
            throw new ApiError("OTP is required",400)
        }
        await redisHelper.checkFailed2FAAttempts(userId);
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret!,
            encoding: 'base32',
            token: otp,
            window: 2})
        if (!verified){
            await redisHelper.recordFailed2FAAttempt(userId);
            throw new ApiError("Invalid OTP",401);
        }
        await redisHelper.clearFailed2FAAttempts(userId);
    }

    if(hasPassword){
        if(!password){
            throw new ApiError("Password is required", 400);
        }
        const isPasswordValid = await comparePassword(password,user.password);
        if(!isPasswordValid){
            throw new ApiError("Current password is incorrect", 401);
        }
    }
    const restoreToken = crypto.randomBytes(ACCOUNT_RESTORE_TOKEN_SIZE).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(restoreToken).digest('hex');
    const now = new Date();
    const deleteAfter = new Date(now.getTime() + ACCOUNT_RESTORE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Store restore token and deletion data in Redis
    await redisHelper.setAccountRestoreToken(userId, hashedToken, deleteAfter);
    await redisHelper.setAccountDeletionData(userId, now, deleteAfter);


    user.isActive = false;
    user.updatedAt = new Date();
    await user.save();
    await RefreshTokenModel.deleteMany({ user: userId });
    
    const restoreLink = `${process.env.CLIENT_URL}/api/v1/users/account/restore/${restoreToken}`;
    const subject = "Restore your account";
    const html = accountRestoreRequestTemplate.replace('{restoreURL}',restoreLink);
    try {
        await sendEmail({ to: user.email, subject, html });
    } catch (error) {
        logger.error('Failed to send account restore email:', error);
        // Don't fail the deletion if email fails
    }
    logger.info(`Account deleted for user: ${user.email}`);
    clearAuthCookies(res)
    return;
};

export const restoreUserAccount = async(token:string) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const restoreData = await redisHelper.getAccountRestoreData(hashedToken);
    if (!restoreData) {
        throw new ApiError("Restore token is invalid or expired", 400);
    }

    const user = await userModel.findById(restoreData.userId);

    if (!user) {
        throw new ApiError("Restore token is invalid or expired", 400);
    }
    if (user.isActive) {
        throw new ApiError("Account is already active", 400);
    }

    user.isActive = true;
    user.updatedAt = new Date();
    await user.save();

    // Delete restore token and deletion data from Redis
    await redisHelper.deleteAccountRestoreToken(hashedToken);
    await redisHelper.deleteAccountDeletionData(restoreData.userId);

    const subject = "Account restored successfully";
    const loginUrl = `${process.env.CLIENT_URL}/api/v1/auth/login`;
    const html = accountRestoreSuccessTemplate.replace('{loginURL}', loginUrl);
    try {
        await sendEmail({ to: user.email, subject, html });
    } catch (error) {
        logger.error('Failed to send account restore confirmation email:', error);
        // Don't fail the restore if email fails
    }
    logger.info(`Account restored for user: ${user.email}`);
    return;
};