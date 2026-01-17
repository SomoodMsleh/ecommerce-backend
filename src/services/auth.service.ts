import userModel from "../models/User.model.js";
import { sendEmail } from "./email.service.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.util.js";
import { generateToken, generateRefreshToken, clearAuthCookies, verifyRefreshToken } from "../utils/jwt.util.js";
import ApiError from "../utils/error.util.js";
import { customAlphabet } from 'nanoid';
import { verificationEmailTemplate, welcomeEmailTemplate } from "../emailTemplates/verificationEmailTemplate.js";
import { Response, Request } from "express";
import crypto from "node:crypto";
import { passwordResetRequestTemplate } from "../emailTemplates/passwordResetRequestTemplate.js";
import RefreshTokenModel from "../models/RefreshToken.model.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import logger from "../utils/logger.util.js";
import redisClient from "../config/redis.config.js";


const VERIFICATION_CODE_LENGTH = 8;
const VERIFICATION_CODE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const PASSWORD_RESET_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour
const PASSWORD_RESET_TOKEN_SIZE = 32;
const MIN_PASSWORD_LENGTH = 6;
const FAILED_LOGIN_LIMIT = 5;
const FAILED_LOGIN_WINDOW = 30 * 60;


const generateVerificationCode = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    VERIFICATION_CODE_LENGTH
)

interface RegisterUserInput {
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phoneNumber?: string,
}

// Helper function to check failed login attempts
export const checkFailedLoginAttempts = async (email: string): Promise<void> => {
    const key = `failed_login:${email}`;
    const attempts = await redisClient.get(key);
    
    if (attempts && parseInt(attempts) >= FAILED_LOGIN_LIMIT) {
        const ttl = await redisClient.ttl(key);
        throw new ApiError(
            `Account temporarily locked. Too many failed login attempts. Try again in ${Math.ceil(ttl / 60)} minutes`,
            429
        );
    }
};

// Helper function to record failed login
export const recordFailedLogin = async (email: string): Promise<void> => {
    const key = `failed_login:${email}`;
    const current = await redisClient.incr(key);
    
    if (current === 1) {
        // Set 30 minute expiration on first failed attempt
        await redisClient.expire(key, FAILED_LOGIN_WINDOW);
    }
};

// Helper function to clear failed login attempts
export const clearFailedLoginAttempts = async (email: string): Promise<void> => {
    await redisClient.del(`failed_login:${email}`);
};


export const registerUser = async (userData: RegisterUserInput) => {
    const existingUser = await userModel.findOne({
        $or: [
            { username: userData.username.toLowerCase() },
            { email: userData.email.toLowerCase()}
        ]
    });

    if (existingUser) {
        if (existingUser.username.toLowerCase() === userData.username.toLowerCase()) {
            throw new ApiError('Username already exists', 409);
        }
        if (existingUser.email.toLowerCase() === userData.email.toLowerCase()) {
            throw new ApiError('Email already exists', 409);
        }
    }

    if (userData.password.length <  MIN_PASSWORD_LENGTH) {
        throw new ApiError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
    }
    const hashedPassword = await hashPassword(userData.password);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = Date.now() + VERIFICATION_CODE_EXPIRY;
    // Create user
    const user = await userModel.create({ 
        ...userData,
        username: userData.username.toLowerCase(),
        email: userData.email.toLowerCase(),
        password: hashedPassword, 
        verificationCode, 
        verificationCodeExpiresAt 
    });
    const html = verificationEmailTemplate.replace("{verificationCode}", verificationCode);
    try {
        await sendEmail({ to: user.email, subject: 'Verify your email', html });
    } catch (error) {
        logger.error('Failed to send verification email:', error);
        // Don't fail registration if email fails
    }
    return {
        user: {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
    };
};


export const verifyEmail = async (verificationCode: string) => {
    const user = await userModel.findOne({ verificationCode, verificationCodeExpiresAt: { $gt: Date.now() } });
    if (!user) {
        throw new ApiError("Invalid or expired verification code", 400);
    }
    if (user.isEmailVerified) {
        throw new ApiError("Email is already verified", 400);
    }
    user.isEmailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined;

    await user.save();

    const subject = `Welcome to ${process.env.APP_NAME} - Email Verified Successfully`;
    const html = welcomeEmailTemplate(user.username);
    try {
        await sendEmail({ to: user.email, subject, html });
    } catch (error) {
        logger.error('Failed to send welcome email:', error);
        // Don't fail verification if email fails
    }

    return {
        user: {
            username: user.username,
            email: user.email,
            isEmailVerified: user.isEmailVerified
        }
    }
};

export const resendVerificationEmail = async (email: string) => {
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
        // Don't reveal if user exists
        return { message: "If the email exists, a verification code has been sent" };
    }

    if (user.isEmailVerified) {
        throw new ApiError("Email is already verified", 400);
    }
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiresAt = Date.now() + VERIFICATION_CODE_EXPIRY;

    user.verificationCode = verificationCode;
    user.verificationCodeExpiresAt = verificationCodeExpiresAt;
    await user.save();

    // Send verification email
    const html = verificationEmailTemplate.replace("{verificationCode}", verificationCode);
    try {
        await sendEmail({ to: user.email, subject: 'Verify your email', html });
    } catch (error) {
        logger.error('Failed to resend verification email:', error);
        throw new ApiError("Failed to send verification email", 500);
    }

    logger.info(`Verification email resent to: ${user.email}`);
    return;
};

export const loginUser = async (res: Response, email: string, password: string) => {
    // Check for too many failed attempts
    await checkFailedLoginAttempts(email.toLowerCase());
    
    const user = await userModel.findOne({ emil:email.toLowerCase() }).select('+password');
    if (!user || !user.password) {
        await recordFailedLogin(email.toLowerCase());
        throw new ApiError("Invalid credentials", 401);
    }
    
    if (!user.isActive) {
        throw new ApiError("Account is disabled", 403);
    }
    
    if (!user.isEmailVerified) {
        throw new ApiError("Please confirm your email", 400);
    }
    
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        await recordFailedLogin(email.toLowerCase());
        throw new ApiError("Invalid credentials", 401);
    }
    
    // Clear failed attempts on successful login
    await clearFailedLoginAttempts(email.toLowerCase());

    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
        return {
            message: "Please provide 2FA code",
            twoFactorRequired: true,
            userId: user._id,
        }
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(res, { userId: user._id, role: user.role });
    const refreshToken = await generateRefreshToken(res, user._id.toString());
    logger.info(`User logged in: ${user.email}`);
    return {
        user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
        token,
        refreshToken
    }
};

export const userForgetPassword = async (email: string) => {
    const user = await userModel.findOne({ email:email.toLowerCase() });
    if (!user) {
        logger.warn(`Password reset requested for non-existent email: ${email}`);
        return { message: "If the email exists, a password reset link has been sent" };
    }
    
    if (!user.isActive) {
        logger.warn(`Password reset requested for deactivated account: ${email}`);
        return { message: "If the email exists, a password reset link has been sent" };
    }

    const resetToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_SIZE).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = Date.now() + PASSWORD_RESET_EXPIRY;

    await user.save();
    const resetURL = `${process.env.CLIENT_URL}/api/v1/auth/resetPassword/${resetToken}`;
    const subject = "Reset your password";
    const html = passwordResetRequestTemplate.replace("{resetURL}", resetURL);
    try {
        await sendEmail({ to: user.email, subject, html });
    } catch (error) {
        logger.error('Failed to send password reset email:', error);
        throw new ApiError("Failed to send password reset email", 500);
    }

    logger.info(`Password reset requested for user: ${user.email}`);
    return { email };
}

export const userResetPassword = async (token: string, password: string) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userModel.findOne({ resetPasswordToken: hashedToken, resetPasswordExpiresAt: { $gt: Date.now() } }).select("+password");
    if (!user) {
        throw new ApiError("Invalid or expired reset token", 400)
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }

    // Validate new password
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new ApiError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
    }

    // Ensure new password is different from old password
    if (user.password) {
        const isSame = await comparePassword(password, user.password);
        if (isSame) {
            throw new ApiError("New password must be different from current password", 400);
        }
    }
    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();
    await RefreshTokenModel.deleteMany({ user: user._id });
    logger.info(`Password reset completed for user: ${user.email}`);
    return;
};

export const logoutUser = async (res: Response, refreshToken: string) => {
    await RefreshTokenModel.deleteOne({ token: refreshToken });
    clearAuthCookies(res);
    logger.info('User logged out');
};

export const refreshAccessToken = async (res: Response, refreshToken: string) => {
    const decode = verifyRefreshToken(refreshToken);
    const storedToken = await RefreshTokenModel.findOne({ token: refreshToken, user: decode.userId });
    if (!storedToken) {
        throw new ApiError("Invalid refresh token", 400);
    }
    const user = await userModel.findById(decode.userId);
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    await generateToken(res, { userId: user._id, role: user.role });
    await RefreshTokenModel.deleteOne({ token: refreshToken });
    await generateRefreshToken(res, user._id.toString());
    logger.info(`Access token refreshed for user: ${user.email}`);
    return;
};

export const enable2FA = async (userId: string) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    if (user.isTwoFactorEnabled) {
        throw new ApiError("2FA is already enabled", 400);
    }
    const secret = speakeasy.generateSecret({
        name: `${process.env.APP_NAME} (${user.email})`,
        issuer: process.env.APP_NAME || 'EcommerceApp'
    });
    user.twoFactorTempSecret = secret.base32;
    await user.save();

    const qrImage = await QRCode.toDataURL(secret.otpauth_url!);
    logger.info(`2FA setup initiated for user: ${user.email}`);
    return {
        qrImage,
        message: "Scan this QR code with your authenticator app and verify with a code"
    };
};

export const verify2FA = async (userId: string, token: string) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }

    if (user.isTwoFactorEnabled) {
        throw new ApiError("2FA is already enabled", 400);
    }
    if (!user.twoFactorTempSecret) {
        throw new ApiError("2FA setup not initiated", 400);
    }
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorTempSecret,
        encoding: 'base32',
        token: token,
        window: 2 //  Allow a ±60s time drift to handle small clock differences between server and authenticator
    });
    if (!verified) {
        throw new ApiError("Invalid 2FA token", 400);
    }
    user.isTwoFactorEnabled = true;
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = undefined;
    await user.save()
    logger.info(`2FA enabled for user: ${user.email}`);
    return { message: "Two-factor authentication enabled successfully"  };
};

export const verify2FALogin = async (res: Response, userId: string, otp: string) => {
    const user = await userModel.findById(userId);
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
        throw new ApiError("2FA is not enabled for this account", 400);
    }
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: otp,
        window: 2 //  Allow a ±60s time drift to handle small clock differences between server and authenticator
    });
    if (!verified) {
        throw new ApiError("Invalid 2FA token", 400);
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = generateToken(res, { userId: user._id, role: user.role });
    const refreshToken = await generateRefreshToken(res, user._id.toString());
    logger.info(`2FA login successful for user: ${user.email}`);
    return {
        user: {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
        token,
        refreshToken
    }

};

// Require valid 2FA code in addition to password to disable 2FA
export const disable2FA = async (userId: string, password?: string, otp?: string) => {
    const user = await userModel.findById(userId).select('+password');
    if (!user) {
        throw new ApiError("User not found", 404);
    }
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
        throw new ApiError("2FA is not enabled", 400);
    }

    if (user.password) {
        if (!password) {
            throw new ApiError("Password is required", 400);
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError("Invalid password", 401);
        }
    }
    if (!otp) {
        throw new ApiError("2FA code is required to disable 2FA", 400);
    }
    const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: otp,
        window: 2
    });
    if (!verified) {
        throw new ApiError("Invalid 2FA code", 400);
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorTempSecret = undefined;
    await user.save();
    logger.info(`2FA disabled for user: ${user.email}`);
    return { message: "Two-factor authentication disabled successfully"};
};


export const handleOAuthSuccess = async (req: Request, res: Response, user: any) => {
    if (!user.isActive) {
        throw new ApiError("Account is deactivated", 403);
    }
    logger.info(`OAuth login successful for user:  ${user.email}`);

    if (user.isTwoFactorEnabled) {
        return {
            requires2FA: true,
            userId: user._id,
            message: "2FA verification required",
        };
    }
    user.lastLogin = Date.now();
    await user.save();

    const accessToken = generateToken(res, {
        userId: user._id.toString(),
        role: user.role,
    });

    const refreshToken = await generateRefreshToken(res, user._id.toString());

    return {
        requires2FA: false,
        user: {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
        },
        accessToken,
        refreshToken,
    };
};


