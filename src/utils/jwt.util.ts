import { Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import RefreshTokenModel from '../models/RefreshToken.model.js';
import ApiError from './error.util.js';
interface payloadJWt extends JwtPayload {
    userId: string,
    role: "customer" | "admin" | "vendor",
};
export const generateToken  = (res: Response, payload: payloadJWt): string => {
    const jwtSecret: string = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
        throw new ApiError("Internal server error", 500);
    }
    const expiresIn: string = process.env.JWT_EXPIRE ?? "15m";
    const token = jwt.sign(payload, jwtSecret, { expiresIn }); // 
    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path:'/',
    });
    return token;
}; // generate access token

export const generateAccessTokenOnly = (res: Response, payload: payloadJWt): string => {
    const jwtSecret: string = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
        throw new ApiError("Internal server error", 500);
    }
    const expiresIn: string = process.env.JWT_EXPIRE ?? "15m";
    const token = jwt.sign(payload, jwtSecret, { expiresIn }); // 
    return token;
};

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
        secure: false,
        sameSite: 'lax' as const,
        path:'/',
    });
    return RefreshToken;
};

export const generateRefreshTokenOnly = async (res:Response, userId: string): Promise<string> => {
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
    return RefreshToken;
};

export const verifyToken = (token: string): payloadJWt => {
    try{
            const jwtSecret: string = process.env.JWT_SECRET || '';
        if (!jwtSecret) {
            throw new ApiError("Internal server error", 500);
        }
        return jwt.verify(token, jwtSecret) as payloadJWt;
    }catch(error){
        throw new ApiError("Invalid or expired token",401)        
    }
};

export const verifyRefreshToken = (token: string): { userId: string } => {
    try{
        const jwtSecret: string = process.env.REFRESH_TOKEN_SECRET || "";
        if (!jwtSecret) {
            throw new ApiError("Internal server error", 500);
        }
        return jwt.verify(token, jwtSecret);
    }catch(error){
        throw new ApiError("Invalid or expired refresh token",401)        
    }
};

export const clearAuthCookies = (res:Response):void=>{
    const options = {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
    };
    res.clearCookie('token', options);
    res.clearCookie('refreshToken', options);
};
