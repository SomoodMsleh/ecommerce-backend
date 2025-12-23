import userModel from "../models/User.model.js";
import { sendEmail } from "./email.service.js";
import {hashPassword ,comparePassword} from "../utils/bcrypt.util.js";
import { generateToken, generateRefreshToken, clearAuthCookies } from "../utils/jwt.util.js";
import ApiError from "../utils/error.util.js";
import {customAlphabet} from 'nanoid';
import { verificationEmailTemplate , welcomeEmailTemplate} from "../emailTemplates/verificationEmailTemplate.js";
import { Response } from "express";
import crypto from "node:crypto";
import {passwordResetRequestTemplate} from "../emailTemplates/passwordResetRequestTemplate.js";
import RefreshTokenModel from "../models/RefreshToken.model.js";
const VERIFICATION_CODE_LENGTH = 8;
const VERIFICATION_CODE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour
const PASSWORD_RESET_TOKEN_SIZE = 20;


const generateVerificationCode = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    VERIFICATION_CODE_LENGTH
)

interface RegisterUserInput {
    username: string,
    email: string,
    password :string,
    firstName :string,
    lastName :string,
    phoneNumber ?: string,
}


export const registerUser = async(userData:RegisterUserInput)=>{
    const existingUser = await userModel.findOne({$or: [
        { username: userData.username },
        { email: userData.email }
    ]});
    
    if (existingUser) {
        throw new ApiError('Username or email already exists', 409)
    }
    if (userData.password.length < 6) {
        throw new ApiError("Password must be at least 6 characters",400);
	}
    const hashedPassword = await hashPassword(userData.password);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = Date.now() + VERIFICATION_CODE_EXPIRY;
    userData.password = hashedPassword;
    const user = await userModel.create({...userData,verificationCode,verificationCodeExpiresAt});
    const html = verificationEmailTemplate.replace("{verificationCode}",verificationCode );
    await sendEmail({to:user.email,subject:'Verify your email',html});
    return {
        user:{
            id: user._id,
            username:user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
    };
};


export const verifyEmail = async(verificationCode:string)=>{
    const user = await userModel.findOne({verificationCode,verificationCodeExpiresAt:{$gt:Date.now()}});
    if(!user){
        throw new ApiError("Invalid or expired verification code",400);
    }
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;

    await user.save();

    const subject = `Welcome to ${process.env.APP_NAME} - Email Verified Successfully`;
    const html =  welcomeEmailTemplate(user.username);
    await sendEmail({to:user.email,subject,html});

    return {
        user:{
            username:user.username,
            email : user.email,
            isEmailVerified: user.isEmailVerified
    }}
};

export const loginUser = async(res:Response ,email:string,password:string)=>{
    const user = await userModel.findOne({email}).select('+password');
    if (!user){
        throw new ApiError("Invalid credentials",401);
    }
    if(!user.isActive){
        throw new ApiError("Account is disabled",403);
    }
    if(!user.isEmailVerified){
        throw new ApiError("Plz confirm your email",400);
    }
    const isPasswordValid = await comparePassword(password,user.password);
    if(!isPasswordValid){
        throw new ApiError("Invalid credentials",401);
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(res,{userId:user._id,role:user.role});
    const refreshToken = await generateRefreshToken(res , user._id.toString());

    return {
        user:{
            username:user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
        token,
        refreshToken
    }
};

export const userForgetPassword = async (email:string) =>{
    const user = await userModel.findOne({email});
    if (!user){
        return {email};
    }
    const resetToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_SIZE).toString('hex');
    const resetTokenExpiresAt = Date.now() + PASSWORD_RESET_EXPIRY;
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken  = hashedToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();
    const resetURL = `${process.env.CLIENT_URL}/auth/resetPassword/${resetToken}`;
    const subject = "Reset your password";
    const html = passwordResetRequestTemplate.replace("{resetURL}", resetURL);
    await sendEmail({to:email,subject,html});
    return {email}
}

export const userResetPassword = async(token:string,password:string)=>{
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userModel.findOne({resetPasswordToken:hashedToken,resetPasswordExpiresAt:{$gt:Date.now()}}).select("+password");
    if(!user){
        throw new ApiError("Invalid or expired reset token",400)
    }
    if (password.length < 6) {
        throw new ApiError("Password must be at least 6 characters",400);
	}
    const isSame = await comparePassword(password, user.password);
    if (isSame) {
        throw new ApiError("New password must be different from old password",400);
    }
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await RefreshTokenModel.deleteMany({user:user._id});
    return;
};

export const logoutUser = async(res:Response, refreshToken:string)=>{
    await RefreshTokenModel.deleteOne({token:refreshToken});
    clearAuthCookies(res);
};