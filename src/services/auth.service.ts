import userModel from "../models/User.model.js";
import { sendEmail } from "./email.service.js";
import {hashPassword } from "../utils/bcrypt.util.js";
import { generateToken, generateRefreshToken } from "../utils/jwt.util.js";
import ApiError from "../utils/error.util.js";
import {customAlphabet} from 'nanoid';
import { verificationEmailTemplate , welcomeEmailTemplate} from "../emailTemplates/verificationEmailTemplate.js";


const VERIFICATION_CODE_LENGTH = 8;
const VERIFICATION_CODE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

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