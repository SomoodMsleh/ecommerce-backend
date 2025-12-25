import Joi from "joi";
import ApiError from "../utils/error.util.js";
import { Request,Response,NextFunction } from "express";
const validation = (schema:Joi.ObjectSchema)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        const inputData = {...req.body,...req.params,...req.query}
        const validationResult = schema.validate(inputData,{abortEarly:false});
        if(validationResult?.error){
            const errors = validationResult.error.details.map(e => e.message);
            return next(new ApiError(errors.join(", "), 400));
        }
        next()
    };
};


export default validation;