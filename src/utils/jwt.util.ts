
import jwt , {JwtPayload} from 'jsonwebtoken';
import RefreshTokenModel from '../models/RefreshToken.model.js';
import ApiError from './error.util.js';
interface payloadJWt extends JwtPayload{
    userId : string,
    role : "customer" | "admin" | "vendor",
}; 

export const generateToken = (payload: payloadJWt): string => {
    const jwtSecret: string = process.env.JWT_SECRET || '';
    if (!jwtSecret) {
        throw new ApiError("Internal server error", 500);
    }
    const expiresIn: string = process.env.JWT_EXPIRE ?? "15m";
    const token = jwt.sign( payload, jwtSecret ,{ expiresIn }); // 
    return token;
}; // generate access token


export const generateRefreshToken = async (userId: string) : Promise<string>=>{
    const jwtSecret: string = process.env.REFRESH_TOKEN_SECRET || '';
    if (!jwtSecret){
        throw new ApiError("Internal server error", 500);
    }
    const expiresIn:string = process.env.REFRESH_TOKEN_EXPIRE ?? "7d";
    const RefreshToken = jwt.sign({userId},jwtSecret,{expiresIn});
    const expiresAt = new Date();
    const days = 7;
    expiresAt.setDate(expiresAt.getDate()+days); // 7 days from now
    // store in db
    await RefreshTokenModel.create({user:userId,token:RefreshToken,expiresAt});
    return RefreshToken;
}

export const verifyToken = (token: string): payloadJWt =>{
    const jwtSecret: string = process.env.JWT_SECRET || '';
    if (!jwtSecret){
        throw new ApiError("Internal server error", 500);
    }
    return jwt.verify(token, jwtSecret);
}

export const verifyRefreshToken =(token: string) : payloadJWt =>{
    const jwtSecret: string = process.env.REFRESH_TOKEN_SECRET || "";
    if (!jwtSecret){
        throw new ApiError("Internal server error", 500);
    }
    return jwt.verify(token, jwtSecret);
}