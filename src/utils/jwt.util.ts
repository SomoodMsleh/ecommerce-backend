import { Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import RefreshTokenModel from '../models/RefreshToken.model.js';
import ApiError from './error.util.js';
interface payloadJWt extends JwtPayload {
    userId: string,
    role: "customer" | "admin" | "vendor",
};

export const generateToken = (res: Response, payload: payloadJWt): string => {
    const jwtSecret: string = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
        throw new ApiError("Internal server error", 500);
    }
    const expiresIn: string = process.env.JWT_EXPIRE ?? "15m";
    const token = jwt.sign(payload, jwtSecret, { expiresIn }); // 
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return token;
}; // generate access token


export const generateRefreshToken = async (res:Response, userId: string): Promise<string> => {
    const jwtSecret: string = process.env.REFRESH_TOKEN_SECRET || '';
    if (!jwtSecret) {
        throw new ApiError("Internal server error", 500);
    }
    const expiresIn: string = process.env.REFRESH_TOKEN_EXPIRE ?? "7d";
    const RefreshToken = jwt.sign({ userId }, jwtSecret, { expiresIn });
    const expiresAt = new Date();
    const days = 7;
    expiresAt.setDate(expiresAt.getDate() + days); // 7 days from now
    // store in db
    await RefreshTokenModel.create({ user: userId, token: RefreshToken, expiresAt });
    res.cookie('refreshToken', RefreshToken , {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return RefreshToken;
}

export const verifyToken = (token: string): payloadJWt => {
    const jwtSecret: string = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
        throw new ApiError("Internal server error", 500);
    }
    return jwt.verify(token, jwtSecret);
}

export const verifyRefreshToken = (token: string): payloadJWt => {
    const jwtSecret: string = process.env.REFRESH_TOKEN_SECRET || "";
    if (!jwtSecret) {
        throw new ApiError("Internal server error", 500);
    }
    return jwt.verify(token, jwtSecret);
}