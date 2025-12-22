import {Request,Response,NextFunction} from "express";
import {successResponse} from "../utils/response.util.js";
import * as authServices from '../services/auth.service.js';



export const register = async (req:Request,res:Response,next:NextFunction)=>{
    const result = await authServices.registerUser(req.body);
    successResponse(res,201,'Registration successful', result)
} 