import { Request, Response, NextFunction } from "express";
import { successResponse } from "../utils/response.util.js";
import * as authServices from '../services/auth.service.js';
import { AuthRequest } from "../middlewares/auth.middleware.js"
import ApiError from "../utils/error.util.js";



export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate input
        if (!req.body.username?.trim() || !req.body.email?.trim() || !req.body.password) {
            throw new ApiError('Username, email, and password are required', 400);
        }

        if (!req.body.firstName?.trim() || !req.body.lastName?.trim()) {
            throw new ApiError('First name and last name are required', 400);
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
            throw new ApiError('Invalid email format', 400);
        }

        // Validate username format (alphanumeric, underscore, hyphen only)
        const usernameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!usernameRegex.test(req.body.username)) {
            throw new ApiError('Username can only contain letters, numbers, underscores, and hyphens', 400);
        }

        if (req.body.username.length < 3 || req.body.username.length > 30) {
            throw new ApiError('Username must be between 3 and 30 characters', 400);
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
        if (!verificationCode?.trim()) {
                throw new ApiError("Verification code is required", 400);
            }
        const result = await authServices.verifyEmail(verificationCode);
        successResponse(res, 200, "Email verified successfully. You can now login.", result);
    } catch (error) {
        next(error);
    }
};

export const resendVerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.body.email;
        if (!email?.trim()) {
            throw new ApiError("email is required", 400);
        }
        await authServices.resendVerificationEmail(email);
        successResponse(res, 200, "If the email exists, a verification code has been sent");
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email?.trim() || !password) {
            throw new ApiError("Email and password are required", 400);
        }
        const result = await authServices.loginUser(res, email, password);
        successResponse(res, 200, "Logged in successfully", result);
    } catch (error) {
        next(error);
    }
};

export const forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.body.email;
        if (!email?.trim()) {
            throw new ApiError("Email is required", 400);
        }
        const result = await authServices.userForgetPassword(email);
        successResponse(res, 200, "If this email exists in our system, a password reset link has been sent", result);
    } catch (error) {
        next(error)
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.params.token;
        const password = req.body.password;
        if (!token?.trim() || !password) {
            throw new ApiError("Token and password are required", 400);
        }
        const result = await authServices.userResetPassword(token, password);
        successResponse(res, 200, "Password reset successfully", result);
    } catch (error) {
        next(error);
    }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if (refreshToken) {
            await authServices.logoutUser(res, refreshToken);
        }
        successResponse(res, 200, 'Logout successful');
    } catch (error) {
        next(error)
    }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken1 = req.cookies?.refreshToken || req.body.refreshToken;
        if (!refreshToken1) {
            throw new ApiError("Refresh token is required", 400)
        }
        const result = await authServices.refreshAccessToken(res, refreshToken1);
        successResponse(res, 200, 'Token refreshed', result);
    } catch (error) {
        next(error)
    }
};

export const enable2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id.toString();
        const result = await authServices.enable2FA(userId);
        successResponse(res, 200, '2FA setup initiated', result);
    } catch (error) {
        next(error)
    }
};


export const verify2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.body.token;
        if (!token?.trim()) {
            throw new ApiError("2FA token is required", 400);
        }
        const userId = req.user._id.toString();
        const result = await authServices.verify2FA(userId, token);
        successResponse(res, 200, '2FA verified successfully', result);
    } catch (error) {
        next(error)
    }
};

export const verify2FALogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, token } = req.body;
        if (!userId) {
            throw new ApiError("UserId is required", 400);
        }
        if (!token?.trim()) {
            throw new ApiError("2FA code is required", 400);
        }

        const result = await authServices.verify2FALogin(res, userId, token);
        successResponse(res, 200, "Login successful", result);
    } catch (error) {
        next(error)
    }
};


export const disable2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { password, otp } = req.body;
        if (!password) {
            throw new ApiError("Password is required", 400);
        }
        const userId = req.user._id.toString();
        const result = await authServices.disable2FA(userId, password, otp);
        successResponse(res, 200, '2FA disabled successfully', result);
    } catch (error) {
        next(error)
    }
};

export const googleCallback = async (req: AuthRequest, res: Response, next: NextFunction) => {

    const user = req.user as any;
    if (!user) {
        throw new ApiError("OAuth authentication failed",401)
    }

    try {
        const result = await authServices.handleOAuthSuccess(req,res,user);

        successResponse(res, 200, 'Google OAuth successful',result);
    }catch (error) {
        next(error)
    }
};

export const facebookCallback = async (req: AuthRequest, res: Response, next: NextFunction) => {

    const user = req.user as any;
    if (!user) {
        throw new ApiError("OAuth authentication failed",401)
    }

    try {
        const result = await authServices.handleOAuthSuccess(req,res,user);

        successResponse(res, 200, 'Facebook OAuth successful',result);
    }catch (error) {
        next(error)
    }
};


